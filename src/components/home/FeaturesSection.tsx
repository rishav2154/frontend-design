import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ImagePlus, MousePointer2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import caseLifestyle from '@/assets/landing/case-lifestyle.webp';

const steps = [
  {
    number: '01',
    icon: Smartphone,
    title: 'Tell us your phone',
    description: 'Select the brand, model, and available case type so the order is made for the right device.',
  },
  {
    number: '02',
    icon: ImagePlus,
    title: 'Upload your image',
    description: 'Use a high-resolution photo or artwork, then position the important details within the preview.',
  },
  {
    number: '03',
    icon: MousePointer2,
    title: 'Review and order',
    description: 'Check your selections and preview before adding the personalised case to your cart.',
  },
];

export const FeaturesSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-section home-process" aria-labelledby="process-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="home-process-panel liquid-glass-raised grid items-stretch gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="home-process-image relative min-h-[420px] overflow-hidden rounded-[1.55rem] sm:min-h-[560px]"
          >
            <img
              src={caseLifestyle}
              alt="A close view of a phone ready to be made personal"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120b08]/75 via-transparent to-white/5" />
            <div className="home-process-caption absolute bottom-4 left-4 right-4 rounded-2xl p-4 text-white sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">A small everyday object</p>
              <p className="font-editorial mt-2 text-2xl leading-tight">Made to hold a moment that matters.</p>
            </div>
          </motion.div>

          <div className="flex flex-col justify-center px-2 py-4 sm:px-5 lg:py-10 lg:pr-9">
            <p className="home-eyebrow">Three thoughtful steps</p>
            <h2 id="process-heading" className="font-editorial home-section-heading mt-3 max-w-xl text-4xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              From camera roll to case.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-foreground/[0.64] sm:text-base">
              No long design brief. The case studio keeps the important choices together so you can move from an image to an order with confidence.
            </p>

            <ol className="mt-8">
              {steps.map((step, index) => (
                <motion.li
                  key={step.number}
                  initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.55 }}
                  transition={{ delay: reduceMotion ? 0 : index * 0.08 }}
                  className="home-process-step grid grid-cols-[2.7rem_1fr] gap-3 py-5 sm:grid-cols-[3.25rem_1fr] sm:gap-5 sm:py-6"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.18em] text-accent">{step.number}</span>
                    <step.icon className="mt-3 h-5 w-5 text-foreground" strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-foreground/[0.57] sm:text-sm sm:leading-6">{step.description}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <Link to="/customize-phone-cover" className="home-button home-button-primary mt-8 self-start">
              Start my design
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
