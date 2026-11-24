export interface PhoneCoverBrand {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  logo_url?: string | null;
  is_active?: boolean | number;
  sort_order?: number;
}

export interface PhoneCoverModel {
  id: string;
  brand_id: string;
  name: string;
  slug?: string | null;
  image_url?: string | null;
  release_year?: number | null;
  is_active?: boolean | number;
  sort_order?: number;
}

export interface PhoneCoverType {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
  slug?: string | null;
  image_url?: string | null;
  is_active?: boolean | number;
  sort_order?: number;
}

export interface PhoneCoverProductModel {
  model_id: string;
  sku?: string | null;
  price_override?: number | null;
  stock_override?: number | null;
}

export interface PhoneCoverCatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  stock: number;
  is_active?: boolean;
  images: string[];
  tags: string[];
  customization_options?: {
    canAddText?: boolean;
    canAddImage?: boolean;
    allowText?: boolean;
    allowImage?: boolean;
  };
  cover_type_id?: string | null;
  cover_type_name?: string | null;
  preview_image_url?: string | null;
  requires_image?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  models: PhoneCoverProductModel[];
  supported_model_ids: string[];
}

export interface PhoneCoverPageSettings {
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  instructions_title: string;
  instructions_text: string;
  max_upload_mb: number;
  min_image_width: number;
  min_image_height: number;
  is_enabled: boolean;
}

export interface PhoneCoverCatalog {
  settings: PhoneCoverPageSettings;
  brands: PhoneCoverBrand[];
  models: PhoneCoverModel[];
  coverTypes: PhoneCoverType[];
  products: PhoneCoverCatalogProduct[];
}

