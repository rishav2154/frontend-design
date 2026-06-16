import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Mic } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { SearchDialog } from "@/components/search/SearchDialog";

const heroSlides = [
  {
    id: "slide1",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80",
    title: "Up to 60% Off",
    subtitle: "Premium Custom T-Shirts",
    cta: "Shop Now",
    link: "/shop?category=tshirts",
  },
  {
    id: "slide2",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1920&q=80",
    title: "Starting ₹299",
    subtitle: "Designer Photo Mugs",
    cta: "Order Now",
    link: "/shop?category=mugs",
  },
  {
    id: "slide3",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1920&q=80",
    title: "New Arrivals",
    subtitle: "Custom Phone Covers",
    cta: "Explore",
    link: "/shop?category=phone-covers",
  },
  {
    id: "slide4",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1920&q=80",
    title: "Flat 40% Off",
    subtitle: "Elegant Photo Frames",
    cta: "Buy Now",
    link: "/shop?category=frames",
  },
  {
    id: "slide5",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1920&q=80",
    title: "Best Value Deals",
    subtitle: "Gift Combos from ₹799",
    cta: "Shop Combos",
    link: "/shop?category=combos",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > 50) goToPrev();
      else if (info.offset.x < -50) goToNext();
    },
    [goToPrev, goToNext]
  );

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative w-full pt-20 sm:pt-22 md:pt-24">
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Main Banner */}
      <motion.div
        className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[460px] overflow-hidden bg-card"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.subtitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4 sm:px-8 lg:px-16">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="max-w-lg"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold bg-accent/15 text-accent rounded-full border border-accent/25 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    {slide.subtitle}
                  </span>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight">
                    {slide.title}
                  </h2>
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3.5 bg-accent text-accent-foreground font-semibold text-xs sm:text-sm rounded-xl hover:brightness-110 transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:translate-y-[-1px]"
                  >
                    {slide.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-card/70 hover:bg-card/90 backdrop-blur-sm border border-border/40 transition-all shadow-lg hover:scale-105"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-card/70 hover:bg-card/90 backdrop-blur-sm border border-border/40 transition-all shadow-lg hover:scale-105"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentSlide(i);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 8000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-8 bg-accent shadow-md shadow-accent/40"
                  : "w-2 bg-foreground/25 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Search Bar */}
      <div className="container mx-auto px-3 sm:px-4 -mt-6 sm:-mt-7 relative z-10">
        <div
          onClick={() => setSearchOpen(true)}
          className="flex items-center bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl shadow-background/30 px-4 py-3 sm:py-4 cursor-pointer hover:border-accent/40 transition-all group max-w-2xl mx-auto hover:shadow-accent/5 light:bg-card light:border-border"
        >
          <Search className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
          <span className="ml-3 text-sm text-muted-foreground flex-1">Search for products, gifts, and more...</span>
          <span className="ml-auto px-4 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hidden sm:block">
            Search
          </span>
        </div>
      </div>
    </section>
  );
};
