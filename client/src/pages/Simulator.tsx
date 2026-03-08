import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, CalendarIcon, Calculator } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { useCalculateInvestment, useCompareInvestments } from "@/hooks/use-finance";
import { InvestmentResult } from "@/components/InvestmentResult";
import { ComparisonTable } from "@/components/ComparisonTable";
import { investmentTypes, type CalculationResult } from "@shared/schema";
import { Ticker } from "@/components/Ticker";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form Schemas
const calculateFormSchema = z.object({
  amount: z.coerce.number().min(1, "En az 1 TL girmelisiniz").positive(),
  type: z.enum(investmentTypes),
  date: z.date({
    required_error: "Lütfen bir tarih seçin",
  }),
});

const compareFormSchema = z.object({
  amount: z.coerce.number().min(1, "En az 1 TL girmelisiniz").positive(),
  date: z.date({
    required_error: "Lütfen bir tarih seçin",
  }),
});

const typeLabels: Record<string, string> = {
  USD: "Amerikan Doları (USD)",
  EUR: "Euro (EUR)",
  GA: "Gram Altın",
  CEYREK: "Çeyrek Altın",
  BIST: "BIST 100 Endeksi",
};

export default function Simulator() {
  const [tab, setTab] = useState<"calculate" | "compare">("calculate");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("USD");
  const [compareAmount, setCompareAmount] = useState<number>(0);
  
  const { mutate: calculate, isPending: isCalculating } = useCalculateInvestment();
  const { mutate: compare, isPending: isComparing } = useCompareInvestments();

  const calculateForm = useForm<z.infer<typeof calculateFormSchema>>({
    resolver: zodResolver(calculateFormSchema),
    defaultValues: {
      amount: 1000,
      type: "USD",
      date: undefined,
    },
  });

  const compareForm = useForm<z.infer<typeof compareFormSchema>>({
    resolver: zodResolver(compareFormSchema),
    defaultValues: {
      amount: 1000,
      date: undefined,
    },
  });

  function onCalculateSubmit(values: z.infer<typeof calculateFormSchema>) {
    setSelectedType(values.type);
    calculate({
      amount: values.amount,
      type: values.type,
      date: format(values.date, "yyyy-MM-dd"),
    }, {
      onSuccess: (data) => {
        setResult(data);
        setCompareResults([]);
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      onError: (error) => {
        console.error(error);
      }
    });
  }

  function onCompareSubmit(values: z.infer<typeof compareFormSchema>) {
    setCompareAmount(values.amount);
    compare({
      amount: values.amount,
      date: format(values.date, "yyyy-MM-dd"),
    }, {
      onSuccess: (data) => {
        setCompareResults(data);
        setResult(null);
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      onError: (error) => {
        console.error(error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Ticker />
      
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <Link href="/">
            <a className="mr-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-6 h-6" />
            </a>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Yatırım Hesaplama</h1>
            <p className="text-muted-foreground">Geçmiş yatırım getirilerini hesaplayın</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Form Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Hesaplama</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="calculate">Hesapla</TabsTrigger>
                    <TabsTrigger value="compare">Karşılaştır</TabsTrigger>
                  </TabsList>

                  {/* Hesapla Tab */}
                  <TabsContent value="calculate" className="space-y-6">
                    <Form {...calculateForm}>
                      <form onSubmit={calculateForm.handleSubmit(onCalculateSubmit)} className="space-y-6">
                        <FormField
                          control={calculateForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Yatırım Tutarı (TL)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₺</span>
                                  <Input 
                                    type="number" 
                                    placeholder="1000" 
                                    className="pl-8 text-lg font-mono" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={calculateForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Yatırım Aracı</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(typeLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={calculateForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Geçmiş Tarih</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal border-input hover:bg-background hover:text-foreground",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "d MMMM yyyy", { locale: tr })
                                      ) : (
                                        <span>Tarih seçin</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    locale={tr}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Sadece geçmiş tarihler seçilebilir.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                          disabled={isCalculating}
                        >
                          {isCalculating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Hesaplanıyor...
                            </>
                          ) : (
                            <>
                              <Calculator className="mr-2 h-5 w-5" />
                              Hesapla
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* Karşılaştır Tab */}
                  <TabsContent value="compare" className="space-y-6">
                    <Form {...compareForm}>
                      <form onSubmit={compareForm.handleSubmit(onCompareSubmit)} className="space-y-6">
                        <FormField
                          control={compareForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Yatırım Tutarı (TL)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₺</span>
                                  <Input 
                                    type="number" 
                                    placeholder="1000" 
                                    className="pl-8 text-lg font-mono" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={compareForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Geçmiş Tarih</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "h-12 w-full pl-3 text-left font-normal border-input hover:bg-background hover:text-foreground",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "d MMMM yyyy", { locale: tr })
                                      ) : (
                                        <span>Tarih seçin</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    locale={tr}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Sadece geçmiş tarihler seçilebilir.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                          disabled={isComparing}
                        >
                          {isComparing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Karşılaştırılıyor...
                            </>
                          ) : (
                            <>
                              <Calculator className="mr-2 h-5 w-5" />
                              Karşılaştır
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8" id="results-section">
            {result ? (
              <InvestmentResult result={result} type={selectedType} />
            ) : compareResults.length > 0 ? (
              <ComparisonTable results={compareResults} initialAmount={compareAmount} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card/50 rounded-2xl border-2 border-dashed border-border/60">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground mb-2">Henüz Hesaplama Yapılmadı</h3>
                <p className="text-muted-foreground max-w-sm">
                  Yandaki formu kullanarak yatırım tutarınızı ve tarihini girin, sonucunu hemen görün.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
