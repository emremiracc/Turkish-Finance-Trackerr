import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type CalculateRequest } from "@shared/routes";
import { z } from "zod";

// GET /api/rates/live
export function useLiveRates() {
  return useQuery({
    queryKey: [api.rates.live.path],
    queryFn: async () => {
      const res = await fetch(api.rates.live.path);
      if (!res.ok) throw new Error("Döviz kurları alınamadı");
      return api.rates.live.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// POST /api/simulate
export function useCalculateInvestment() {
  return useMutation({
    mutationFn: async (data: CalculateRequest) => {
      // Zod parser ensures type safety before sending
      const validated = api.simulate.calculate.input.parse(data);
      
      const res = await fetch(api.simulate.calculate.path, {
        method: api.simulate.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Hesaplama hatası");
        }
        throw new Error("Hesaplama yapılamadı");
      }

      return api.simulate.calculate.responses[200].parse(await res.json());
    },
  });
}

// POST /api/simulate/compare
export function useCompareInvestments() {
  return useMutation({
    mutationFn: async (data: Omit<CalculateRequest, 'type'>) => {
      const res = await fetch(api.simulate.compare.path, {
        method: api.simulate.compare.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Karşılaştırma hatası");
        }
        throw new Error("Karşılaştırma yapılamadı");
      }

      return api.simulate.compare.responses[200].parse(await res.json());
    },
  });
}
