import type { Metadata } from "next";

import { VisitPage } from "@/components/site/SubPages";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.pages.visit.metaTitle,
    description: t.pages.visit.metaDescription,
    alternates: languageAlternates(locale, "/anfahrt"),
  };
}

export default function Page() {
  return <VisitPage />;
}
