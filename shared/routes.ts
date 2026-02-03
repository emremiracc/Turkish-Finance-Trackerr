
import { z } from 'zod';
import { calculateRequestSchema, marketDataSchema, calculationResultSchema } from './schema';

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
