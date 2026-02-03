import { type CalculationResult } from "@shared/schema";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface InvestmentResultProps {
  result: CalculationResult;
}

export function InvestmentResult({ result }: InvestmentResultProps) {
  const isProfit = result.profit >= 0;
  
  // Format currency
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Result Card */}
        <div className={`
          p-6 rounded-2xl border-2 shadow-sm
          ${isProfit 
            ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50" 
            : "bg-rose-50/50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50"
          }
        `}>
          <div className="flex items-center gap-3 mb-2 text-muted-foreground font-medium text-sm">
            <TrendingUp className="w-4 h-4" />
            Bugünkü Değer
          </div>
          <div className="text-4xl font-display font-bold text-foreground tracking-tight">
            {formatMoney(result.finalAmount)}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className={`
              px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5
              ${isProfit 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
              }
            `}>
              {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isProfit ? "+" : ""}%{Math.abs(result.percentageChange).toFixed(2)}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {isProfit ? "Net Kar" : "Net Zarar"}: {formatMoney(Math.abs(result.profit))}
            </span>
          </div>
        </div>

        {/* Initial Amount Card */}
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col justify-center">
          <div className="text-sm font-medium text-muted-foreground mb-1">Başlangıç Yatırımı</div>
          <div className="text-2xl font-display font-bold text-foreground">
            {formatMoney(result.initialAmount)}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Yatırım Tarihi: <span className="font-medium text-foreground">{format(new Date(result.history[0].date), "d MMMM yyyy", { locale: tr })}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
        <h3 className="text-lg font-display font-bold mb-6">Zaman İçindeki Değişim</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.history}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isProfit ? "#10b981" : "#f43f5e"} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={isProfit ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), "MMM yy", { locale: tr })}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(val) => new Intl.NumberFormat('tr-TR', { notation: "compact", compactDisplay: "short" }).format(val)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                formatter={(value: number) => [formatMoney(value), "Değer"]}
                labelFormatter={(label) => format(new Date(label), "d MMMM yyyy", { locale: tr })}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isProfit ? "#10b981" : "#f43f5e"} 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: isProfit ? "#10b981" : "#f43f5e" }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
