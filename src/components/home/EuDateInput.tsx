"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useI18n } from "@/i18n/client";

/** "2026-03-07" -> "07.03.2026" */
export function isoToEu(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : "";
}

/** "07.03.2026" -> "2026-03-07", or "" when it isn't a real calendar date. */
export function euToIso(eu: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(eu);
  if (!m) return "";
  const [, d, mo, y] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  const real = date.getUTCFullYear() === Number(y) && date.getUTCMonth() === Number(mo) - 1 && date.getUTCDate() === Number(d);
  return real ? `${y}-${mo}-${d}` : "";
}

/** Keeps only digits and inserts the dots as the visitor types. */
function mask(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(".") + (d.length === 2 || d.length === 4 ? "." : "");
}

/**
 * Date field that always reads DD.MM.YYYY, whatever the browser's own locale is. The value handed
 * to the form (and to `onChange`) stays ISO, so the server sees the same format as before.
 */
export function EuDateInput({
  value,
  onChange,
  min,
  name,
  required,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  name?: string;
  required?: boolean;
  className?: string;
}) {
  const { locale } = useI18n();
  const [text, setText] = useState(() => isoToEu(value));
  const picker = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // Follow changes made from outside (for example a restored selection after a language switch).
  useEffect(() => {
    setText((current) => (euToIso(current) === value ? current : isoToEu(value)));
  }, [value]);

  const iso = euToIso(text);
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    const message = text && !iso ? (locale === "de" ? "Bitte TT.MM.JJJJ eingeben." : "Please enter DD.MM.YYYY.") : iso && min && iso < min ? (locale === "de" ? "Das Datum liegt in der Vergangenheit." : "That date has already passed.") : "";
    el.setCustomValidity(message);
  }, [text, iso, min, locale]);

  return (
    <div className="relative">
      <input
        ref={field}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        value={text}
        placeholder={locale === "de" ? "TT.MM.JJJJ" : "DD.MM.YYYY"}
        maxLength={10}
        onChange={(e) => {
          const next = mask(e.target.value);
          setText(next);
          onChange(euToIso(next));
        }}
        className={`${className ?? ""} pr-10`}
      />
      {name && <input type="hidden" name={name} value={iso} />}
      <input
        ref={picker}
        type="date"
        tabIndex={-1}
        aria-hidden
        min={min}
        value={iso}
        onChange={(e) => {
          setText(isoToEu(e.target.value));
          onChange(e.target.value);
        }}
        className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
      />
      <button
        type="button"
        aria-label={locale === "de" ? "Kalender öffnen" : "Open calendar"}
        onClick={() => picker.current?.showPicker?.()}
        className="absolute right-0 top-1/2 grid -translate-y-1/2 h-8 w-8 place-items-center text-current opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        <CalendarDays className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
