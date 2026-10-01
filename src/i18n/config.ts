/**
 * Languages of the public site. German lives at the root (/, /karte, …), English under
 * /en. proxy.ts maps /en/... onto the same routes and tells them the language through
 * LOCALE_HEADER, so pages and components never parse the URL themselves.
 */
export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

/** Set only when a visitor picks a language in the switcher; remembers it for later visits. */
export const LOCALE_COOKIE = "aurea_lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const LOCALE_HEADER = "x-aurea-locale";
/** sessionStorage key that carries selections across a language switch (see switch.ts). */
export const LOCALE_SWITCH_KEY = "aurea_locale_switch";

/** Routes that exist in both languages. The admin host is German only. */
export const LOCALIZED_ROUTES = [
  "/",
  "/karte",
  "/ueber-uns",
  "/galerie",
  "/anfahrt",
  "/datenschutz",
  "/impressum",
  "/angebote",
] as const;

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

export const isLocalizedRoute = (path: string) =>
  LOCALIZED_ROUTES.some((r) => path === r || (r !== "/" && path.startsWith(`${r}/`)));

/** "/karte" → "/en/karte" for English; unchanged for German. Keeps ?query and #hash. */
export function localizePath(locale: Locale, path: string) {
  if (locale === DEFAULT_LOCALE) return path;
  const [, pathname = "/", rest = ""] = /^([^?#]*)(.*)$/.exec(path) ?? [];
  return `/${locale}${pathname === "/" ? "" : pathname}${rest}`;
}

/** Splits "/en/karte" into { locale: "en", path: "/karte" }; unprefixed paths are German. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/(en)(\/.*)?$/.exec(pathname);
  if (m) return { locale: "en", path: m[2] || "/" };
  return { locale: DEFAULT_LOCALE, path: pathname };
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aurealounge.de";

/** Canonical URL plus hreflang alternates for a route that exists in both languages. */
export const languageAlternates = (locale: Locale, path: string) => ({
  canonical: localizePath(locale, path),
  languages: { de: path, en: localizePath("en", path), "x-default": path },
});
