
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't really need a DB for a calculator, but we'll follow the pattern.
// Maybe store user "saved calculations" if we wanted to extended it later.
// For now, we will just use schema for type definitions of the API.

export const investmentTypes = ["USD", "EUR", "GA", "CEYREK", "BIST"] as const;

// API Request/Response Types (No DB tables needed for the calculator itself)

export const calculateRequestSchema = z.object({
  amount: z.number().positive(),
  date: z.string(), // YYYY-MM-DD
  type: z.enum(investmentTypes),
});

export type CalculateRequest = z.infer<typeof calculateRequestSchema>;

export const marketDataSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(), // Percentage change
  lastUpdate: z.string(),
  name: z.string(),
});

export type MarketData = z.infer<typeof marketDataSchema>;

export const calculationResultSchema = z.object({
  initialAmount: z.number(),
  finalAmount: z.number(),
  percentageChange: z.number(),
  profit: z.number(),
  currency: z.string(), // "TRY"
  history: z.array(z.object({
    date: z.string(),
    value: z.number()
  }))
});

export type CalculationResult = z.infer<typeof calculationResultSchema>;
