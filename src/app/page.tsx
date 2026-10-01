import type { Metadata } from "next";

import HomePage from "@/components/home/HomePage";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { loadPublicMenu } from "@/lib/menu-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.meta.homeTitle,
    description: t.meta.homeDescription,
    alternates: languageAlternates(locale, "/"),
    openGraph: {
      title: t.meta.homeOgTitle,
      description: t.meta.homeOgDescription,
      type: "website",
      locale: locale === "de" ? "de_DE" : "en_GB",
      alternateLocale: locale === "de" ? "en_GB" : "de_DE",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function Page() {
  const { locale } = await getI18n();
  const menu = await loadPublicMenu(locale);
  return <HomePage menu={menu} />;
}
