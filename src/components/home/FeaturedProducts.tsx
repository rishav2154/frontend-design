import { ArrowRight, Loader2, Zap, TrendingUp, Star, Timer, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts, useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { useState, useEffect } from 'react';

// Countdown timer component
const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 11, minutes: 45, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      {[pad(time.hours), pad(time.minutes), pad(time.seconds)].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-background text-foreground text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded-md border border-border/50">
            {val}
          </span>
          {i < 2 && <span className="text-muted-foreground text-xs font-bold">:</span>}
        </span>
      ))}
    </div>
  );
};

interface ProductRowProps {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  products: any[];
  isLoading: boolean;
  bgClass?: string;
  showTimer?: boolean;
}

const ProductRow = ({ title, icon, badge, badgeColor = "bg-accent", products, isLoading, bgClass = "bg-card", showTimer }: ProductRowProps) => (
  <section className={`py-4 sm:py-7 ${bgClass}`}>
    <div className="container mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-xl font-bold text-foreground">{title}</h2>
              {badge && (
                <span className={`${badgeColor} text-accent-foreground text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse`}>
                  {badge}
                </span>
              )}
            </div>
            {showTimer && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] sm:text-xs text-muted-foreground">Ends in</span>
                <CountdownTimer />
              </div>
            )}
          </div>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-accent text-xs sm:text-sm font-medium hover:gap-2 transition-all"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-accent" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  </section>
);

// Enhanced offer banners
const OfferBanner = () => (
  <section className="py-3 sm:py-5 bg-background">
    <div className="container mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { img: "https://images.unsplash.com/photo-1549465220-1a8b9238f37e?w=400&q=80", label: "COMBO DEALS", title: "Up to 40% Off", sub: "Gift Combos", link: "/shop?category=combos", gradient: "from-black/70 via-black/50 to-transparent" },
          { img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80", label: "NEW ARRIVALS", title: "Photo Frames", sub: "Starting ₹449", link: "/shop?category=frames", gradient: "from-black/70 via-black/50 to-transparent" },
          { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", label: "TRENDING", title: "Custom Tees", sub: "From ₹299", link: "/shop?category=tshirts", gradient: "from-black/70 via-black/50 to-transparent" },
          { img: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80", label: "BEST SELLER", title: "Phone Covers", sub: "From ₹199", link: "/shop?category=phone-covers", gradient: "from-black/70 via-black/50 to-transparent" },
        ].map((item, i) => (
          <Link key={i} to={item.link} className="relative rounded-2xl overflow-hidden aspect-[3/2] group border border-border shadow-sm hover:shadow-lg transition-shadow">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`} />
            <div className="absolute inset-0 flex flex-col justify-center p-3 sm:p-5">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 tracking-widest uppercase mb-1">{item.label}</span>
              <p className="text-base sm:text-xl font-bold text-white leading-tight">{item.title}</p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">{item.sub}</p>
              <span className="mt-2 text-[10px] sm:text-xs font-semibold text-amber-400 flex items-center gap-1">
                Shop Now <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export const FeaturedProducts = () => {
  const { data: featuredProducts = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: allProducts = [], isLoading: allLoading } = useProducts();

  return (
    <>
      <ProductRow
        title="Deals of the Day"
        icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        badge="LIVE"
        badgeColor="bg-destructive"
        products={featuredProducts}
        isLoading={featuredLoading}
        bgClass="bg-muted/30"
        showTimer
      />

      <OfferBanner />

      <ProductRow
        title="Trending Now"
        icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
        badge="HOT"
        badgeColor="bg-accent"
        products={allProducts}
        isLoading={allLoading}
        bgClass="bg-background"
      />

      <ProductRow
        title="Top Rated"
        icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />}
        products={allProducts.slice().reverse()}
        isLoading={allLoading}
        bgClass="bg-muted/30"
      />
    </>
  );
};
