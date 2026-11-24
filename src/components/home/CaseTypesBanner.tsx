import { ArrowUpRight, Layers3, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const caseTypes = [
  'Hard Plastic',
  'Soft Silicone',
  'Leather Finish',
  'Clear Transparent',
  'Matte Finish',
  'Rugged Armor',
];

export const CaseTypesBanner = () => {
  return (
    <aside className="home-case-types liquid-glass-raised mt-8 sm:mt-12">
      <div className="grid lg:grid-cols-[0.74fr_1.26fr]">
        <div className="home-case-types-lead relative overflow-hidden px-6 py-9 sm:px-9 sm:py-11">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-foreground/10" aria-hidden="true" />
          <span className="home-icon-orb">
            <Layers3 className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <p className="home-eyebrow mt-8">Choose your finish</p>
          <h3 className="font-editorial home-section-heading mt-3 max-w-sm text-4xl leading-[0.94] tracking-[-0.035em] sm:text-5xl">
            The right feel for the phone you own.
          </h3>
        </div>

        <div className="p-6 sm:p-9">
          <p className="max-w-2xl text-sm leading-7 text-foreground/[0.66] sm:text-base">
            Pick your phone brand and model in the studio to see its available case types and current prices. Availability can differ by model.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {caseTypes.map((type) => (
              <div
                key={type}
                className="home-case-type-chip flex min-h-14 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm"
              >
                <Smartphone className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.7} aria-hidden="true" />
                <span>{type}</span>
              </div>
            ))}
          </div>

          <Link to="/customize-phone-cover" className="home-text-link group mt-7">
            Check my phone model
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
