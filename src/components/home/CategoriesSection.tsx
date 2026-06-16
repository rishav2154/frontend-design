import { Link } from 'react-router-dom';
import { categories } from '@/data/products';

import productTshirt from '@/assets/product-tshirt.jpg';
import productMug from '@/assets/product-mug.jpg';
import productFrame from '@/assets/product-frame.jpg';
import productPhone from '@/assets/product-phone.jpg';
import productPoster from '@/assets/product-poster.jpg';
import productCombo from '@/assets/product-combo.jpg';

const categoryImages: Record<string, string> = {
  tshirts: productTshirt,
  mugs: productMug,
  frames: productFrame,
  'phone-covers': productPhone,
  posters: productPoster,
  combos: productCombo,
};

export const CategoriesSection = () => {
  return (
    <section className="py-5 sm:py-8 mt-5 sm:mt-3 bg-muted/50">
      <div className="container mx-auto px-2 sm:px-4">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
          Shop by Category
        </h3>
        <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide sm:justify-center">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="flex flex-col items-center gap-2 min-w-[68px] sm:min-w-[90px] group"
            >
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background group-hover:ring-accent/60 transition-all duration-300 group-hover:scale-110 shadow-lg">
                <img
                  src={categoryImages[category.id]}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-accent text-center leading-tight transition-colors max-w-[72px]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
