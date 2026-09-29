import { headers } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

/** The language proxy.ts resolved for this request (German when it isn't a localized route). */
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
