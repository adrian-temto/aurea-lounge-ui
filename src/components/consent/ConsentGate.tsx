"use client";

import type { ReactNode } from "react";

import type { OptionalCategory } from "@/lib/consent";
import { useI18n } from "@/i18n/client";

import { useConsent } from "./ConsentProvider";

/**
 * Renders an optional script or embed only after the visitor accepted its category.
 * Until then nothing from the provider is requested; embeds show a placeholder instead.
 *
 *   <ConsentGate category="analytics"><Script src="…" /></ConsentGate>
 *   <ConsentGate category="media" placeholder="Google Maps" className="aspect-video">
 *     <iframe src="…" />
 *   </ConsentGate>
 */
export function ConsentGate({
  category,
  placeholder,
  className,
  children,
}: {
  category: OptionalCategory;
  /** Provider name for a visible placeholder; omit for invisible scripts. */
  placeholder?: string;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { ready, allows, openSettings } = useConsent();
  const title = t.consent.categoryInfo[category].title;
  if (ready && allows(category)) return <>{children}</>;
  if (!placeholder) return null;

  return (
    <div
      className={`grid place-items-center border border-dashed border-border bg-card p-6 text-center ${className ?? ""}`}
    >
      <div className="max-w-xs">
        <p className="eyebrow text-muted-foreground">{title}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t.consent.gate(placeholder, title)}
        </p>
        <button
          type="button"
          onClick={openSettings}
          className="mt-5 border border-foreground/30 px-5 py-3 text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-300 hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {t.consent.settingsTitle}
        </button>
      </div>
    </div>
  );
}
