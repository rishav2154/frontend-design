import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, RotateCcw, Clock, PackageCheck, AlertTriangle, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const highlights = [
  { icon: Clock, title: '7-Day Window', desc: 'Return requests accepted within 7 days of delivery.' },
  { icon: RotateCcw, title: 'Easy Process', desc: 'Initiate returns with a single email or call.' },
  { icon: ShieldCheck, title: 'Full Refund', desc: 'Get 100% refund for eligible returns.' },
  { icon: PackageCheck, title: 'Free Pickup', desc: 'We arrange free return pickup for damaged items.' },
];

const faqs = [
  {
    q: 'Which items are eligible for return?',
    a: 'Non-customized, unused items in original packaging are eligible for return within 7 days of delivery. Customized or personalized products can only be returned if they are defective or damaged.',
  },
  {
    q: 'How do I initiate a return?',
    a: 'Email us at daljeet0113@gmail.com or call +91 98765 43210 with your order number and reason for return. We will guide you through the next steps within 24 hours.',
  },
  {
    q: 'When will I receive my refund?',
    a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.',
  },
  {
    q: 'Can I exchange an item instead of returning it?',
    a: 'Yes! We offer exchanges for non-customized items. Contact our support team and we will help you pick a replacement.',
  },
  {
    q: 'What if I receive a damaged or wrong item?',
    a: 'Please contact us within 48 hours of delivery with photos of the damage. We will arrange a free pickup and send a replacement or full refund at no extra cost.',
  },
  {
    q: 'Are shipping charges refundable?',
    a: 'If the return is due to our error (wrong or damaged item), shipping charges are fully refunded. For other returns, original shipping charges are non-refundable.',
  },
  {
    q: 'Can I cancel an order before it ships?',
    a: 'Yes, orders can be cancelled before they enter production. Customized orders that are already in production cannot be cancelled. Contact us as soon as possible for cancellations.',
  },
];

const ReturnPolicy = () => {
  return (
    <div className="min-h-dvh min-h-dvh overflow-x-clip bg-background">
      <Navbar />
      <CartDrawer />
      <main className="pb-12 pt-20 sm:pb-16 sm:pt-24">
        {/* Hero */}
        <section className="container mx-auto mb-10 px-3 text-center min-[360px]:px-4 sm:mb-16 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-3xl font-bold min-[360px]:text-4xl md:text-5xl"
          >
            Return & <span className="text-gradient-accent">Refund</span> Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Your satisfaction is our priority. If you're not happy with your purchase, we're here to make it right.
          </motion.p>
        </section>

        {/* Highlights */}
        <section className="container mx-auto mb-10 px-3 min-[360px]:px-4 sm:mb-16 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-4 min-[420px]:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {highlights.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                <Card className="border-border bg-card h-full hover:border-accent/40 transition-colors">
                  <CardContent className="p-4 text-center min-[360px]:p-5 sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator className="mx-auto mb-10 max-w-5xl sm:mb-16" />

        {/* Policy Details */}
        <section className="container mx-auto mb-12 px-3 min-[360px]:px-4 sm:mb-16 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-semibold min-[360px]:text-2xl">Return Eligibility</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><PackageCheck className="w-5 h-5 text-accent mt-0.5 shrink-0" /> Items must be unused and in their original packaging.</li>
                <li className="flex items-start gap-3"><PackageCheck className="w-5 h-5 text-accent mt-0.5 shrink-0" /> Return request must be made within 7 days of delivery.</li>
                <li className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-accent mt-0.5 shrink-0" /> Customized/personalized products are non-returnable unless defective.</li>
                <li className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-accent mt-0.5 shrink-0" /> Gift cards and downloadable products are non-refundable.</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold min-[360px]:text-2xl">Refund Process</h2>
              <ol className="list-outside list-decimal space-y-3 pl-5 text-muted-foreground">
                <li>Contact our support team via email or phone with your order details.</li>
                <li>We'll review your request and provide return instructions within 24 hours.</li>
                <li>Ship the item back or schedule a free pickup (for damaged items).</li>
                <li>Once received and inspected, your refund is processed within 5–7 business days.</li>
                <li>Refund is credited to your original payment method.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto mb-12 px-3 min-[360px]:px-4 sm:mb-16 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 text-center text-xl font-semibold min-[360px]:text-2xl sm:mb-6">Frequently Asked Questions</h2>
            <Card className="border-border bg-card">
              <CardContent className="p-3 min-[360px]:p-4 sm:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="min-w-0 py-4 text-left text-sm min-[360px]:text-base">{faq.q}</AccordionTrigger>
                      <AccordionContent className="break-words text-sm text-muted-foreground min-[360px]:text-base">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-3 min-[360px]:px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 text-center min-[360px]:p-8 sm:p-10"
          >
            <Mail className="w-10 h-10 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">Our support team is here to help you 6 days a week.</p>
            <a href="mailto:daljeet0113@gmail.com" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent-gradient px-6 py-3 font-medium text-accent-foreground transition-opacity hover:opacity-90 min-[360px]:w-auto">
              <Mail className="w-4 h-4" /> Email Us
            </a>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
