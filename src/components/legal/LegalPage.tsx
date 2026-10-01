import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { localizePath, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { Service } from "@/lib/consent-services";

/** Shared frame and building blocks of the Impressum, the privacy policy and the opt-in page. */
export function LegalPage({
  locale,
  eyebrow,
  title,
  titleEm,
  children,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  titleEm: string;
  children: ReactNode;
}) {
  const t = getDictionary(locale).legal;
  const home = localizePath(locale, "/");
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href={home} aria-label={t.homeAria} className="shrink-0">
            <img src="/logo.svg" alt="Auréa" width={645} height={167} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-5">
            <LanguageSwitcher className="text-[0.7rem]" />
            <Link
              href={home}
              className="link-line hidden text-[0.7rem] uppercase tracking-[0.22em] sm:inline"
            >
              {t.backToSite}
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-[max(4rem,env(safe-area-inset-bottom))] pt-16 md:pb-24 md:pt-24">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none md:text-7xl">
          {title}
          <em>{titleEm}</em>
        </h1>
        {children}
      </article>
    </main>
  );
}

/** Gaps in LEGAL are flagged while developing and left out of the live page. */
const SHOW_GAPS = process.env.NODE_ENV !== "production";
export function Missing({ children }: { children: ReactNode }) {
  if (!SHOW_GAPS) return null;
  return <mark className="bg-gold/30 px-1 text-foreground">Fehlt: {children}</mark>;
}

export type TocEntry = readonly [id: string, title: string];

export function Toc({ entries, label }: { entries: readonly TocEntry[]; label: string }) {
  return (
    <nav aria-label={label} className="mt-10 border-y border-border py-6">
      <ol className="grid gap-2 text-sm sm:grid-cols-2">
        {entries.map(([id, title], i) => (
          <li key={id}>
            <a href={`#${id}`} className="link-line inline-block py-1">
              {i + 1}. {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Section({
  id,
  entries,
  children,
}: {
  id: string;
  entries: readonly TocEntry[];
  children: ReactNode;
}) {
  const index = entries.findIndex(([s]) => s === id);
  return (
    <section className="mt-14 scroll-mt-8" aria-labelledby={id}>
      <h2 id={id} className="font-serif text-3xl font-light">
        {index >= 0 ? `${index + 1}. ` : ""}
        {entries[index]?.[1]}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border border-y border-border text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-4 md:grid-cols-[180px_1fr] md:gap-6">
          <dt className="text-foreground/80">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ServiceList({ services, locale }: { services: Service[]; locale: Locale }) {
  const en = locale === "en";
  return (
    <dl className="mt-6 divide-y divide-border border-y border-border">
      {services.map((s) => {
        const x = en ? s.en : s;
        return (
          <div key={s.name} className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:gap-6">
            <dt>
              <span className="block font-medium text-foreground">{en ? s.nameEn : s.name}</span>
              <span className="block text-xs text-muted-foreground">{x.provider}</span>
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground">{x.purpose}</p>
              <p className="mt-2">
                <span className="text-foreground/80">{en ? "Storage:" : "Speicher:"}</span>{" "}
                {x.storage}
              </p>
              <p>
                <span className="text-foreground/80">{en ? "Duration:" : "Dauer:"}</span>{" "}
                {x.retention}
              </p>
              {x.scope && (
                <p>
                  <span className="text-foreground/80">{en ? "Applies:" : "Betrifft:"}</span>{" "}
                  {x.scope}
                </p>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export const legalButton =
  "inline-flex min-h-11 items-center border border-foreground px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.25em] transition-colors duration-500 hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
