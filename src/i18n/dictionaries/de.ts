/**
 * German — the default language and the source of truth for the dictionary's shape.
 * en.ts must provide every key (TypeScript enforces it). Admin screens stay German-only.
 */
const de = {
  meta: {
    homeTitle: "Auréa — Frühstück, Café & Lounge in Beelitz",
    homeDescription:
      "Eine goldene Stunde, von früh bis spät. Frühstück, Specialty Coffee und eine intime Abend-Lounge in Beelitz.",
    homeOgTitle: "Auréa — Frühstück, Café & Lounge",
    homeOgDescription:
      "Wo Morgenlicht auf Kerzenschein trifft. Frühstück, Kaffee und Abende bei Kerzenschein in Beelitz.",
    joinTitle: "Konto — Auréa",
    joinDescription: "Werde Teil von Auréa — erstelle ein Konto oder melde dich an.",
    accountTitle: "Mein Konto — Auréa",
    notFoundTitle: "Seite nicht gefunden — Auréa",
  },

  language: {
    label: "Sprache",
    names: { de: "Deutsch", en: "English" },
    switchTo: (name: string) => `Sprache wechseln: ${name}`,
  },

  nav: {
    items: [
      ["Start", "#top"],
      ["Frühstück", "#tag"],
      ["Café", "#tag"],
      ["Lounge", "#tag"],
      ["Karte", "#menu"],
      ["Unsere Story", "#story"],
      ["Anfahrt", "#visit"],
    ] as [string, string][],
    home: "Auréa — Startseite",
    logoAlt: "Auréa — Breakfast · Café · Lounge",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    reserve: "Tisch reservieren",
    account: { join: "Login", account: "Mein Konto", dashboard: "Dashboard" },
    address: "Berlinerstr 196 · Beelitz · +49 33204 634887",
  },

  hero: {
    imageAlt: "Auréa Café im Morgenlicht mit Messingdetails und Kerzen",
    eyebrow: "Breakfast · Café · Lounge",
    title: "Eine goldene Stunde,",
    titleEm: "von früh bis spät.",
    text: "Wo Morgenlicht auf Kerzenschein trifft. Ein warmer Rückzugsort für entspannte Kaffees, gemütliche Frühstücke und ruhige Gespräche.",
    reserve: "Tisch reservieren",
    menu: "Karte entdecken",
  },

  intro: {
    eyebrow: "Drei Momente, ein Ort",
    title: "Ein Tag bei",
    titleEm: "Auréa",
    text: "Vom ersten Espresso bis zum letzten Glas Wein — wir halten den Herd warm, durch jeden Moment des Tages.",
  },

  chapters: [
    {
      time: "Ab 08:00",
      title: "Frühstück",
      alt: "Frühstückstisch mit Eggs Benedict und Sauerteigbrot",
      copy: "Sauerteigbrot, weiche Eier, Steinobstmarmelade und mehr — für einen guten Start in den Tag.",
    },
    {
      time: "Ab 11:00",
      title: "Café",
      alt: "Flat White und Croissant auf Marmortisch",
      copy: "Specialty Coffee, frisches Gebäck und eine volle Mittagskarte für den langen Nachmittag.",
    },
    {
      time: "Ab 18:00",
      title: "Lounge",
      alt: "Kerzenlicht, Cocktail und Plattenspieler am Abend",
      copy: "Kerzenschein, kleine Gerichte, klassische Cocktails und Vinyl, das leise spielt.",
    },
  ],

  story: {
    imageAlt: "Messingtresen mit frisch gebackenem Sauerteigbrot",
    eyebrow: "Unsere Story",
    title: "Wärme verwurzelt,",
    titleEm: "mit Sorgfalt vergoldet.",
    p1: "Auréa entstand aus einem einfachen Wunsch — einen Raum zu schaffen, der den ganzen Tag trägt. Einen Raum, in dem der Morgen nach Kardamom und dunkel gerösteten Bohnen duftet, in dem der Nachmittag leise über guten Büchern summt, und in dem die Abende golden im Kerzenlicht flackern.",
    p2: "Jedes Detail — vom Messing, das wir jeden Morgen polieren, bis zum Brot, das wir vor Sonnenaufgang backen — ist mit Bedacht gewählt.",
  },

  menu: {
    eyebrow: "Eine Auswahl aus",
    title: "der Karte",
    subtitle: "Saisonal, ehrlich und täglich frisch zubereitet.",
    empty: "Die Karte wird gerade aktualisiert.",
    legend: "V vegetarisch · VG vegan · Fragen zu Allergenen beantwortet unser Team gern.",
    fullMenu: "Ganze Karte",
    unavailable: "Derzeit nicht verfügbar",
    allergens: "Allergene",
    tags: { V: "vegetarisch", VG: "vegan" },
    /** Keys match ALLERGENS in lib/menu.ts. */
    allergenNames: {
      gluten: "Gluten",
      crustaceans: "Krebstiere",
      eggs: "Eier",
      fish: "Fisch",
      peanuts: "Erdnüsse",
      soy: "Soja",
      milk: "Milch",
      nuts: "Schalenfrüchte",
      celery: "Sellerie",
      mustard: "Senf",
      sesame: "Sesam",
      sulphites: "Sulfite",
      lupin: "Lupinen",
      molluscs: "Weichtiere",
    } as Record<string, string>,
  },

  atmosphere: {
    eyebrow: "Die Atmosphäre",
    title: "Langsame Morgen.",
    titleEm: "Goldene Abende.",
    alts: [
      "Kerzenbeleuchteter Tisch zur goldenen Stunde",
      "Pistazien-Porridge und Croissant",
      "Kaffee und Croissant",
      "Cocktail bei Kerzenlicht",
    ],
  },

  visit: {
    eyebrow: "Finde uns",
    title: "Komm vorbei,",
    titleEm: "bleib eine Weile.",
    hours: [
      ["Montag — Sonntag", "08:00 – 20:00"],
    ] as [string, string][],
    address: "Adresse",
    country: "Deutschland",
    phone: "Telefon",
    directions: "Anfahrt →",
  },

  reservation: {
    eyebrow: "Reservierung",
    title: "Tisch",
    titleEm: "reservieren",
    intro: "Sag uns, wann du vorbeikommen möchtest. Wir bestätigen innerhalb einer Stunde.",
    name: "Name",
    namePlaceholder: "Vor- und Nachname",
    phone: "Telefon",
    email: "E-Mail",
    emailPlaceholder: "name@beispiel.de",
    remember: "Speichern Sie die Informationen für meine nächsten Reservierungen.",
    terms: "Ich akzeptiere die Allgemeinen Geschäftsbedingungen.",
    required: "Pflichtfeld",
    marketingEmail: "Senden Sie mir Angebote und Neuigkeiten per E-Mail.",
    marketingSms: "Senden Sie mir Angebote und Neuigkeiten per SMS",
    date: "Datum",
    time: "Uhrzeit",
    guests: "Personen",
    seating: "Bereich",
    requests: "Besondere Wünsche",
    requestsPlaceholder: "Anlass, Allergien, Lieblingsplatz am Fenster…",
    submit: "Anfrage senden",
    sending: "Wird gesendet…",
    persons: (n: number) => `${n} ${n === 1 ? "Person" : "Personen"}`,
    atTime: (t: string) => `${t} Uhr`,
    seatingOptions: {
      any: "Keine Präferenz",
      cafe: "Café",
      lounge: "Lounge",
      window: "Fensterplatz",
    } as Record<string, string>,
    groupHint: (max: number) => `Mehr als ${max} Personen? Ruf uns an:`,
    privacy:
      "Wir nutzen deine Angaben, um deine Reservierung zu bearbeiten und dich dazu per Anruf, SMS, WhatsApp oder E-Mail zu kontaktieren. Angebote und Neuigkeiten schicken wir nur, wenn du das oben ankreuzt. Bist du angemeldet, erscheint die Anfrage auch in deinem Konto. Mehr in unserer",
    privacyLink: "Datenschutzerklärung",
    newTab: "(öffnet in neuem Tab)",
    // Quick reservation modal
    modalTitle: "Tisch",
    modalTitleEm: "reservieren",
    modalDescription: "Wähle Personen, Datum und Uhrzeit.",
    continue: "Reservieren",
    noSlotsToday:
      "Für heute ist online keine Reservierung mehr möglich. Bitte wähle ein anderes Datum.",
    back: "Zurück",
    contactTitle: "Fast",
    contactTitleEm: "geschafft",
    sentTitle: "Anfrage",
    sentTitleEm: "gesendet",
    sentNote: "Deine Reservierung gilt, sobald wir sie bestätigt haben.",
    close: "Schließen",
    // Server replies
    errors: {
      name: "Bitte gib deinen Namen an.",
      phone: "Bitte gib eine Telefonnummer an.",
      email: "Bitte gib eine gültige E-Mail-Adresse an.",
      terms: "Bitte akzeptiere die Allgemeinen Geschäftsbedingungen.",
      date: "Bitte wähle ein Datum.",
      time: "Bitte wähle eine Uhrzeit.",
      tooMany: (max: number, phone: string) =>
        `Für Gruppen ab ${max + 1} Personen ruf uns bitte an: ${phone}`,
      invalid: "Bitte prüfe deine Angaben.",
      past: "Das Datum liegt in der Vergangenheit.",
      failed: (phone: string) => `Etwas ist schiefgelaufen. Bitte ruf uns an: ${phone}`,
    },
    success: "Danke — wir melden uns in Kürze.",
  },

  footer: {
    tagline: "A golden retreat from dawn to late.",
    links: { home: "Start", menu: "Karte", story: "Story", visit: "Anfahrt", reserve: "Reservierung", join: "Login" },
    contact: "Kontakt",
    hours: "Öffnungszeiten",
    hoursLines: ["Mo–So 08–20"],
    copyright: "© 2026 Auréa Café & Lounge. Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    /** Shown after legal links whose page exists only in German. Empty in German. */
    germanOnly: "",
    cookieSettings: "Cookie-Einstellungen",
  },

  consent: {
    eyebrow: "Datenschutz",
    summaryTitle: "Cookies & Dienste",
    settingsTitle: "Cookie-Einstellungen",
    text: "Notwendige Technologien sorgen dafür, dass die Website und deine Tischreservierung funktionieren. Optionale Dienste wie Statistik, Marketing oder externe Inhalte laden wir nur mit deiner Zustimmung. Du kannst deine Wahl jederzeit über „Cookie-Einstellungen“ im Footer ändern.",
    learnMore: "Mehr erfahren",
    acceptAll: "Alle akzeptieren",
    rejectOptional: "Optionale ablehnen",
    settings: "Einstellungen",
    save: "Auswahl speichern",
    categories: "Kategorien",
    alwaysActive: "Immer aktiv",
    services: "Dienste",
    none: "Derzeit setzen wir in dieser Kategorie keine Dienste ein.",
    categoryInfo: {
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
    },
    gate: (provider: string, category: string) =>
      `Dieser Inhalt wird von ${provider} geladen. Er erscheint, sobald du „${category}“ in den Cookie-Einstellungen erlaubst.`,
  },

  auth: {
    eyebrow: "Konto",
    imageAlt: "Kerzenlicht und Cocktails in der Auréa Lounge",
    imageTitle: "Zum Frühstück kommen.",
    imageTitleEm: "Am Abend wiederkommen.",
    homeAria: "Zurück zur Startseite",
    signupTitle: "Werde Teil",
    signupTitleEm: "von Auréa",
    loginTitle: "Willkommen",
    loginTitleEm: "zurück",
    tabs: { signup: "Registrieren", login: "Anmelden" },
    name: "Name",
    namePlaceholder: "Vor- und Nachname",
    email: "E-Mail",
    emailPlaceholder: "du@beispiel.de",
    password: "Passwort",
    passwordPlaceholder: "Mindestens 8 Zeichen",
    submitSignup: "Konto erstellen",
    submitLogin: "Anmelden",
    wait: "Einen Moment…",
    checkInboxEyebrow: "Fast geschafft",
    checkInboxTitle: "Prüfe dein Postfach",
    checkInboxText: (email: string): [string, string, string] =>
      [`Wir haben eine Bestätigungs-E-Mail an `, email, ` geschickt. Klicke auf den Link darin, um dein Konto zu aktivieren.`],
    toLogin: "Zur Anmeldung",
    haveAccount: "Schon ein Konto?",
    noAccount: "Noch kein Konto?",
    notices: {
      confirmed: "E-Mail bestätigt — bitte melde dich jetzt an.",
      "link-invalid": "Der Bestätigungslink ist ungültig oder abgelaufen.",
    } as Record<string, string>,
    errors: {
      invalid_credentials: "E-Mail oder Passwort ist falsch.",
      email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.",
      user_already_exists: "Für diese E-Mail gibt es bereits ein Konto. Bitte melde dich an.",
      weak_password: "Das Passwort ist zu schwach — mindestens 8 Zeichen.",
      over_email_send_rate_limit: "Zu viele E-Mails in kurzer Zeit. Bitte versuche es später erneut.",
      unknown: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    } as Record<string, string>,
  },

  account: {
    signOut: "Abmelden",
    forbidden: "Dein Konto hat keinen Zugang zum Dashboard.",
    eyebrow: "Mein Konto",
    welcome: "Willkommen,",
    name: "Name",
    email: "E-Mail",
    memberSince: "Mitglied seit",
    role: "Rolle",
    roles: { admin: "Administrator", staff: "Team", guest: "Gast" },
    reserve: "Tisch reservieren",
    dashboard: "Dashboard",
    reservations: "Meine Reservierungen",
    none: "Noch keine Reservierungen. Reservierungen, die du angemeldet anfragst, erscheinen hier — zusammen mit unserer Antwort.",
    status: {
      new: "Angefragt",
      confirmed: "Bestätigt",
      declined: "Abgelehnt",
      cancelled: "Storniert",
    },
    message: "Nachricht von Auréa",
  },

  notFound: {
    title: "Seite nicht gefunden",
    text: "Diese Seite gibt es nicht oder sie ist umgezogen.",
    home: "Zur Startseite",
  },

  error: {
    title: "Diese Seite konnte nicht geladen werden",
    text: "Bei uns ist etwas schiefgelaufen. Lade die Seite neu oder geh zurück zur Startseite.",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
  },

  /** For Intl date and number formatting. */
  intl: "de-DE",
};

export type Dictionary = typeof de;
export default de;
