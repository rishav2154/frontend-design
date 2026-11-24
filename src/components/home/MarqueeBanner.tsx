import { Check, Image, ShieldCheck, Smartphone } from 'lucide-react';

const promises = [
  {
    icon: Smartphone,
    title: 'Exact model first',
    description: 'Choose the phone and finish before ordering.',
  },
  {
    icon: Image,
    title: 'Your image, your way',
    description: 'Upload a photo and see it in the preview.',
  },
  {
    icon: Check,
    title: 'Review every detail',
    description: 'Keep choices visible before adding to cart.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected checkout',
    description: 'Complete the order through secure checkout.',
  },
];

export const MarqueeBanner = () => {
  return (
    <section className="home-promise-strip relative -mt-5 px-4 pb-5 sm:-mt-8 sm:px-6 lg:px-8" aria-label="How ordering works">
      <div className="home-shell">
        <div className="home-promise-rail liquid-glass-raised grid grid-cols-2 md:grid-cols-4">
          {promises.map((item) => (
            <div key={item.title} className="home-promise-item flex min-h-[136px] flex-col justify-center px-4 py-5 sm:min-h-[148px] sm:px-6">
              <span className="home-promise-icon mb-3">
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-foreground sm:text-xs">{item.title}</p>
              <p className="mt-1.5 max-w-[15rem] text-[10px] leading-[1.65] text-foreground/55 sm:text-[11px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
