import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];  // ✅ Backend already parses JSON → ready-to-use array
  rating: number;
  reviewCount: number;
  isCustomizable: boolean;
  tags: string[];
  stock: number;
  colors?: string[];
  customizationOptions?: {
    canAddText: boolean;
    canAddImage: boolean;
    allowText?: boolean;
    allowImage?: boolean;
    maxTextLength?: number;
  };
}

/* ---------------- SIMPLIFIED: Backend already handles JSON parsing ---------------- */
const mapDbProductToFrontend = (db: any): Product => {
  // ✅ Backend already returns parsed arrays/objects - just validate
  const images = Array.isArray(db.images) && db.images.length > 0 
    ? db.images.filter((img: any) => img && typeof img === 'string') 
    : db.image_url ? [db.image_url] : ["/placeholder.svg"];

  return {
    id: db.id,
    name: db.name || 'Unnamed Product',
    description: db.description || "",
    price: Number(db.price) || 0,
    originalPrice: db.original_price ? Number(db.original_price) : undefined,
    category: db.category || 'Uncategorized',
    images: images.length > 0 ? images.slice(0, 5) : ["/placeholder.svg"], // Max 5 images
    rating: 4.5,
    reviewCount: 0,
    isCustomizable: !!(db.customization_options?.canAddText || db.customization_options?.canAddImage),
    tags: Array.isArray(db.tags) ? db.tags : [],
    stock: Number(db.stock) || 0,
    customizationOptions: {
      canAddText: !!db.customization_options?.canAddText,
      canAddImage: !!db.customization_options?.canAddImage,
      allowText: !!db.customization_options?.canAddText,
      allowImage: !!db.customization_options?.canAddImage,
      maxTextLength: 30,
    }
  };
};

/* ---------------- ALL PRODUCTS ---------------- */
export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const data = await apiFetch("/api/products");
      const products = (data || []).map(mapDbProductToFrontend);
      
      if (category) {
        return products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      
      return products;
    },
  });
};

/* ---------------- FEATURED PRODUCTS ---------------- */
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

/* ---------------- SINGLE PRODUCT ---------------- */
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

/* ---------------- CATEGORIES ---------------- */
export const categories = [
  { id: "magic-cup", name: "Mugs", icon: "☕" },
  { id: "photo-frame", name: "Frames", icon: "🖼️" },
  { id: "phone-cover", name: "Phone Cases", icon: "📱" },
  { id: "keychain", name: "Keychains", icon: "🔑" },
  { id: "night-lamp", name: "Lamps", icon: "💡" },
  { id: "custom", name: "Custom", icon: "✨" },
];
