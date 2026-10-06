"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { de, enUS } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
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

/** Local calendar day <-> "YYYY-MM-DD", without a time-zone shift. */
const parseIso = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined;
};
const formatIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Date field that always reads DD.MM.YYYY. A click opens a calendar to pick the day from; typing
 * the date still works from the keyboard. The value handed to the form (and to `onChange`) stays
 * ISO, so the server sees the same format as before.
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
  const [open, setOpen] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

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

  const selected = parseIso(iso);
  const minDate = min ? parseIso(min) : undefined;
  const startMonth = selected ?? minDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={wrapper} className="relative w-full min-w-0">
          <input
            ref={field}
            type="text"
            // No on-screen keyboard on phones: the calendar is how you pick. A hardware keyboard
            // can still type the date.
            inputMode="none"
            autoComplete="off"
            required={required}
            value={text}
            placeholder={locale === "de" ? "Datum wählen" : "Choose a date"}
            maxLength={10}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            onChange={(e) => {
              const next = mask(e.target.value);
              setText(next);
              onChange(euToIso(next));
            }}
            className={`${className ?? ""} cursor-pointer pr-10`}
          />
          {name && <input type="hidden" name={name} value={iso} />}
          <CalendarDays
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
            aria-hidden
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={8}
        collisionPadding={12}
        // Above the reservation dialog (z-[60]), which this calendar opens from.
        className="z-[70] w-auto rounded-2xl border-border/60 p-4 shadow-2xl"
        // Clicking the field again must not close and reopen the calendar.
        onInteractOutside={(e) => {
          if (wrapper.current?.contains(e.target as Node)) e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          field.current?.focus();
        }}
      >
        <Calendar
          mode="single"
          autoFocus
          locale={locale === "de" ? de : enUS}
          weekStartsOn={1}
          {...(selected ? { selected } : {})}
          {...(startMonth ? { defaultMonth: startMonth } : {})}
          {...(minDate ? { disabled: { before: minDate } } : {})}
          onSelect={(day) => {
            if (!day) return;
            const next = formatIso(day);
            setText(isoToEu(next));
            onChange(next);
            setOpen(false);
          }}
          className="p-0"
        />
      </PopoverContent>
    </Popover>
  );
}
