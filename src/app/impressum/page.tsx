import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LegalPage, Missing } from "@/components/legal/LegalPage";
import { languageAlternates, type Locale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { LEGAL } from "@/lib/legal";
import { CONTACT } from "@/lib/reservation";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return { title: t.meta.imprintTitle, alternates: languageAlternates(locale, "/impressum") };
}

/**
 * Impressum (§ 5 DDG, § 18 Abs. 2 MStV) at /impressum, English at /en/impressum. The facts come
 * from lib/legal.ts; missing ones are flagged while developing and left out live.
 */
const COPY = {
  de: {
    eyebrow: "Rechtliches",
    title: "Impres",
    titleEm: "sum",
    provider: "Angaben gemäß § 5 DDG",
    country: "",
    represented: "Vertreten durch",
    contact: "Kontakt",
    phone: "Telefon",
    email: "E-Mail",
    register: "Registereintrag",
    vat: "Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG",
    responsible: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    dispute: "Verbraucherstreitbeilegung",
    disputeText:
      "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    note: null as string | null,
  },
  en: {
    eyebrow: "Legal",
    title: "Legal ",
    titleEm: "notice",
    provider: "Information pursuant to Section 5 DDG (German Digital Services Act)",
    country: ", Germany",
    represented: "Represented by",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    register: "Commercial register",
    vat: "VAT identification number pursuant to Section 27a UStG",
    responsible: "Responsible for content pursuant to Section 18(2) MStV",
    dispute: "Consumer dispute resolution",
    disputeText:
      "We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.",
    note: "This English version is provided for convenience; the German Impressum is authoritative.",
  },
} satisfies Record<Locale, unknown>;

export default async function ImprintPage() {
  const { locale } = await getI18n();
  const c = COPY[locale];
  return (
    <LegalPage locale={locale} eyebrow={c.eyebrow} title={c.title} titleEm={c.titleEm}>
      {c.note && (
        <p className="mt-8 border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted-foreground">
          {c.note}
        </p>
      )}

      <Block title={c.provider}>
        <address className="not-italic">
          {LEGAL.owner ?? (
            <Missing>Name der Inhaberin / des Inhabers bzw. Firma mit Rechtsform</Missing>
          )}
          <br />
          {LEGAL.businessName}
          <br />
          {CONTACT.street}
          <br />
          {CONTACT.city}
          {c.country}
        </address>
      </Block>

      {LEGAL.representative && (
        <Block title={c.represented}>
          <p>{LEGAL.representative}</p>
        </Block>
      )}

      <Block title={c.contact}>
        <p>
          {c.phone}:{" "}
          <a href={CONTACT.phoneHref} className="link-line">
            {CONTACT.phone}
          </a>
          <br />
          {c.email}:{" "}
          {LEGAL.email ? (
            <a href={`mailto:${LEGAL.email}`} className="link-line">
              {LEGAL.email}
            </a>
          ) : (
            <Missing>E-Mail-Adresse (Pflichtangabe)</Missing>
          )}
        </p>
      </Block>

      {LEGAL.register ? (
        <Block title={c.register}>
          <p>{LEGAL.register}</p>
        </Block>
      ) : (
        <p className="mt-8">
          <Missing>
            Registergericht und -nummer, falls im Handelsregister eingetragen (sonst weglassen)
          </Missing>
        </p>
      )}

      {LEGAL.vatId ? (
        <Block title={c.vat}>
          <p>{LEGAL.vatId}</p>
        </Block>
      ) : (
        <p className="mt-8">
          <Missing>USt-IdNr., falls vorhanden (sonst weglassen)</Missing>
        </p>
      )}

      <Block title={c.responsible}>
        <p>
          {LEGAL.contentResponsible ?? LEGAL.owner ?? (
            <Missing>verantwortliche Person mit Anschrift</Missing>
          )}
          {(LEGAL.contentResponsible ?? LEGAL.owner) && (
            <>
              <br />
              {CONTACT.street}, {CONTACT.city}
              {c.country}
            </>
          )}
        </p>
      </Block>

      <Block title={c.dispute}>
        <p>{c.disputeText}</p>
      </Block>
    </LegalPage>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-light md:text-3xl">{title}</h2>
      <div className="mt-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
