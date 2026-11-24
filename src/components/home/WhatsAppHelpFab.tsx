import { MessageCircle } from 'lucide-react';

const whatsappHref =
  'https://wa.me/917827525257?text=Hi%20The%20Design%20Hive%2C%20I%20need%20help%20choosing%20a%20custom%20phone%20case.';

export const WhatsAppHelpFab = () => (
  <a
    href={whatsappHref}
    target="_blank"
    rel="noreferrer"
    className="home-whatsapp-fab fixed bottom-[calc(5.45rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex min-h-12 items-center gap-2 rounded-full px-3.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55c98a] focus-visible:ring-offset-2 md:bottom-5 md:right-5"
    aria-label="Ask The Design Hive for help on WhatsApp"
  >
    <span className="relative grid h-6 w-6 place-items-center rounded-full bg-white/[0.12]">
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#1d6a43] bg-[#8ce7b5]" aria-hidden="true" />
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className="hidden sm:inline">Need help?</span>
  </a>
);

export default WhatsAppHelpFab;
