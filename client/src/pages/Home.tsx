import { Ticker } from "@/components/Ticker";
import { Calculator, LineChart as ChartIcon, PieChart, Coins } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Live Ticker */}
      <Ticker />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary/5 pt-16 pb-24">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border/50 shadow-sm text-sm font-medium text-muted-foreground mb-6">
            <Coins className="w-4 h-4 text-primary" />
            <span>Türkiye'nin En Kolay Yatırım Hesaplayıcısı</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground mb-6 leading-tight">
            Paranızın Geçmişteki <br/>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Gerçek Değeri
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
            Geçmişte Dolar, Altın veya Borsa'ya yatırım yapsaydınız bugün ne kadar paranız olurdu? Hemen hesaplayın.
          </p>

          <Link href="/simulator">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-primary font-display rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0">
              <Calculator className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Yatırım Hesapla
            </button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4">
              <ChartIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Detaylı Grafikler</h3>
            <p className="text-muted-foreground">Yatırımınızın zaman içindeki değişimini interaktif grafiklerle inceleyin.</p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mb-4">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Çeşitli Araçlar</h3>
            <p className="text-muted-foreground">Dolar, Euro, Gram Altın, Çeyrek Altın ve BIST 100 verileriyle karşılaştırın.</p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enflasyon Analizi</h3>
            <p className="text-muted-foreground">Paranızın enflasyon karşısındaki reel getirisini görün (Yakında).</p>
          </div>
        </div>
      </div>

      <footer className="container mx-auto px-4 sm:px-6 mt-24 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 Yatırım Hesaplama. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
