import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { categories } from '@/data/products';
import { getProductFallbackImage } from '@/lib/media';

export const ShopByCategory = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-shop-categories py-12 sm:py-14 lg:py-16" aria-labelledby="shop-by-category-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <h2
          id="shop-by-category-heading"
          className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/85 sm:text-sm"
        >
          Shop by Category
        </h2>

        <ul className="home-category-scroll -mx-4 mt-7 flex gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:mt-8 sm:gap-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-6 xl:gap-7 xl:overflow-visible xl:px-0">
          {categories.map((category, index) => (
            <motion.li
              key={category.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.045 }}
              className="w-[7.25rem] flex-none scroll-ml-4 snap-start sm:w-[8.25rem] xl:w-auto"
            >
              <Link
                to={`/shop?category=${encodeURIComponent(category.id)}`}
                className="home-category-link group flex min-h-11 flex-col items-center text-center"
                aria-label={`Shop ${category.name}`}
              >
                <span className="home-category-image grid h-24 w-24 place-items-center overflow-hidden rounded-full sm:h-28 sm:w-28 xl:h-32 xl:w-32">
                  <img
                    src={getProductFallbackImage(category.id)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="mt-3 min-h-10 text-sm font-semibold leading-5 text-foreground/90 transition-colors duration-200 group-hover:text-accent sm:mt-4">
                  {category.name}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};
