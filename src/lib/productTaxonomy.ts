export interface ProductCategoryMetadata {
  id: string;
  label: string;
  aliases: readonly string[];
  order: number;
  icon: string;
  description: string;
}

export const PRODUCT_CATEGORIES = [
  {
    id: "tshirts",
    label: "T-Shirts",
    aliases: ["t-shirt", "t-shirts", "t shirt", "t shirts", "tshirt", "tshirts"],
    order: 10,
    icon: "👕",
    description: "Custom printed T-shirts",
  },
  {
    id: "magic-cup",
    label: "Mugs",
    aliases: ["mug", "mugs", "cup", "cups", "magic cup", "magic cups", "magic-cup"],
    order: 20,
    icon: "☕",
    description: "Custom printed mugs",
  },
  {
    id: "photo-frame",
    label: "Frames",
    aliases: ["frame", "frames", "photo frame", "photo frames", "photo-frame"],
    order: 30,
    icon: "🖼️",
    description: "Personalized photo frames",
  },
  {
    id: "phone-cover",
    label: "Phone Cases",
    aliases: [
      "phone case",
      "phone cases",
      "Phone Cases",
      "phone cover",
      "phone covers",
      "Phone Covers",
      "phone-cover",
      "phone-covers",
    ],
    order: 40,
    icon: "📱",
    description: "Customized phone covers",
  },
  {
    id: "posters",
    label: "Posters",
    aliases: ["poster", "posters"],
    order: 50,
    icon: "🎨",
    description: "Personalized wall art and prints",
  },
  {
    id: "combos",
    label: "Gift Combos",
    aliases: ["combo", "combos", "gift combo", "gift combos"],
    order: 60,
    icon: "🎁",
    description: "Curated personalized gift sets",
  },
  {
    id: "keychain",
    label: "Keychains",
    aliases: ["keychain", "keychains", "key chain", "key chains"],
    order: 70,
    icon: "🔑",
    description: "Custom keychains",
  },
  {
    id: "night-lamp",
    label: "Lamps",
    aliases: ["lamp", "lamps", "night lamp", "night lamps", "night-lamp"],
    order: 80,
    icon: "💡",
    description: "Personalized LED night lamps",
  },
  {
    id: "custom",
    label: "Custom",
    aliases: ["custom", "custom product", "custom products", "customizable"],
    order: 90,
    icon: "✨",
    description: "Customizable products",
  },
] as const satisfies readonly ProductCategoryMetadata[];

const normalizeCategoryToken = (value: unknown): string => {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const categoryByAlias = new Map<string, ProductCategoryMetadata>();
const categoryById = new Map<string, ProductCategoryMetadata>();

for (const category of PRODUCT_CATEGORIES) {
  categoryById.set(category.id, category);

  for (const alias of [category.id, category.label, ...category.aliases]) {
    const normalizedAlias = normalizeCategoryToken(alias);
    if (normalizedAlias) categoryByAlias.set(normalizedAlias, category);
  }
}

export const normalizeProductCategory = (value: unknown): string => {
  const normalizedValue = normalizeCategoryToken(value);
  if (!normalizedValue) return "uncategorized";

  return categoryByAlias.get(normalizedValue)?.id ?? normalizedValue;
};

const humanizeCategory = (id: string): string =>
  id
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(" ") || "Uncategorized";

export const getProductCategory = (value: unknown): ProductCategoryMetadata => {
  const id = normalizeProductCategory(value);
  const knownCategory = categoryById.get(id);

  if (knownCategory) return knownCategory;

  const label = humanizeCategory(id);
  return {
    id,
    label,
    aliases: [id],
    order: Number.MAX_SAFE_INTEGER,
    icon: "📦",
    description: id === "uncategorized" ? "Other products" : `${label} products`,
  };
};

export const getPopulatedProductCategories = (
  categoryValues: Iterable<unknown>,
): ProductCategoryMetadata[] => {
  const populatedIds = new Set<string>();

  for (const value of categoryValues) {
    populatedIds.add(normalizeProductCategory(value));
  }

  return [...populatedIds]
    .map(getProductCategory)
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label));
};

export const productCategoryMatchesSearch = (
  category: ProductCategoryMetadata,
  query: string,
): boolean => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;

  return [category.id, category.label, category.description, ...category.aliases].some((value) =>
    value.toLocaleLowerCase().includes(normalizedQuery),
  );
};
