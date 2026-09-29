"use client";

import { LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { switchLocale } from "@/i18n/switch";

/** Compact "DE | EN" toggle. Each option is announced in its own language. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  return (
    <div role="group" aria-label={t.language.label} className={`flex items-center ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="mx-2 opacity-40">
              |
            </span>
          )}
          <button
            type="button"
            lang={l}
            aria-label={t.language.names[l]}
            aria-current={l === locale ? "true" : undefined}
            title={l === locale ? undefined : t.language.switchTo(t.language.names[l])}
            disabled={l === locale}
            onClick={() => switchLocale(l)}
            className={`relative min-h-6 px-0.5 uppercase tracking-[0.18em] transition-opacity duration-300 after:absolute after:inset-x-0.5 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 after:ease-aurea focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-default ${
              l === locale
                ? "opacity-100 after:scale-x-100"
                : "opacity-55 after:scale-x-0 hover:opacity-100 hover:after:scale-x-100 focus-visible:after:scale-x-100"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
