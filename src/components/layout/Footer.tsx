import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from 'lucide-react';
import { shouldShowMobileBottomNav } from '@/lib/mobileNavigation';

const shopLinks = [
  { name: 'Shop All Products', path: '/shop' },
  { name: 'Shop Phone Cases', path: '/shop?category=phone-cover' },
  { name: 'Mugs', path: '/shop?category=magic-cup' },
  { name: 'Frames', path: '/shop?category=photo-frame' },
  { name: 'Keychains', path: '/shop?category=keychain' },
  { name: 'Lamps', path: '/shop?category=night-lamp' },
];

const companyLinks = [
  { name: 'Design Your Case', path: '/customize-phone-cover' },
  { name: 'About The Design Hive', path: '/about' },
  { name: 'Returns & Refunds', path: '/returns' },
];

const CONTACT_EMAIL = 'daljeet0113@gmail.com';
const CONTACT_PHONE_LABEL = '+91 78275 25257';
const CONTACT_PHONE_HREF = 'tel:+917827525257';
const CONTACT_LOCATION = 'Near Vinod General Store, Sanjay Gandhi Transport Nagar';
const WHATSAPP_HREF =
  'https://wa.me/917827525257?text=Hi%20The%20Design%20Hive%2C%20I%20need%20help%20choosing%20a%20personalised%20product.';

const benefits = [
  {
    icon: BadgeCheck,
    title: 'Premium Quality Assured',
    description: 'Thoughtful materials and durable, detail-rich prints.',
    link: null,
  },
  {
    icon: Truck,
    title: 'Free Shipping Over ₹500',
    description: 'Automatically applied to qualifying orders across India.',
    link: null,
  },
  {
    icon: RotateCcw,
    title: '7-Day Returns & Refunds',
    description: 'Eligible items can be requested within seven days of delivery.',
    link: { label: 'Read the policy', path: '/returns' },
  },
];

export const Footer = () => {
  const location = useLocation();
  const hasMobileBottomNav = shouldShowMobileBottomNav(location.pathname);
  const isLanding = location.pathname === '/';

  return (
    <footer
      className={`site-footer relative overflow-hidden ${isLanding ? 'home-footer' : ''} ${
        hasMobileBottomNav
          ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'
          : 'pb-[env(safe-area-inset-bottom)] md:pb-0'
      }`}
    >
      <div className="home-footer-panel">
        <div className="home-shell px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Trust and delivery benefits */}
          <div
            className="site-footer-trust liquid-glass-raised"
            role="list"
            aria-label="Why shop with The Design Hive"
          >
            {benefits.map((item) => (
              <div key={item.title} className="site-footer-trust-item" role="listitem">
                <span className="site-footer-icon-orb" aria-hidden="true">
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <div className="site-footer-trust-copy min-w-0">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.09em] text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground/60">{item.description}</p>
                  {item.link && (
                    <Link to={item.link.path} className="site-footer-policy-link">
                      {item.link.label}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Brand, collections, navigation, and contact details */}
          <div className="site-footer-middle mt-10 lg:mt-12">
            <div className="site-footer-brand-feature">
              <div>
                <Link
                  to="/"
                  className="site-footer-brand inline-flex items-center gap-2.5 rounded-full"
                  aria-label="The Design Hive home"
                >
                  <span className="home-logo-mark" aria-hidden="true">
                    <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="font-editorial text-3xl tracking-[-0.035em] text-foreground">
                    The Design Hive
                  </span>
                </Link>
                <p className="site-footer-brand-copy">
                  Personal phone cases, mugs, frames, keychains, lamps, and new gift ideas made from the moments you
                  want to keep.
                </p>
              </div>
              <Link
                to="/customize-phone-cover"
                className="home-button home-button-primary site-footer-studio-link"
              >
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Open the case studio
              </Link>
            </div>

            <div className="site-footer-directory">
              <div className="site-footer-nav-grid">
                <nav className="site-footer-nav-block" aria-labelledby="footer-shop-heading">
                  <h2 id="footer-shop-heading" className="site-footer-label">
                    Shop Collections
                  </h2>
                  <ul className="site-footer-nav-list">
                    {shopLinks.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="site-footer-link">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <nav className="site-footer-nav-block" aria-labelledby="footer-company-heading">
                  <h2 id="footer-company-heading" className="site-footer-label">
                    The Design Hive
                  </h2>
                  <ul className="site-footer-nav-list">
                    {companyLinks.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path} className="site-footer-link">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <section className="site-footer-help" aria-labelledby="footer-help-heading">
                <div className="site-footer-help-heading">
                  <h2 id="footer-help-heading" className="site-footer-label">
                    Need Help?
                  </h2>
                  <p>Ask about phone models, gift options, custom designs, or an existing order.</p>
                </div>
                <ul className="site-footer-contact-grid">
                  <li>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer-contact site-footer-contact-entry">
                      <span className="site-footer-contact-icon" aria-hidden="true">
                        <Mail className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="site-footer-contact-kicker">Email us</span>
                        <span className="site-footer-contact-value">{CONTACT_EMAIL}</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href={CONTACT_PHONE_HREF} className="site-footer-contact site-footer-contact-entry">
                      <span className="site-footer-contact-icon" aria-hidden="true">
                        <Phone className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="site-footer-contact-kicker">Call us</span>
                        <span className="site-footer-contact-value">{CONTACT_PHONE_LABEL}</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={WHATSAPP_HREF}
                      target="_blank"
                      rel="noreferrer"
                      className="site-footer-contact site-footer-contact-entry"
                      aria-label="Message The Design Hive on WhatsApp"
                    >
                      <span className="site-footer-contact-icon" aria-hidden="true">
                        <MessageCircle className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="site-footer-contact-kicker">WhatsApp</span>
                        <span className="site-footer-contact-value">Chat with our team</span>
                      </span>
                    </a>
                  </li>
                  <li className="site-footer-contact-entry site-footer-location">
                    <span className="site-footer-contact-icon" aria-hidden="true">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="site-footer-contact-kicker">Find us</span>
                      <span className="site-footer-contact-value">{CONTACT_LOCATION}</span>
                    </span>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* Customer support and verified checkout provider */}
          <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:mt-14">
            <section className="site-footer-card" aria-labelledby="footer-support-heading">
              <div className="flex items-center gap-2.5">
                <span className="site-footer-icon-orb" aria-hidden="true">
                  <Headphones className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <h2 id="footer-support-heading" className="site-footer-label">
                  Customer Support
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/65">
                Get help with a phone model, product choice, custom design, or an order in progress.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <a href={CONTACT_PHONE_HREF} className="site-footer-action" aria-label={`Call ${CONTACT_PHONE_LABEL}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  Call us
                </a>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="site-footer-action"
                  aria-label="Contact The Design Hive on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </section>

            <section className="site-footer-card" aria-labelledby="footer-payment-heading">
              <div className="flex items-center gap-2.5">
                <span className="site-footer-icon-orb" aria-hidden="true">
                  <Lock className="h-[18px] w-[18px]" strokeWidth={1.7} />
                </span>
                <h2 id="footer-payment-heading" className="site-footer-label">
                  Safe & Secure Checkout
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/65">
                Choose full payment or pay 50% now and the balance on delivery. Online payments are processed through
                Razorpay.
              </p>
              <div className="site-footer-provider mt-4" aria-label="Secure INR payments processed by Razorpay">
                <span className="site-footer-provider-icon" aria-hidden="true">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="site-footer-provider-name">Razorpay</span>
                  <span className="site-footer-provider-meta">Secure INR payment provider</span>
                </span>
              </div>
            </section>
          </div>

          {/* Copyright and closing brand line */}
          <div className="site-footer-bottom mt-11 flex flex-col gap-3 pt-6 text-xs text-foreground/60 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:pt-8 sm:text-sm">
            <p>© {new Date().getFullYear()} The Design Hive. All rights reserved.</p>
            <p className="text-[10px] uppercase tracking-[0.17em] text-foreground/55">
              Designed Around Your Moments
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
