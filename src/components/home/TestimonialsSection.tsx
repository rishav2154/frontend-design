import { MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const whatsappHref =
  'https://wa.me/917827525257?text=Hi%20The%20Design%20Hive%2C%20I%20need%20help%20choosing%20a%20personalised%20product.';

const questions = [
  {
    question: 'How do I know whether my phone is supported?',
    answer: 'Open the case studio and choose your phone brand first. The model and available case-type lists update from the current catalogue, so you only continue with combinations that are available there.',
  },
  {
    question: 'What kind of image should I upload?',
    answer: 'A clear, high-resolution image works best. Keep faces, text, and other important details away from the outer edges because a small amount may be trimmed during production.',
  },
  {
    question: 'Can I see the design before ordering?',
    answer: 'Yes. The studio shows your uploaded image in a phone-cover preview alongside your selected brand, model, case type, and price before you add it to the cart.',
  },
  {
    question: 'Can I personalise the gifts shown below the phone cases?',
    answer: 'Products that support a photo or text show a customisable label. Open the product to review its available options before adding it to your cart.',
  },
  {
    question: 'How does free shipping work?',
    answer: 'The cart currently applies free shipping when the order subtotal is over ₹500. Any valid free-shipping coupon is applied there as well.',
  },
  {
    question: 'Can someone help me choose?',
    answer: 'Absolutely. Use the WhatsApp button and tell us your phone model, occasion, or what you want to create. A real person can help you find the right place to start.',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="home-section home-help" aria-labelledby="help-heading">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="home-help-panel liquid-glass-raised grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <span className="home-icon-orb">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="home-eyebrow mt-6">Human help, when you want it</p>
            <h2 id="help-heading" className="font-editorial home-section-heading mt-3 text-4xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              Questions are welcome.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-foreground/[0.64] sm:text-base">
              Unsure about your phone model, product options, photo, or what makes the right gift? Message The Design Hive and get help from a real person.
            </p>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="home-button home-button-primary mt-7">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask on WhatsApp
            </a>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">Opens WhatsApp with a ready-to-send help message.</p>
          </div>

          <Accordion type="single" collapsible className="border-t border-foreground/[0.12]">
            {questions.map((item, index) => (
              <AccordionItem key={item.question} value={`question-${index}`} className="border-foreground/[0.12]">
                <AccordionTrigger className="py-5 text-left text-sm font-semibold leading-6 hover:no-underline sm:py-6 sm:text-base">
                  <span className="pr-5">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-6 pr-8 text-xs leading-6 text-foreground/[0.62] sm:text-sm sm:leading-7">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
