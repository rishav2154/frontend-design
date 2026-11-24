import { useQuery } from "@tanstack/react-query";
import { apiFetch, endpoints } from "@/lib/api";
import {
  PRODUCT_CATEGORIES,
  getProductCategory,
  normalizeProductCategory,
  type ProductCategoryMetadata,
} from "@/lib/productTaxonomy";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  isCustomizable: boolean;
  tags: string[];
  stock: number;
  customizationOptions?: {
    canAddText: boolean;
    canAddImage: boolean;
    allowText?: boolean;
    allowImage?: boolean;
    maxTextLength?: number;
  };
}

type UnknownRecord = Record<string, unknown>;

const PRODUCTS_QUERY_KEY = ["products"] as const;
const PRODUCTS_STALE_TIME = 5 * 60 * 1000;
const FALLBACK_IMAGE = "/placeholder.svg";

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sanitizeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const sanitizeId = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return sanitizeString(value);
};

const parseList = (value: unknown, splitCommas: boolean): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  const trimmedValue = value.trim();
  if (!trimmedValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(trimmedValue);
    if (Array.isArray(parsedValue)) return parsedValue;
    if (typeof parsedValue === "string") return [parsedValue];
    return [];
  } catch {
    // Plain strings are valid list values too.
  }

  return splitCommas ? trimmedValue.split(",") : [trimmedValue];
};

const sanitizeStringList = (value: unknown, splitCommas = false): string[] => {
  const seen = new Set<string>();

  return parseList(value, splitCommas).reduce<string[]>((items, candidate) => {
    const sanitizedCandidate = sanitizeString(candidate);
    const lowerCandidate = sanitizedCandidate.toLocaleLowerCase();

    if (
      !sanitizedCandidate ||
      lowerCandidate === "null" ||
      lowerCandidate === "undefined" ||
      seen.has(sanitizedCandidate)
    ) {
      return items;
    }

    seen.add(sanitizedCandidate);
    items.push(sanitizedCandidate);
    return items;
  }, []);
};

const parseObject = (value: unknown): UnknownRecord => {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};

  try {
    const parsedValue: unknown = JSON.parse(value);
    return isRecord(parsedValue) ? parsedValue : {};
  } catch {
    return {};
  }
};

const firstDefined = (...values: unknown[]): unknown =>
  values.find((value) => value !== undefined && value !== null);

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "string" && !value.trim()) return undefined;

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const parseOptionalBoolean = (value: unknown): boolean | undefined => {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (typeof value !== "string") return undefined;

  const normalizedValue = value.trim().toLocaleLowerCase();
  if (normalizedValue === "true" || normalizedValue === "1") return true;
  if (normalizedValue === "false" || normalizedValue === "0") return false;
  return undefined;
};

const mapApiProduct = (value: unknown): Product | null => {
  if (!isRecord(value)) return null;

  const id = sanitizeId(value.id);
  if (!id) return null;

  const customization = parseObject(
    firstDefined(value.customization_options, value.customizationOptions),
  );
  const canAddText =
    parseOptionalBoolean(customization.canAddText) ??
    parseOptionalBoolean(customization.can_add_text) ??
    parseOptionalBoolean(customization.allowText) ??
    parseOptionalBoolean(customization.allow_text) ??
    false;
  const canAddImage =
    parseOptionalBoolean(customization.canAddImage) ??
    parseOptionalBoolean(customization.can_add_image) ??
    parseOptionalBoolean(customization.allowImage) ??
    parseOptionalBoolean(customization.allow_image) ??
    false;
  const maxTextLengthValue = toFiniteNumber(
    firstDefined(customization.maxTextLength, customization.max_text_length),
  );
  const maxTextLength =
    maxTextLengthValue !== undefined && maxTextLengthValue > 0
      ? Math.floor(maxTextLengthValue)
      : 30;

  const imageUrl = sanitizeString(firstDefined(value.image_url, value.imageUrl));
  const images = sanitizeStringList(value.images).slice(0, 5);
  if (images.length === 0 && imageUrl) images.push(imageUrl);
  if (images.length === 0) images.push(FALLBACK_IMAGE);

  const price = Math.max(0, toFiniteNumber(value.price) ?? 0);
  const originalPriceValue = toFiniteNumber(
    firstDefined(value.original_price, value.originalPrice),
  );
  const ratingValue = toFiniteNumber(
    firstDefined(value.rating, value.average_rating, value.averageRating),
  );
  const reviewCountValue = toFiniteNumber(
    firstDefined(value.review_count, value.reviewCount),
  );
  const rating =
    ratingValue !== undefined && ratingValue >= 0 && ratingValue <= 5
      ? ratingValue
      : undefined;
  const reviewCount =
    reviewCountValue !== undefined && reviewCountValue >= 0
      ? Math.floor(reviewCountValue)
      : undefined;

  return {
    id,
    name: sanitizeString(value.name) || "Unnamed Product",
    description: sanitizeString(value.description),
    price,
    ...(originalPriceValue !== undefined && originalPriceValue > 0
      ? { originalPrice: originalPriceValue }
      : {}),
    category: normalizeProductCategory(value.category),
    images,
    ...(rating !== undefined ? { rating } : {}),
    ...(reviewCount !== undefined ? { reviewCount } : {}),
    isCustomizable: canAddText || canAddImage,
    tags: sanitizeStringList(value.tags, true),
    stock: Math.max(0, Math.floor(toFiniteNumber(value.stock) ?? 0)),
    customizationOptions: {
      canAddText,
      canAddImage,
      allowText: canAddText,
      allowImage: canAddImage,
      maxTextLength,
    },
  };
};

const extractProductRows = (data: unknown): unknown[] => {
  if (data === null || data === undefined) return [];
  if (Array.isArray(data)) return data;

  if (isRecord(data)) {
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
  }

  throw new Error("The products response was not in the expected format.");
};

const fetchProducts = async (): Promise<Product[]> => {
  const data = await apiFetch<unknown>(endpoints.products.list);

  return extractProductRows(data)
    .map(mapApiProduct)
    .filter((product): product is Product => product !== null);
};

export const useProducts = (category?: string) => {
  const normalizedCategory = category?.trim()
    ? normalizeProductCategory(category)
    : undefined;

  return useQuery<Product[], Error, Product[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: PRODUCTS_STALE_TIME,
    select: normalizedCategory
      ? (products) =>
          products.filter((product) => product.category === normalizedCategory)
      : (products) => products,
  });
};

export const useFeaturedProducts = () =>
  useQuery<Product[], Error, Product[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: fetchProducts,
    staleTime: PRODUCTS_STALE_TIME,
    select: (products) => products.slice(0, 8),
  });

export const useProduct = (id: string) => {
  const normalizedId = id.trim();

  return useQuery<Product | null, Error>({
    queryKey: ["product", normalizedId],
    queryFn: async () => {
      const data = await apiFetch<unknown>(endpoints.products.detail, {
        args: [normalizedId],
      });
      if (!data) return null;
      return mapApiProduct(data);
    },
    enabled: Boolean(normalizedId),
    staleTime: PRODUCTS_STALE_TIME,
  });
};

// Compatibility exports for callers that previously sourced taxonomy here.
export const categories: ProductCategoryMetadata[] = PRODUCT_CATEGORIES.map(
  (category) => ({ ...category }),
);

export const getCategoryLabel = (category: string): string =>
  getProductCategory(category).label;
