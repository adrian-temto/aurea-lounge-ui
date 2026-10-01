import type { Metadata } from "next";

import { AboutPage } from "@/components/site/SubPages";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.pages.about.metaTitle,
    description: t.pages.about.metaDescription,
    alternates: languageAlternates(locale, "/ueber-uns"),
  };
}

export default function Page() {
  return <AboutPage />;
}
