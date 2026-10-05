/** Booking rules shared by the reservation forms and the server action. */

export const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "17:00", "19:00", "20:30", "22:00"];

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
