import type { Reservation, ReservationStatus } from "@/lib/types";

// Fixed time zone so the server render and the browser agree.
export const TZ = "Europe/Berlin";

/** Today in the café's time zone as YYYY-MM-DD. */
export const todayISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: TZ });

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export function shortDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function longDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "Heute", "Morgen", or the long date. */
export function relativeDay(d: string, today: string) {
  if (d === today) return "Heute";
  if (d === addDays(today, 1)) return "Morgen";
  if (d === addDays(today, -1)) return "Gestern";
  return longDate(d);
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** "vor 5 Min." style age for when a request came in. */
export function timeAgo(iso: string, now = Date.now()) {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min.`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.round(h / 24);
  return d === 1 ? "vor 1 Tag" : `vor ${d} Tagen`;
}

export const euro = (n: number) => `€${Number(n).toFixed(2).replace(".", ",")}`;

export const time = (r: Reservation) => r.reservation_time.slice(0, 5);

export const guests = (n: number) => `${n >= 7 ? "7+" : n} ${n === 1 ? "Person" : "Pers."}`;

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  new: "Offen",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  cancelled: "Storniert",
};

export const byDateTime = (a: Reservation, b: Reservation) =>
  (a.reservation_date + a.reservation_time).localeCompare(b.reservation_date + b.reservation_time);

// Shared by the server page and the client view, so it can't live in a "use client" file.
export const FILTER_KEYS = [
  "upcoming",
  "today",
  "new",
  "confirmed",
  "declined",
  "cancelled",
  "all",
] as const;
export type Filter = (typeof FILTER_KEYS)[number];
