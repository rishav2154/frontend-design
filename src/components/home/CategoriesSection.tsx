import { motion } from 'framer-motion';
import { ArrowUpRight, Image as ImageIcon, PenLine, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import productPhone from '@/assets/product-phone.jpg';
import phoneColours from '@/assets/landing/phone-colours.webp';
import phoneDetail from '@/assets/landing/phone-detail.webp';

const caseStories = [
  {
    eyebrow: 'The memory case',
    title: 'A favourite moment, always within reach.',
    copy: 'Choose the photo that still makes you smile and make it part of the thing you carry most.',
    image: productPhone,
    imageAlt: 'A phone case printed with a personal artwork',
    icon: ImageIcon,
    className: 'md:col-span-7',
  },
  {
    eyebrow: 'The minimal case',
    title: 'Quiet, personal, unmistakably yours.',
    copy: 'A clean crop, a meaningful detail, or a design that says just enough.',
    image: phoneColours,
    imageAlt: 'A collection of phones in refined colours',
    icon: PenLine,
    className: 'md:col-span-5',
  },
  {
    eyebrow: 'The everyday case',
    title: 'Style made for the phone you actually own.',
    copy: 'Start with your brand and model, then choose the available case type before uploading your design.',
    image: phoneDetail,
    imageAlt: 'Close-up detail of a phone',
    icon: Shield,
    className: 'md:col-span-12',
  },
];

export const CategoriesSection = () => {
  return (
    <section className="home-section home-case-stories" aria-labelledby="case-story-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="home-eyebrow">Make it mean something</p>
            <h2 id="case-story-heading" className="font-editorial mt-3 max-w-2xl text-4xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              One case. A hundred ways to make it yours.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-foreground/60 sm:text-base">
            Start with a feeling—not a template. Your own image is what makes every case different.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12 md:gap-5">
          {caseStories.map((story, index) => (
            <motion.article
              key={story.eyebrow}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className={`home-story-card group relative min-h-[440px] overflow-hidden rounded-[1.75rem] ${story.className} ${index === 2 ? 'md:min-h-[430px]' : 'md:min-h-[560px]'}`}
            >
              <img
                src={story.image}
                alt={story.imageAlt}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] ${index === 2 ? 'object-[center_58%]' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17120f]/90 via-[#17120f]/18 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/10 backdrop-blur-sm">
                  <story.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 sm:text-xs">{story.eyebrow}</p>
                <h3 className="font-editorial mt-2 max-w-xl text-3xl leading-[1.02] tracking-[-0.025em] sm:text-4xl">{story.title}</h3>
                <p className="mt-3 max-w-lg text-xs leading-5 text-white/72 sm:text-sm sm:leading-6">{story.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/customize-phone-cover" className="home-text-link group">
            Open the case studio
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
