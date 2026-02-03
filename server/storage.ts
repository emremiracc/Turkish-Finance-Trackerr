
import { marketDataSchema, type MarketData } from "@shared/schema";

// In-memory cache for live rates to avoid hitting limits
let ratesCache: MarketData[] = [];
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export interface IStorage {
  // We don't strictly need persistent storage for the calculator,
  // but we'll implement the interface pattern.
  getLiveRates(): Promise<MarketData[]>;
  setLiveRates(rates: MarketData[]): Promise<void>;
}

export class MemStorage implements IStorage {
  async getLiveRates(): Promise<MarketData[]> {
    if (Date.now() - lastFetch < CACHE_TTL && ratesCache.length > 0) {
      return ratesCache;
    }
    return [];
  }

  async setLiveRates(rates: MarketData[]): Promise<void> {
    ratesCache = rates;
    lastFetch = Date.now();
  }
}

export const storage = new MemStorage();
