import type { Metadata } from "next";

import { VisitPage } from "@/components/site/SubPages";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { accountLink, getSession } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.pages.visit.metaTitle,
    description: t.pages.visit.metaDescription,
    alternates: languageAlternates(locale, "/anfahrt"),
  };
}

export default async function Page() {
  const session = await getSession();
  return <VisitPage account={accountLink(session)} />;
}
