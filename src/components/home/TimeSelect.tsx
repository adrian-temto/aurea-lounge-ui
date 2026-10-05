"use client";

import { ChevronDown } from "lucide-react";

import { useI18n } from "@/i18n/client";

/**
 * Picks one of `slots` (HH:MM) as an hour and a minute. Changing the hour keeps the minute when
 * that hour offers it, otherwise takes its first. With `name`, the time is also sent with the form.
 */
export function TimeSelect({
  slots,
  value,
  onChange,
  name,
  required,
  hourClassName,
  minuteClassName,
  optionClassName,
  chevrons = false,
}: {
  slots: string[];
  value: string;
  onChange: (time: string) => void;
  name?: string;
  required?: boolean;
  hourClassName: string;
  minuteClassName: string;
  optionClassName?: string;
  /** Draws a chevron on each select, for selects styled with appearance-none. */
  chevrons?: boolean;
}) {
  const { t } = useI18n();
  const [hour = "", minute = ""] = value ? value.split(":") : [];
  const hours = [...new Set(slots.map((s) => s.slice(0, 2)))];
  const minutes = slots.filter((s) => s.startsWith(`${hour}:`)).map((s) => s.slice(3));

  const pickHour = (h: string) => {
    const inHour = slots.filter((s) => s.startsWith(`${h}:`));
    onChange(inHour.find((s) => s.endsWith(`:${minute}`)) ?? inHour[0] ?? "");
  };

  const chevron = chevrons && (
    <ChevronDown
      className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
      aria-hidden
    />
  );
  const disabled = !slots.length;

  return (
    <span className="flex w-full min-w-0 items-center gap-1.5">
      {name && <input type="hidden" name={name} value={value} />}
      <span className="relative flex min-w-0 flex-1 items-center">
        <select
          aria-label={t.reservation.hour}
          value={hour}
          required={required}
          disabled={disabled}
          onChange={(e) => pickHour(e.target.value)}
          className={hourClassName}
        >
          {disabled && <option value="">—</option>}
          {hours.map((h) => (
            <option key={h} value={h} className={optionClassName}>
              {h}
            </option>
          ))}
        </select>
        {chevron}
      </span>
      <span aria-hidden className="text-muted-foreground">
        :
      </span>
      <span className="relative flex min-w-0 flex-1 items-center">
        <select
          aria-label={t.reservation.minute}
          value={minute}
          required={required}
          disabled={disabled}
          onChange={(e) => onChange(`${hour}:${e.target.value}`)}
          className={minuteClassName}
        >
          {disabled && <option value="">—</option>}
          {minutes.map((m) => (
            <option key={m} value={m} className={optionClassName}>
              {m}
            </option>
          ))}
        </select>
        {chevron}
      </span>
    </span>
  );
}
