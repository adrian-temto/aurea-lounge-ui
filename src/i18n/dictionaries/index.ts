import type { Locale } from "../config";
import de, { type Dictionary } from "./de";
import en from "./en";

export type { Dictionary };

// Both are small, so the client bundle carries both and switching needs no extra request.
const DICTIONARIES: Record<Locale, Dictionary> = { de, en };

export const getDictionary = (locale: Locale) => DICTIONARIES[locale];
