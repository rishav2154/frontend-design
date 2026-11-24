import { ArrowUpRight, Gift, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CatalogOfferBanner = () => {
  return (
    <aside className="home-catalog-banner liquid-glass-luminous relative overflow-hidden rounded-[2.25rem] px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-foreground/10" aria-hidden="true" />
      <div className="absolute bottom-5 right-10 hidden rotate-6 sm:block" aria-hidden="true">
        <Gift className="h-28 w-28 text-accent/[0.12]" strokeWidth={1.2} />
      </div>

      <div className="relative max-w-3xl">
        <span className="home-icon-orb">
          <Truck className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="home-eyebrow mt-6">One order, more to make personal</p>
        <h2 className="font-editorial home-section-heading mt-3 text-4xl leading-[0.96] tracking-[-0.04em] sm:text-6xl">
          Free shipping on orders over ₹500.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground/[0.64] sm:text-base">
          Pair a custom case with mugs, frames, keychains, lamps, or any new personalised pieces listed in the shop.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/shop" className="home-button home-button-primary">
            Shop all products
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/customize-phone-cover" className="home-button home-button-secondary">
            Create a phone case
          </Link>
        </div>
      </div>
    </aside>
  );
};
