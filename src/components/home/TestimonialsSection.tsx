import { Star, Verified } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    content: "Amazing quality! The mug I ordered for my mom's birthday was perfect. She loved it!",
    rating: 5,
    product: 'Photo Mug',
    verified: true,
  },
  {
    id: 2,
    name: 'Michael C.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    content: "Great t-shirt quality and the print is vibrant. Family reunion shirts were a hit!",
    rating: 5,
    product: 'Custom Tee',
    verified: true,
  },
  {
    id: 3,
    name: 'Emily R.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    content: "The photo frames are beautifully crafted. Fast delivery too. Will order again!",
    rating: 5,
    product: 'Photo Frame',
    verified: true,
  },
  {
    id: 4,
    name: 'David T.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    content: "Custom phone case looks exactly like the preview. Excellent quality and fit.",
    rating: 5,
    product: 'Phone Cover',
    verified: true,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-5 sm:py-8 bg-muted/50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent fill-accent" />
            </div>
            <div>
              <h2 className="text-sm sm:text-xl font-bold text-foreground">What Customers Say</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Based on 2,500+ reviews</p>
            </div>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-accent/10 rounded-xl border border-accent/20">
            <span className="text-lg sm:text-xl font-bold text-accent">4.9</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-accent text-accent" />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-accent/20 transition-all hover:shadow-lg shadow-sm group"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-border/40 ring-offset-1 ring-offset-background"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{t.name}</p>
                    {t.verified && <Verified className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t.product}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-foreground/75 line-clamp-3 leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
