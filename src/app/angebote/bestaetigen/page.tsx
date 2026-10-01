import type { Metadata } from "next";

import { ConfirmOffers } from "@/components/legal/ConfirmOffers";
import { LegalPage } from "@/components/legal/LegalPage";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.offersTitle, robots: { index: false } };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Landing page of the double opt-in link (/angebote/bestaetigen?token=…). */
export default async function ConfirmOffersPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ locale, t }, sp] = await Promise.all([getI18n(), searchParams]);
  const token = typeof sp["token"] === "string" ? sp["token"] : "";
  return (
    <LegalPage
      locale={locale}
      eyebrow={t.offers.eyebrow}
      title={`${t.offers.title} `}
      titleEm={t.offers.titleEm}
    >
      <ConfirmOffers token={token} />
    </LegalPage>
  );
}
