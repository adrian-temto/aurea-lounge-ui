import type { Category } from "./consent";

/**
 * Every cookie, storage entry and third-party service the site actually uses.
 * The consent modal and /datenschutz both render from this list — when you add a
 * service (analytics, a map embed, a booking widget…), add it here with its real
 * category, and load it through <ConsentGate category=…>.
 */
export type Service = {
  name: string;
  /** Name shown in the English cookie dialog. */
  nameEn: string;
  provider: string;
  purpose: string;
  /** Cookie / storage key, or "—" when the service sets none. */
  storage: string;
  retention: string;
  /** Who is affected, when it isn't every visitor. */
  scope?: string;
};

export const CATEGORY_INFO: Record<Category, { title: string; description: string }> = {
  necessary: {
    title: "Notwendig",
    description:
      "Damit die Website, die Tischreservierung und die Anmeldung funktionieren. Diese Technologien sind immer aktiv.",
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
    },
    {
      name: "Anmeldung (Supabase Auth)",
      nameEn: "Sign-in (Supabase Auth)",
      provider: "Supabase Inc.",
      purpose: "Hält dich nach dem Einloggen angemeldet (Mein Konto, Dashboard).",
      storage: "Cookie sb-<Projekt-ID>-auth-token (ggf. aufgeteilt in .0, .1 …)",
      retention: "bis zum Abmelden, höchstens 400 Tage",
      scope: "nur nach Anmeldung oder Registrierung",
    },
    {
      name: "E-Mail-Bestätigung (Supabase Auth)",
      nameEn: "Email confirmation (Supabase Auth)",
      provider: "Supabase Inc.",
      purpose:
        "Sicherheitsschlüssel, der den Bestätigungslink aus der Registrierungs-E-Mail prüft.",
      storage: "Cookie sb-<Projekt-ID>-auth-token-code-verifier",
      retention: "bis zur Bestätigung, höchstens 400 Tage",
      scope: "nur bei der Registrierung",
    },
    {
      name: "Reservierungen & Speisekarte",
      nameEn: "Reservations & menu",
      provider: "Supabase Inc.",
      purpose:
        "Speichert deine Reservierungsanfrage (Name, Telefon, E-Mail, Datum, Uhrzeit, Personen, Wünsche, deine Häkchen zu AGB und Werbung) und liefert die Speisekarte aus.",
      storage: "— (keine Cookies)",
      retention: "Reservierungen, bis wir sie löschen",
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
      scope: "nur wenn du „Informationen speichern“ ankreuzt",
    },
    {
      name: "Reservierungshinweis",
      nameEn: "Reservation prompt",
      provider: "Auréa (diese Website)",
      purpose:
        "Merkt sich, dass wir dir das Reservierungsfenster in diesem Tab schon angeboten haben, damit es nicht erneut erscheint.",
      storage: "Session Storage aurea_reserve_prompted",
      retention: "bis du den Tab schließt",
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
    },
    {
      name: "Seitenleiste im Dashboard",
      nameEn: "Dashboard sidebar",
      provider: "Auréa (diese Website)",
      purpose: "Merkt sich, ob die Seitenleiste ein- oder ausgeklappt ist.",
      storage: "Cookie sidebar_state",
      retention: "7 Tage",
      scope: "nur für das Team im Admin-Bereich",
    },
  ],
  analytics: [],
  marketing: [],
  media: [],
};
