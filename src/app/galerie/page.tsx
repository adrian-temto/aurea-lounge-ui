import type { Metadata } from "next";

import { GalleryPage } from "@/components/site/SubPages";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { accountLink, getSession } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.pages.gallery.metaTitle,
    description: t.pages.gallery.metaDescription,
    alternates: languageAlternates(locale, "/galerie"),
  };
}

export default async function Page() {
  const session = await getSession();
  return <GalleryPage account={accountLink(session)} />;
}
