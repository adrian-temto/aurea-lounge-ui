import type { Metadata } from "next";

import { MenuPage } from "@/components/site/SubPages";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { accountLink, getSession } from "@/lib/auth";
import { loadPublicMenu } from "@/lib/menu-server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.pages.menu.metaTitle,
    description: t.pages.menu.metaDescription,
    alternates: languageAlternates(locale, "/karte"),
  };
}

export default async function Page() {
  const [{ locale }, session] = await Promise.all([getI18n(), getSession()]);
  const menu = await loadPublicMenu(session, locale);
  return <MenuPage menu={menu} account={accountLink(session)} />;
}
