
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import yahooFinanceDefault from 'yahoo-finance2';

// Handle yahoo-finance2 export (Class vs Instance issue)
// @ts-ignore
const yahooFinance = typeof yahooFinanceDefault === 'function' ? new yahooFinanceDefault() : yahooFinanceDefault;

// Map our internal types to Yahoo Finance symbols
const SYMBOLS = {
  USD: 'TRY=X',      // USD to TRY
  EUR: 'EURTRY=X',   // EUR to TRY
  GA: 'GC=F',        // Gold Futures (USD) - We need to convert to TRY/Gram
  BIST: 'XU100.IS',  // BIST 100
  CEYREK: 'GC=F'     // Derived from Gold
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Get Live Rates
  app.get(api.rates.live.path, async (req, res) => {
    try {
      // Try to get cached rates first (implemented in storage layer logic or here)
      // For simplicity, we'll fetch fresh or use a simple memory cache in this route
      // extending the storage pattern.
      
      const cached = await storage.getLiveRates();
      if (cached.length > 0) {
        return res.json(cached);
      }

      const quotes = await yahooFinance.quote([
        SYMBOLS.USD, SYMBOLS.EUR, SYMBOLS.GA, SYMBOLS.BIST
      ]);

      const usdTry = quotes.find(q => q.symbol === SYMBOLS.USD)?.regularMarketPrice || 0;
      const eurTry = quotes.find(q => q.symbol === SYMBOLS.EUR)?.regularMarketPrice || 0;
      const goldUsd = quotes.find(q => q.symbol === SYMBOLS.GA)?.regularMarketPrice || 0;
      const bist100 = quotes.find(q => q.symbol === SYMBOLS.BIST)?.regularMarketPrice || 0;

      // Calculate Gram Gold (Approx: Ounce / 31.1035 * USD/TRY)
      const gramGoldTry = (goldUsd / 31.1035) * usdTry;
      
      // Calculate Quarter Gold (Approx: Gram * 1.605 * 1.02 for markup usually, but let's stick to standard math: 1.754g usually)
      // Standard Quarter Gold is 1.754 grams of 22k, but conceptually users often track "Small Gold".
      // Let's use simple Gram Gold * 1.63 (approx market multiplier for Ceyrek) or standard 1.754g.
      // Standard: 1.754 grams.
      const ceyrekTry = gramGoldTry * 1.63; // Approximate market price

      const rates = [
        {
          symbol: 'USD',
          name: 'Dolar',
          price: usdTry,
          change: quotes.find(q => q.symbol === SYMBOLS.USD)?.regularMarketChangePercent || 0,
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'EUR',
          name: 'Euro',
          price: eurTry,
          change: quotes.find(q => q.symbol === SYMBOLS.EUR)?.regularMarketChangePercent || 0,
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'GA',
          name: 'Gram Altın',
          price: gramGoldTry,
          change: quotes.find(q => q.symbol === SYMBOLS.GA)?.regularMarketChangePercent || 0,
          lastUpdate: new Date().toISOString()
        },
        {
          symbol: 'BIST',
          name: 'BIST 100',
          price: bist100,
          change: quotes.find(q => q.symbol === SYMBOLS.BIST)?.regularMarketChangePercent || 0,
          lastUpdate: new Date().toISOString()
        }
      ];

      await storage.setLiveRates(rates);
      res.json(rates);
    } catch (error) {
      console.error('Yahoo Finance Error:', error);
      res.status(500).json({ message: 'Failed to fetch rates' });
    }
  });

  // Simulator Endpoint
  app.post(api.simulate.calculate.path, async (req, res) => {
    try {
      const { amount, date, type } = api.simulate.calculate.input.parse(req.body);
      
      const symbol = SYMBOLS[type as keyof typeof SYMBOLS];
      const startDate = new Date(date);
      const today = new Date();

      // Ensure start date is not in future
      if (startDate > today) {
        return res.status(400).json({ message: 'Gelecek tarih seçilemez.' });
      }

      // Fetch historical data
      const queryOptions = {
        period1: date,
        period2: today.toISOString().split('T')[0],
        interval: '1d' as const
      };

      // We need USD/TRY history for gold conversion if type is Gold
      let historyData: any[] = [];
      let usdHistory: any[] = [];

      try {
        historyData = await yahooFinance.historical(symbol, queryOptions);
        if (type === 'GA' || type === 'CEYREK') {
           usdHistory = await yahooFinance.historical(SYMBOLS.USD, queryOptions);
        }
      } catch (e) {
        console.error("Historical fetch error:", e);
        return res.status(400).json({ message: 'Geçmiş veri bulunamadı.' });
      }

      if (!historyData || historyData.length === 0) {
        return res.status(400).json({ message: 'Bu tarih için veri yok.' });
      }

      // Process history to match dates and calculate value in TRY
      const resultHistory = historyData.map(day => {
        let price = day.close;
        const dateStr = day.date.toISOString().split('T')[0];

        // Conversions
        if (type === 'GA' || type === 'CEYREK') {
          // Find matching USD rate
          const usdRate = usdHistory.find(u => u.date.toISOString().split('T')[0] === dateStr)?.close || 0;
          const gramPrice = (price / 31.1035) * usdRate; // Ounce -> Gram TRY
          if (type === 'GA') price = gramPrice;
          if (type === 'CEYREK') price = gramPrice * 1.63;
        }

        return {
          date: dateStr,
          price: price
        };
      }).filter(h => h.price > 0);

      if (resultHistory.length === 0) {
        return res.status(400).json({ message: 'Veri işlenemedi.' });
      }

      const startPrice = resultHistory[0].price;
      const endPrice = resultHistory[resultHistory.length - 1].price;

      const units = amount / startPrice;
      const finalAmount = units * endPrice;
      const profit = finalAmount - amount;
      const percentageChange = ((finalAmount - amount) / amount) * 100;

      res.json({
        initialAmount: amount,
        finalAmount: Math.round(finalAmount * 100) / 100,
        percentageChange: Math.round(percentageChange * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        currency: 'TRY',
        history: resultHistory.map(h => ({
          date: h.date,
          value: Math.round(units * h.price * 100) / 100
        }))
      });

    } catch (error) {
      console.error('Calculation Error:', error);
      res.status(500).json({ message: 'Hesaplama hatası' });
    }
  });

  // Comparison Endpoint
  app.post(api.simulate.compare.path, async (req, res) => {
    try {
      const { amount, date } = api.simulate.compare.input.parse(req.body);
      const types: (keyof typeof SYMBOLS)[] = ['USD', 'EUR', 'GA', 'BIST'];
      const today = new Date();

      const results = await Promise.all(types.map(async (type) => {
        try {
          const symbol = SYMBOLS[type];
          const queryOptions = {
            period1: date,
            period2: today.toISOString().split('T')[0],
            interval: '1d' as const
          };

          const [historyData, usdHistory] = await Promise.all([
            yahooFinance.historical(symbol, queryOptions),
            (type === 'GA') ? yahooFinance.historical(SYMBOLS.USD, queryOptions) : Promise.resolve([])
          ]);

          if (!historyData || historyData.length === 0) return null;

          const startDay = historyData[0];
          const endDay = historyData[historyData.length - 1];
          
          let startPrice = startDay.close;
          let endPrice = endDay.close;

          if (type === 'GA') {
            const startUsd = usdHistory.find(u => u.date.toISOString().split('T')[0] === startDay.date.toISOString().split('T')[0])?.close || 0;
            const endUsd = usdHistory.find(u => u.date.toISOString().split('T')[0] === endDay.date.toISOString().split('T')[0])?.close || 0;
            startPrice = (startPrice / 31.1035) * startUsd;
            endPrice = (endPrice / 31.1035) * endUsd;
          }

          const units = amount / startPrice;
          const finalAmount = units * endPrice;
          const profit = finalAmount - amount;
          const percentageChange = ((finalAmount - amount) / amount) * 100;

          return {
            type,
            finalAmount: Math.round(finalAmount * 100) / 100,
            percentageChange: Math.round(percentageChange * 100) / 100,
            profit: Math.round(profit * 100) / 100
          };
        } catch (e) {
          return null;
        }
      }));

      res.json(results.filter(r => r !== null));
    } catch (error) {
      res.status(500).json({ message: 'Karşılaştırma hatası' });
    }
  });

  return httpServer;
}
