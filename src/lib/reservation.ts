/** Booking rules shared by the reservation forms and the server action. */

/** Bookable times as HH:MM: every SLOT_MINUTES from opening to the last seating (we close at 20:00). */
export const FIRST_SLOT = "08:00";
export const LAST_SLOT = "19:30";
export const SLOT_MINUTES = 15;

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const toHhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const TIME_SLOTS = Array.from(
  { length: (toMinutes(LAST_SLOT) - toMinutes(FIRST_SLOT)) / SLOT_MINUTES + 1 },
  (_, i) => toHhmm(toMinutes(FIRST_SLOT) + i * SLOT_MINUTES),
);

/** Larger groups are arranged by phone. */
export const MAX_ONLINE_GUESTS = 8;

export const SEATING = [
  { value: "any", label: "Keine Präferenz" },
  { value: "cafe", label: "Café" },
  { value: "lounge", label: "Lounge" },
  { value: "window", label: "Fensterplatz" },
] as const;
export type Seating = (typeof SEATING)[number]["value"];

export const CONTACT = {
  phone: "+49 33204 634887",
  phoneHref: "tel:+4933204634887",
  /** Public contact address, shown on the site and in the legal pages. */
  email: "info@aurealounge.de",
  street: "Berlinerstr 196",
  city: "14547 Beelitz",
  /** What Google Maps searches for (embed and directions). */
  mapsQuery: "Berliner Str. 196, 14547 Beelitz",
};

/** Today in the café's time zone as YYYY-MM-DD, so the date picker agrees with the server. */
export const todayInBerlin = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

/** Current time in the café's time zone as HH:MM. */
export const nowInBerlin = () =>
  new Date().toLocaleTimeString("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  });
