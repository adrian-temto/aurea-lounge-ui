import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

import type { MenuCategory, MenuItem } from "./types";

/** The 14 EU allergens (LMIV Annex II). Keys match the check constraint in 003_menu_hierarchy.sql. */
export const ALLERGEN_KEYS = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
] as const;
export type Allergen = (typeof ALLERGEN_KEYS)[number];
/** German labels, for the admin dashboard. */
export const ALLERGENS = ALLERGEN_KEYS.map((key) => ({
  key,
  label: getDictionary(DEFAULT_LOCALE).menu.allergenNames[key] ?? key,
}));

/** Labels in the fixed EU order, whatever order they were ticked in. */
export const allergenLabels = (keys: readonly string[], locale: Locale = DEFAULT_LOCALE) => {
  const names = getDictionary(locale).menu.allergenNames;
  return ALLERGEN_KEYS.filter((k) => keys.includes(k)).map((k) => names[k] ?? k);
};

export const MENU_BUCKET = "menu-images";
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Same pattern as the database check, so a forged path is rejected before it gets there. */
export const IMAGE_PATH = /^items\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export const imageUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MENU_BUCKET}/${path}`;

/** "13,90" in German, "13.90" in English — without the currency sign. */
export const priceLabel = (price: number, locale: Locale = DEFAULT_LOCALE) => {
  const fixed = Number(price).toFixed(2);
  return locale === "de" ? fixed.replace(".", ",") : fixed;
};

/**
 * Text in the visitor's language, or the German original when no translation exists yet.
 * `lang` says which one it is, so the page can mark German fallbacks with lang="de".
 */
export type Localized = { text: string; lang: Locale };
export function localized(de: string, en: string | null | undefined, locale: Locale): Localized {
  const translated = locale === "en" ? en?.trim() : "";
  return translated ? { text: translated, lang: "en" } : { text: de, lang: "de" };
}

export type PublicItem = {
  id: number;
  name: Localized;
  desc: Localized;
  price: string;
  tag?: "V" | "VG";
  allergens: string[];
  image: string | null;
  available: boolean;
};
export type PublicSection = { id: number; name: Localized; items: PublicItem[] };
/** One tab on the website: dishes filed directly under it, then one section per subcategory. */
export type PublicCategory = {
  id: number;
  name: Localized;
  items: PublicItem[];
  sections: PublicSection[];
};

const bySort = <T extends { sort_order: number; id: number }>(a: T, b: T) =>
  a.sort_order - b.sort_order || a.id - b.id;

/** Rows read before the 003/005 migrations have run lack the newer columns; fill their defaults. */
export const normalizeCategories = (rows: Partial<MenuCategory>[]) =>
  rows.map(
    (c) =>
      ({
        ...c,
        parent_id: c.parent_id ?? null,
        is_published: c.is_published ?? true,
        name_en: c.name_en ?? null,
      }) as MenuCategory,
  );
export const normalizeItems = (rows: Partial<MenuItem>[]) =>
  rows.map(
    (i) =>
      ({
        ...i,
        is_available: i.is_available ?? true,
        allergens: i.allergens ?? [],
        image_path: i.image_path ?? null,
        name_en: i.name_en ?? null,
        description_en: i.description_en ?? null,
      }) as MenuItem,
  );

/**
 * Turns flat rows into the public menu in one language. The database already hides
 * unpublished rows from visitors; the filters here keep the result right for staff previews
 * too, and drop categories that would show up empty.
 */
export function buildPublicMenu(
  rawCategories: Partial<MenuCategory>[],
  rawItems: Partial<MenuItem>[],
  locale: Locale = DEFAULT_LOCALE,
): PublicCategory[] {
  const categories = normalizeCategories(rawCategories);
  const items = normalizeItems(rawItems);
  const published = new Map(categories.filter((c) => c.is_published).map((c) => [c.id, c]));
  const toPublic = (i: MenuItem): PublicItem => ({
    id: i.id,
    name: localized(i.name, i.name_en, locale),
    // An empty German description stays empty rather than "falling back".
    desc: i.description ? localized(i.description, i.description_en, locale) : { text: "", lang: locale },
    price: priceLabel(i.price, locale),
    ...(i.tag ? { tag: i.tag } : {}),
    allergens: allergenLabels(i.allergens, locale),
    image: i.image_path ? imageUrl(i.image_path) : null,
    available: i.is_available,
  });
  const itemsIn = (id: number) =>
    items
      .filter((i) => i.category_id === id && i.is_visible)
      .sort(bySort)
      .map(toPublic);

  return [...published.values()]
    .filter((c) => c.parent_id === null)
    .sort(bySort)
    .map((c) => ({
      id: c.id,
      name: localized(c.name, c.name_en, locale),
      items: itemsIn(c.id),
      sections: [...published.values()]
        .filter((s) => s.parent_id === c.id)
        .sort(bySort)
        .map((s) => ({ id: s.id, name: localized(s.name, s.name_en, locale), items: itemsIn(s.id) }))
        .filter((s) => s.items.length > 0),
    }))
    .filter((c) => c.items.length > 0 || c.sections.length > 0);
}
