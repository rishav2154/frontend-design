import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

/* ================= PRODUCT TYPE ================= */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
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

/* ================= CATEGORY NORMALIZER ================= */

const normalizeCategory = (category: string): string => {
  if (!category) return "uncategorized";

  const map: Record<string, string> = {
    // Mugs
    "mugs": "magic-cup",
    "magic-cup": "magic-cup",

    // Frames
    "frames": "photo-frame",
    "photo-frame": "photo-frame",

    // Phone Covers
    "phone cases": "phone-cover",
    "phone case": "phone-cover",
    "phone-cover": "phone-cover",

    // Keychains
    "keychain": "keychain",
    "keychains": "keychain",

    // Lamps
    "lamps": "night-lamp",
    "night-lamp": "night-lamp",

    // Custom
    "custom": "custom"
  };

  return map[category.toLowerCase()] || category.toLowerCase();
};

/* ================= SAFE PARSERS ================= */

const safeParseArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const safeParseObject = (value: any): any => {
  if (typeof value === "object" && value !== null) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
};

/* ================= DB → FRONTEND MAPPER ================= */

const mapDbProductToFrontend = (db: any): Product => {
  const imagesRaw = safeParseArray(db.images);
  const tagsRaw = safeParseArray(db.tags);
  const customizationRaw = safeParseObject(db.customization_options);

  const images =
    imagesRaw.length > 0
      ? imagesRaw.filter((img) => typeof img === "string")
      : db.image_url
      ? [db.image_url]
      : ["/placeholder.svg"];

  return {
    id: db.id,
    name: db.name || "Unnamed Product",
    description: db.description || "",
    price: Number(db.price) || 0,
    originalPrice: db.original_price
      ? Number(db.original_price)
      : undefined,

    // ✅ FIXED CATEGORY
    category: normalizeCategory(db.category),

    images: images.slice(0, 5),
    rating: 4.5,
    reviewCount: 0,

    isCustomizable:
      !!customizationRaw.canAddText ||
      !!customizationRaw.canAddImage,

    tags: tagsRaw,
    stock: Number(db.stock) || 0,

    customizationOptions: {
      canAddText: !!customizationRaw.canAddText,
      canAddImage: !!customizationRaw.canAddImage,
      allowText: !!customizationRaw.canAddText,
      allowImage: !!customizationRaw.canAddImage,
      maxTextLength: 30,
    },
  };
};

/* ================= ALL PRODUCTS ================= */

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const data = await apiFetch("/api/products");
      const products = (data || []).map(mapDbProductToFrontend);

      if (category) {
        return products.filter((p) => p.category === category);
      }

      return products;
    },
  });
};

/* ================= FEATURED PRODUCTS ================= */

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const data = await apiFetch("/api/products");
      return (data || [])
        .slice(0, 8)
        .map(mapDbProductToFrontend);
    },
  });
};

/* ================= SINGLE PRODUCT ================= */

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const data = await apiFetch(`/api/products/${id}`);
      if (!data) return null;
      return mapDbProductToFrontend(data);
    },
    enabled: !!id,
  });
};

/* ================= FRONTEND CATEGORY LIST ================= */

export const categories = [
  { id: "magic-cup", name: "Mugs", icon: "☕" },
  { id: "photo-frame", name: "Frames", icon: "🖼️" },
  { id: "phone-cover", name: "Phone Cases", icon: "📱" },
  { id: "keychain", name: "Keychains", icon: "🔑" },
  { id: "night-lamp", name: "Lamps", icon: "💡" },
  { id: "custom", name: "Custom", icon: "✨" },
];
