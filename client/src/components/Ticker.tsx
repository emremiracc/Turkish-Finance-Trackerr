import { useLiveRates } from "@/hooks/use-finance";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Ticker() {
  const { data: rates, isLoading, error } = useLiveRates();

  if (error) return null;

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-3 px-4 bg-card/50 border-b border-border/50">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-card/50 border-b border-border/50 backdrop-blur-sm">
      <div className="animate-ticker flex whitespace-nowrap py-3">
        {/* Duplicate list for seamless loop */}
        {[...(rates || []), ...(rates || [])].map((rate, i) => (
          <div
            key={`${rate.symbol}-${i}`}
            className="inline-flex items-center mx-6 space-x-2"
          >
            <span className="font-bold text-foreground font-display text-sm tracking-wide">
              {rate.name}
            </span>
            <span className="font-mono text-sm font-medium">
              {rate.price.toFixed(2)}
            </span>
            <span
              className={`text-xs flex items-center font-bold px-1.5 py-0.5 rounded-full ${
                rate.change > 0
                  ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : rate.change < 0
                  ? "text-rose-700 bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400"
                  : "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {rate.change > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : rate.change < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <Minus className="w-3 h-3 mr-1" />
              )}
              %{Math.abs(rate.change).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
