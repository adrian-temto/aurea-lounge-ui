import type { Metadata } from "next";

import HomePage from "@/components/home/HomePage";
import { languageAlternates } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { accountLink, getSession } from "@/lib/auth";
import { buildPublicMenu } from "@/lib/menu";

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
  const [{ locale }, session] = await Promise.all([getI18n(), getSession()]);
  // Visitors only receive published rows (RLS); staff get everything, which buildPublicMenu
  // filters so they see what guests see. `*` rather than a column list keeps the menu working
  // before the newer migrations run; buildPublicMenu fills in the newer columns' defaults.
  const [cats, items] = await Promise.all([
    session.supabase.from("menu_categories").select("*"),
    session.supabase.from("menu_items").select("*"),
  ]);
  if (cats.error || items.error) console.error("menu load failed", cats.error ?? items.error);

  const menu = buildPublicMenu(cats.data ?? [], items.data ?? [], locale);
  return <HomePage menu={menu} account={accountLink(session)} />;
}
