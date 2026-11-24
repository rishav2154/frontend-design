import productCombo from '@/assets/product-combo.jpg';
import productFrame from '@/assets/product-frame.jpg';
import productMug from '@/assets/product-mug.jpg';
import productPhone from '@/assets/product-phone.jpg';
import productPoster from '@/assets/product-poster.jpg';
import productTshirt from '@/assets/product-tshirt.jpg';
import { API_BASE } from '@/lib/endpoints';
import { normalizeProductCategory } from '@/lib/productTaxonomy';

const GENERIC_FALLBACK_IMAGE = productCombo;

const categoryFallbacks: Record<string, string> = {
  tshirts: productTshirt,
  'magic-cup': productMug,
  'photo-frame': productFrame,
  'phone-cover': productPhone,
  posters: productPoster,
  combos: productCombo,
  keychain: productCombo,
  'night-lamp': productCombo,
  custom: productCombo,
};

const isLoopbackHost = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const getConfiguredApiUrl = () => {
  try {
    return new URL(API_BASE);
  } catch {
    return null;
  }
};

export const getProductFallbackImage = (category?: unknown) =>
  categoryFallbacks[normalizeProductCategory(category)] ?? GENERIC_FALLBACK_IMAGE;

export const resolveMediaUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();
  if (!candidate || candidate === 'null' || candidate === 'undefined') return null;

  if (candidate.startsWith('data:') || candidate.startsWith('blob:')) return candidate;

  const apiUrl = getConfiguredApiUrl();

  try {
    const parsed = new URL(candidate, apiUrl ?? window.location.origin);

    if (isLoopbackHost(parsed.hostname) && apiUrl && !isLoopbackHost(apiUrl.hostname)) {
      parsed.protocol = apiUrl.protocol;
      parsed.host = apiUrl.host;
    }

    return parsed.href;
  } catch {
    if (!apiUrl) return null;

    try {
      return new URL(candidate.replace(/^\.?\//, '/'), `${apiUrl.origin}/`).href;
    } catch {
      return null;
    }
  }
};

export const getProductImageCandidates = (
  images: unknown,
  category?: unknown,
): string[] => {
  const candidates = Array.isArray(images) ? images : [images];
  const seen = new Set<string>();
  const resolved = candidates.reduce<string[]>((items, candidate) => {
    const value = resolveMediaUrl(candidate);
    if (!value || seen.has(value)) return items;
    seen.add(value);
    items.push(value);
    return items;
  }, []);

  const fallback = getProductFallbackImage(category);
  if (!seen.has(fallback)) resolved.push(fallback);

  return resolved;
};
