import type { Category } from "./consent";

/**
 * Every cookie, storage entry and third-party service the site actually uses.
 * The consent modal and /datenschutz (German and English) both render from this list — when
 * you add a service (analytics, a map embed, a booking widget…), add it here with its real
 * category and both languages, and load it through <ConsentGate category=…>.
 */
type ServiceText = {
  provider: string;
  purpose: string;
  /** Cookie / storage key, or "—" when the service sets none. */
  storage: string;
  retention: string;
  /** Who is affected, when it isn't every visitor. */
  scope?: string;
};

export type Service = ServiceText & {
  name: string;
  /** Name shown in the English cookie dialog and privacy policy. */
  nameEn: string;
  en: ServiceText;
};

export const CATEGORY_INFO: Record<Category, { title: string; description: string }> = {
  necessary: {
    title: "Notwendig",
    description:
      "Damit die Website und die Tischreservierung funktionieren. Diese Technologien sind immer aktiv.",
  },
  analytics: {
    title: "Statistik",
    description:
      "Hilft uns zu verstehen, wie die Website genutzt wird, z. B. welche Seiten besucht werden.",
  },
  marketing: {
    title: "Marketing",
    description:
      "Für Werbung und Social-Media-Pixel, die dich auf anderen Websites wiedererkennen.",
  },
  media: {
    title: "Externe Inhalte",
    description:
      "Eingebettete Inhalte anderer Anbieter, z. B. Karten, Videos oder Buchungs-Widgets, die beim Laden Daten an diese Anbieter senden.",
  },
};

export const SERVICES: Record<Category, Service[]> = {
  necessary: [
    {
      name: "Cookie-Einstellungen",
      nameEn: "Cookie settings",
      provider: "Auréa (diese Website)",
      purpose:
        "Speichert deine Auswahl in diesem Fenster, damit wir nicht bei jedem Besuch fragen.",
      storage: "Cookie aurea_consent",
      retention: "12 Monate",
      en: {
        provider: "Auréa (this website)",
        purpose: "Stores your choice in this dialog so we don't ask on every visit.",
        storage: "Cookie aurea_consent",
        retention: "12 months",
      },
    },
    {
      name: "Team-Anmeldung (Supabase Auth)",
      nameEn: "Team sign-in (Supabase Auth)",
      provider: "Supabase Inc.",
      purpose: "Hält Mitarbeitende im Admin-Bereich angemeldet. Gäste haben keine Konten.",
      storage: "Cookie sb-<Projekt-ID>-auth-token (ggf. aufgeteilt in .0, .1 …)",
      retention: "bis zum Abmelden, höchstens 400 Tage",
      scope: "nur für das Team im Admin-Bereich (eigene Subdomain)",
      en: {
        provider: "Supabase Inc.",
        purpose: "Keeps staff signed in to the admin area. Guests have no accounts.",
        storage: "Cookie sb-<project-id>-auth-token (possibly split into .0, .1 …)",
        retention: "until sign-out, at most 400 days",
        scope: "only for our team in the admin area (separate subdomain)",
      },
    },
    {
      name: "Reservierungen & Speisekarte",
      nameEn: "Reservations & menu",
      provider: "Supabase Inc.",
      purpose:
        "Speichert deine Reservierungsanfrage (Name, Telefon, E-Mail, Datum, Uhrzeit, Personen, Wünsche, deine Auswahl zu Angeboten per E-Mail und ggf. deren Bestätigung) und liefert die Speisekarte aus.",
      storage: "— (keine Cookies)",
      retention:
        "bis zur Löschung auf Anfrage, spätestens 2 Jahre nach dem Reservierungsdatum werden die personenbezogenen Daten automatisch anonymisiert",
      en: {
        provider: "Supabase Inc.",
        purpose:
          "Stores your reservation request (name, phone, email, date, time, party size, requests, your choice about offers by email and, if given, its confirmation) and serves the menu.",
        storage: "— (no cookies)",
        retention:
          "until deleted at your request; 2 years after the reservation date, the personal data is anonymised automatically",
      },
    },
    {
      name: "Gespeicherte Kontaktdaten",
      nameEn: "Saved contact details",
      provider: "Auréa (diese Website)",
      purpose:
        "Füllt Name, Telefon und E-Mail bei deiner nächsten Reservierung auf diesem Gerät automatisch aus. Die Daten bleiben in deinem Browser und werden nicht an uns gesendet.",
      storage: "Local Storage aurea_guest_contact",
      retention:
        "bis du das Häkchen bei einer Reservierung entfernst oder die Browserdaten löschst",
      scope: "nur wenn du „Speichern Sie die Informationen …“ ankreuzt",
      en: {
        provider: "Auréa (this website)",
        purpose:
          "Fills in name, phone and email for your next reservation on this device. The data stays in your browser and is not sent to us.",
        storage: "Local storage aurea_guest_contact",
        retention: "until you untick the box when booking or clear your browser data",
        scope: "only if you tick “Save my details for my next reservations”",
      },
    },
    {
      name: "Spracheinstellung",
      nameEn: "Language preference",
      provider: "Auréa (diese Website)",
      purpose:
        "Merkt sich, dass du über den Sprachumschalter Deutsch oder Englisch gewählt hast, und öffnet die Website beim nächsten Besuch in dieser Sprache.",
      storage: "Cookie aurea_lang",
      retention: "12 Monate",
      scope: "nur nach Nutzung des Sprachumschalters",
      en: {
        provider: "Auréa (this website)",
        purpose:
          "Remembers that you chose German or English in the language switcher and opens the website in that language on your next visit.",
        storage: "Cookie aurea_lang",
        retention: "12 months",
        scope: "only after using the language switcher",
      },
    },
    {
      name: "Sprachwechsel",
      nameEn: "Language switch",
      provider: "Auréa (diese Website)",
      purpose:
        "Übergibt beim Sprachwechsel die Scrollposition, den geöffneten Reiter der Karte sowie Datum, Uhrzeit und Personenzahl des Reservierungsformulars an die Seite in der anderen Sprache. Name, Telefonnummer und E-Mail werden dabei nicht übergeben.",
      storage: "Session Storage aurea_locale_switch",
      retention: "wird beim Laden der neuen Seite sofort gelöscht",
      scope: "nur beim Sprachwechsel",
      en: {
        provider: "Auréa (this website)",
        purpose:
          "When you switch language, passes the scroll position, the open menu tab and the date, time and party size of the booking form to the page in the other language. Name, phone and email are not passed on.",
        storage: "Session storage aurea_locale_switch",
        retention: "deleted as soon as the new page has loaded",
        scope: "only when switching language",
      },
    },
    {
      name: "Seitenleiste im Dashboard",
      nameEn: "Dashboard sidebar",
      provider: "Auréa (diese Website)",
      purpose: "Merkt sich, ob die Seitenleiste ein- oder ausgeklappt ist.",
      storage: "Cookie sidebar_state",
      retention: "7 Tage",
      scope: "nur für das Team im Admin-Bereich",
      en: {
        provider: "Auréa (this website)",
        purpose: "Remembers whether the sidebar is expanded or collapsed.",
        storage: "Cookie sidebar_state",
        retention: "7 days",
        scope: "only for our team in the admin area",
      },
    },
  ],
  analytics: [],
  marketing: [],
  media: [
    {
      name: "Google Maps",
      nameEn: "Google Maps",
      provider: "Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland",
      purpose:
        "Zeigt unseren Standort auf einer interaktiven Karte (Seite „Anfahrt“). Beim Laden der Karte überträgt dein Browser u. a. deine IP-Adresse an Google; Google kann dabei Cookies setzen und Daten in die USA übermitteln (EU-US Data Privacy Framework).",
      storage: "Cookies von google.com (z. B. NID), gesetzt von Google",
      retention: "laut Google, z. B. NID 6 Monate",
      scope: "nur wenn du externe Inhalte erlaubst oder „Karte laden“ wählst",
      en: {
        provider: "Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland",
        purpose:
          "Shows our location on an interactive map (“Visit” page). When the map loads, your browser sends Google your IP address among other data; Google may set cookies and transfer data to the USA (EU-US Data Privacy Framework).",
        storage: "Cookies from google.com (e.g. NID), set by Google",
        retention: "according to Google, e.g. NID 6 months",
        scope: "only if you allow external content or choose “Load map”",
      },
    },
  ],
};
