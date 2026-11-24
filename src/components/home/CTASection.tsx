import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import productPhone from '@/assets/product-phone.jpg';

const whatsappHref =
  'https://wa.me/917827525257?text=Hi%20The%20Design%20Hive%2C%20I%20would%20like%20help%20choosing%20a%20personalised%20product.';

export const CTASection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-section home-final-cta">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="home-cta-panel liquid-glass-luminous relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20"
        >
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-current/10 sm:h-96 sm:w-96" aria-hidden="true" />
          <div className="absolute -bottom-28 right-24 h-56 w-56 rounded-full border border-accent/20" aria-hidden="true" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.52fr]">
            <div>
              <p className="home-chip home-eyebrow w-fit">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Personal pieces, made from your ideas
              </p>
              <h2 className="font-editorial home-section-heading mt-5 max-w-3xl text-5xl leading-[0.9] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
                Make something nobody else has.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-foreground/[0.66] sm:text-base">
                Start with a custom phone case, or explore mugs, frames, keychains, lamps, and every personalised product currently in the shop.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/shop" className="home-button home-cta-primary">
                  Explore all products
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/customize-phone-cover" className="home-button home-cta-secondary">
                  Create a phone case
                </Link>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="home-button home-cta-secondary">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask for help
                </a>
              </div>
            </div>

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [3, 4.5, 3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mx-auto w-full max-w-[290px] lg:mr-0"
            >
              <div className="absolute -inset-9 rounded-full bg-accent/[0.12] blur-3xl" aria-hidden="true" />
              <div className="home-image-frame relative rounded-[1.8rem] border-[8px] p-1.5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <img src={productPhone} alt="A custom printed phone case" loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-[1.15rem] object-cover" />
                <p className="pb-1 pt-2 text-center text-[9px] font-bold uppercase tracking-[0.18em]">Made from your moment</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
