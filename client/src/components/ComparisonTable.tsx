import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface ComparisonResult {
  type: string;
  finalAmount: number;
  percentageChange: number;
  profit: number;
}

interface ComparisonTableProps {
  results: ComparisonResult[];
  initialAmount: number;
}

export function ComparisonTable({ results, initialAmount }: ComparisonTableProps) {
  const typeEmojis: Record<string, string> = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    GA: "🏆",
    CEYREK: "✨",
    BIST: "📈",
  };

  const typeLabels: Record<string, string> = {
    USD: "Amerikan Doları",
    EUR: "Euro",
    GA: "Gram Altın",
    CEYREK: "Çeyrek Altın",
    BIST: "BIST 100",
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val);

  // Find best performer
  const bestIdx = results.reduce((maxIdx, curr, idx, arr) =>
    curr.percentageChange > arr[maxIdx].percentageChange ? idx : maxIdx
  , 0);

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-display font-bold">Karşılaştırma Tablosu</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {formatMoney(initialAmount)} yatırımın bugünkü değeri
        </p>
      </div>
      
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-bold">Varlık</TableHead>
            <TableHead className="text-right font-bold">Bugünkü Değer</TableHead>
            <TableHead className="text-right font-bold">Kâr/Zarar</TableHead>
            <TableHead className="text-right font-bold">Getiri %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, idx) => {
            const isProfit = result.profit >= 0;
            const isBest = idx === bestIdx;
            
            return (
              <TableRow
                key={result.type}
                className={`border-border/50 ${
                  isBest ? "bg-yellow-50/50 dark:bg-yellow-950/20" : ""
                }`}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeEmojis[result.type] || "📊"}</span>
                    <div>
                      <div>{typeLabels[result.type] || result.type}</div>
                      {isBest && <div className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">🥇 En İyi</div>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  {formatMoney(result.finalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-medium ${isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatMoney(Math.abs(result.profit))}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
                    ${isProfit
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                    }
                  `}>
                    {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {isProfit ? "+" : ""}%{result.percentageChange.toFixed(2)}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
