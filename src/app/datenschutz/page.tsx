import type { Metadata } from "next";

import { PrivacyDe } from "@/components/legal/PrivacyDe";
import { PrivacyEn } from "@/components/legal/PrivacyEn";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.meta.privacyTitle,
    description: t.meta.privacyDescription,
    alternates: languageAlternates(locale, "/datenschutz"),
  };
}

/** Datenschutzerklärung at /datenschutz, its English translation at /en/datenschutz. */
export default async function PrivacyPage() {
  const { locale } = await getI18n();
  return locale === "en" ? <PrivacyEn /> : <PrivacyDe />;
}
