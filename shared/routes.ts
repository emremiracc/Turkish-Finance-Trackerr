
import { z } from 'zod';
import { calculateRequestSchema, marketDataSchema, calculationResultSchema, investmentTypes } from './schema';

export const api = {
  rates: {
    live: {
      method: 'GET' as const,
      path: '/api/rates/live',
      responses: {
        200: z.array(marketDataSchema),
      },
    },
  },
  simulate: {
    calculate: {
      method: 'POST' as const,
      path: '/api/simulate',
      input: calculateRequestSchema,
      responses: {
        200: calculationResultSchema,
        400: z.object({ message: z.string() }),
      },
    },
    compare: {
      method: 'POST' as const,
      path: '/api/simulate/compare',
      input: calculateRequestSchema.omit({ type: true }),
      responses: {
        200: z.array(z.object({
          type: z.enum(investmentTypes),
          finalAmount: z.number(),
          percentageChange: z.number(),
          profit: z.number()
        })),
        400: z.object({ message: z.string() }),
      },
    },
  },
};

// Helper for URL building
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
