import { Truck, ShieldCheck, Heart, Gem } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'Orders above ₹999', color: 'text-accent' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected', color: 'text-accent' },
  { icon: Gem, title: 'Premium Quality', desc: 'Best materials used', color: 'text-accent' },
  { icon: Heart, title: 'Made with Love', desc: 'Handcrafted with care', color: 'text-accent' },
];

export const FeaturesSection = () => {
  return (
    <section className="py-5 sm:py-8 bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 p-3.5 sm:p-5 rounded-2xl bg-card border border-border hover:border-accent/20 transition-all hover:shadow-lg shadow-sm group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/15 group-hover:bg-accent/15 transition-colors">
                <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">{feature.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
