"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { DEFAULT_LOCALE, localizePath, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

type I18n = {
  locale: Locale;
  t: ReturnType<typeof getDictionary>;
  /** Localizes an internal path: href("/karte") is "/en/karte" on the English site. */
  href: (path: string) => string;
};

const make = (locale: Locale): I18n => ({
  locale,
  t: getDictionary(locale),
  href: (path) => localizePath(locale, path),
});

// German outside a provider, e.g. in admin screens and isolated component tests.
const I18nContext = createContext<I18n>(make(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => make(locale), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
