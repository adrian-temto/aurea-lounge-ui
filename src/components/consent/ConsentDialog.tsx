"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { OPTIONAL_CATEGORIES, type Choices, type OptionalCategory } from "@/lib/consent";
import { useI18n } from "@/i18n/client";
import { SERVICES } from "@/lib/consent-services";

export type View = "summary" | "customize";

type Props = {
  view: View | null;
  current: Choices;
  /** False on the first visit: the visitor has to pick one of the options. */
  dismissible: boolean;
  onView: (v: View) => void;
  onClose: () => void;
  onAcceptAll: () => void;
  onRejectOptional: () => void;
  onSave: (c: Choices) => void;
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
// Accept and reject share one style so neither is nudged.
const primary = `bg-foreground px-4 py-3.5 text-[0.68rem] uppercase tracking-[0.2em] text-background transition-colors duration-300 hover:bg-gold hover:text-foreground ${focusRing}`;
const secondary = `border border-foreground/30 px-4 py-3.5 text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-300 hover:border-foreground ${focusRing}`;

export function ConsentDialog({
  view,
  current,
  dismissible,
  onView,
  onClose,
  onAcceptAll,
  onRejectOptional,
  onSave,
}: Props) {
  const { locale, t } = useI18n();
  const info = t.consent.categoryInfo;
  const names = (c: keyof typeof SERVICES) =>
    SERVICES[c].map((s) => (locale === "de" ? s.name : s.nameEn));
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Optional categories start unticked; when reopened they show the saved choice.
  const [draft, setDraft] = useState<Choices>(current);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (view && !el.open) {
      setDraft(current);
      el.showModal();
    } else if (!view && el.open) {
      el.close();
    }
    // Start screen readers and keyboard users at the title of the current view.
    if (view) titleRef.current?.focus();
  }, [view, current]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      onCancel={(e) => {
        // Escape closes only once a choice exists; the first visit needs an explicit answer.
        e.preventDefault();
        if (dismissible) onClose();
      }}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[88svh] w-full max-w-none overflow-y-auto border-t border-gold/40 bg-background p-0 text-foreground shadow-2xl backdrop:bg-espresso/40 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[30rem] sm:border"
    >
      {view && (
        <div className="p-6 sm:p-8">
          <p className="eyebrow text-gold">{t.consent.eyebrow}</p>
          <h2
            id="consent-title"
            ref={titleRef}
            tabIndex={-1}
            className="mt-2 font-serif text-3xl font-light leading-tight outline-none"
          >
            {view === "summary" ? t.consent.summaryTitle : t.consent.settingsTitle}
          </h2>
          <p id="consent-desc" className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t.consent.text}{" "}
            {/* German-only until a verified translation exists. */}
            <Link
              href="/datenschutz"
              hrefLang="de"
              className={`underline underline-offset-4 hover:text-foreground ${focusRing}`}
            >
              {t.consent.learnMore}
            </Link>
          </p>

          {view === "customize" && (
            <fieldset className="mt-6 divide-y divide-border border-y border-border">
              <legend className="sr-only">{t.consent.categories}</legend>
              <CategoryRow
                id="necessary"
                title={info.necessary.title}
                description={info.necessary.description}
                checked
                disabled
                services={names("necessary")}
              />
              {OPTIONAL_CATEGORIES.map((c: OptionalCategory) => (
                <CategoryRow
                  key={c}
                  id={c}
                  title={info[c].title}
                  description={info[c].description}
                  checked={draft[c]}
                  onChange={(v) => setDraft({ ...draft, [c]: v })}
                  services={names(c)}
                />
              ))}
            </fieldset>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={onRejectOptional} className={primary}>
              {t.consent.rejectOptional}
            </button>
            <button type="button" onClick={onAcceptAll} className={primary}>
              {t.consent.acceptAll}
            </button>
            {view === "summary" ? (
              <button
                type="button"
                onClick={() => onView("customize")}
                className={`${secondary} sm:col-span-2`}
              >
                {t.consent.settings}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSave(draft)}
                className={`${secondary} sm:col-span-2`}
              >
                {t.consent.save}
              </button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

function CategoryRow({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
  services,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  services: string[];
}) {
  const { t } = useI18n();
  const inputId = `consent-${id}`;
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={inputId} className="cursor-pointer">
          <span className="block text-sm font-medium">{title}</span>
          <span
            id={`${inputId}-desc`}
            className="mt-1 block text-xs leading-relaxed text-muted-foreground"
          >
            {description}
          </span>
        </label>
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            id={inputId}
            type="checkbox"
            role="switch"
            checked={checked}
            disabled={disabled}
            aria-describedby={`${inputId}-desc ${inputId}-services`}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <span
            aria-hidden
            className="flex h-6 w-11 items-center rounded-full bg-foreground/20 p-0.5 transition-colors duration-200 peer-checked:bg-foreground peer-disabled:opacity-60 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold [&>span]:transition-transform [&>span]:duration-200 peer-checked:[&>span]:translate-x-5"
          >
            <span className="size-5 rounded-full bg-background shadow" />
          </span>
        </span>
      </div>
      <p id={`${inputId}-services`} className="mt-2 text-xs text-muted-foreground">
        {disabled
          ? `${t.consent.alwaysActive} · ${services.join(", ")}`
          : services.length
            ? `${t.consent.services}: ${services.join(", ")}`
            : t.consent.none}
      </p>
    </div>
  );
}
