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
    notFoundTitle: "Seite nicht gefunden — Auréa",
    privacyTitle: "Datenschutzerklärung — Auréa",
    privacyDescription:
      "Welche personenbezogenen Daten die Website von Auréa verarbeitet, wofür, wie lange und welche Rechte du hast.",
    imprintTitle: "Impressum — Auréa",
    offersTitle: "Angebote bestätigen — Auréa",
  },

  language: {
    label: "Sprache",
    names: { de: "Deutsch", en: "English" },
    switchTo: (name: string) => `Sprache wechseln: ${name}`,
  },

  nav: {
    items: [
      ["Start", "#top"],
      ["Karte", "/karte"],
      ["Über uns", "/ueber-uns"],
      ["Galerie", "/galerie"],
      ["Anfahrt", "/anfahrt"],
    ] as [string, string][],
    home: "Auréa — Startseite",
    logoAlt: "Auréa — Breakfast · Café · Lounge",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    staffLogin: "Team-Login",
    reserve: "Tisch reservieren",
    address: "Berlinerstr 196 · Beelitz · +49 33204 634887",
  },

  hero: {
    imageAlt: "Die Bar der Auréa Lounge: weiße Lilien und Fingerfood auf der Theke, dahinter Gläser im Regal",
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
      alt: "Bagel mit Ei, Avocado und Rucola",
      copy: "Avocado Benedict, Egg & Avocado Croissant, Porridge und Joghurt-Bowls — dazu ein Frühstücksbuffet bis 12 Uhr.",
    },
    {
      time: "Ab 11:00",
      title: "Mittagstisch",
      alt: "Ciabatta Mozzarella",
      copy: "Ciabatta, Bagels, Bowls, Salate und Pinsa — dazu illy-Kaffee, Cold Brew und Matcha.",
    },
    {
      time: "Ab 18:00",
      title: "Abendkarte",
      alt: "Trüffel-Burrata-Pasta",
      copy: "Flammkuchen, Pasta und die Saisonkarte — dazu alkoholfreier Spritz, Prosecco 0,0 % und Sanbittèr.",
    },
  ],

  story: {
    imageAlt: "Die Lounge der Auréa: der Auréa-Bildschirm über Samt- und Hahnentritt-Sesseln mit goldenen Tischleuchten",
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
      "Goldener Auréa-Lounge-Schriftzug an der Fassade, darunter weiße und goldene Luftballons",
      "Erdbeer-Pistazien-Cheesecake",
      "Beelitzer Erdbeer-Porridge",
      "Burrata-Feigen-Salat",
    ],
  },

  kitchen: {
    eyebrow: "Aus unserer Küche",
    title: "Frisch auf den",
    titleEm: "Teller.",
    text: "Von der Pinsa bis zur Green Power Bowl — ein kleiner Einblick in das, was bei uns täglich aus der Küche kommt.",
    dishes: [
      "Caesar Salad",
      "Chicken-Avocado-Bagel",
      "Avocado Benedict",
      "Mini Pancakes",
      "Vegetarischer Flammkuchen",
      "Pinsa",
      "Penne Zucchini, Gorgonzola & Walnüsse",
      "Spargel & Lachs",
      "Ciabatta",
      "Green Power Bowl",
    ],
  },

  opening: {
    eyebrow: "Die Eröffnung",
    title: "Der Abend, an dem",
    titleEm: "alles begann.",
    text: "Freunde, Nachbarn und die ersten Gäste — mit Prosecco, Häppchen und viel guter Laune haben wir die Türen der Auréa Lounge geöffnet.",
    alts: [
      "Goldener Auréa-Lounge-Schriftzug über dem Eingang, davor Luftballons",
      "Kreidetafel zur Eröffnung der Auréa Lounge",
      "Häppchen und Lilien auf dem Tresen",
    ],
  },

  pages: {
    menu: {
      metaTitle: "Speisekarte — Auréa Café & Lounge",
      metaDescription:
        "Die ganze Karte der Auréa Lounge in Beelitz: Frühstück, Café und Lounge — mit Preisen und Allergenhinweisen.",
      eyebrow: "Speisekarte",
      title: "Unsere",
      titleEm: "Karte.",
      text: "Frühstück, Café und Lounge — alles, was aus unserer Küche und von unserer Bar kommt.",
    },
    about: {
      metaTitle: "Über uns — Auréa Café & Lounge",
      metaDescription:
        "Die Geschichte der Auréa Lounge in Beelitz: Frühstück, Café und Lounge unter einem Dach.",
      eyebrow: "Über uns",
      title: "Ein Ort für",
      titleEm: "jeden Moment.",
      valuesTitle: "Woran wir uns halten",
      values: [
        { title: "Frisch zubereitet", text: "Von der Pinsa bis zur Green Power Bowl: Was auf den Teller kommt, entsteht bei uns in der Küche." },
        { title: "Vom Morgen bis zum Abend", text: "Frühstück, Café und Lounge unter einem Dach — für jeden Moment des Tages." },
        { title: "Herzlich willkommen", text: "Freunde, Nachbarn, Familien: Bei uns ist jeder Gast willkommen." },
      ],
      openingTitle: "Von Anfang an gut besucht",
      openingText: "Bei der Eröffnung haben Freunde, Nachbarn und die ersten Gäste mit uns angestoßen.",
      toGallery: "Zur Galerie",
      toMenu: "Zur Karte",
    },
    gallery: {
      metaTitle: "Galerie — Auréa Café & Lounge",
      metaDescription: "Bilder aus der Küche, der Lounge und von der Eröffnung der Auréa Lounge in Beelitz.",
      eyebrow: "Galerie",
      title: "Einblicke in",
      titleEm: "Auréa.",
      text: "Gerichte aus unserer Küche, unsere Lounge und Momente von der Eröffnung.",
      filterLabel: "Bilder filtern",
      filters: { all: "Alle", food: "Aus der Küche", lounge: "Lounge & Bar", opening: "Eröffnung" },
      loungeAlts: [
        "Ein Glas mit Eis auf dem Tresen, dahinter der leuchtende Auréa-Schriftzug",
        "Eiskaffee vor dem Auréa-Bildschirm",
        "Die Kaffeebar mit Siebträgermaschine unter den Menütafeln",
        "Die Siebträgermaschine und die illy-Kaffeemühle an der Bar",
      ],
      open: "Foto vergrößern:",
      close: "Schließen",
      prev: "Vorheriges Foto",
      next: "Nächstes Foto",
      dialog: "Fotoansicht",
    },
    visit: {
      metaTitle: "Anfahrt & Öffnungszeiten — Auréa Café & Lounge",
      metaDescription:
        "So findest du die Auréa Lounge in Beelitz: Adresse, Telefon und Öffnungszeiten von Montag bis Sonntag.",
    },
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
    directions: "Route planen →",
    map: {
      title: "Auréa auf Google Maps",
      consent:
        "Die Karte wird von Google geladen. Dabei werden Daten wie deine IP-Adresse an Google übertragen.",
      load: "Karte laden",
    },
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
    marketingEmail:
      "Senden Sie mir Angebote und Neuigkeiten per E-Mail (erst nach Bestätigung über einen Link, den ich per E-Mail erhalte).",
    marketingSms: "Senden Sie mir Angebote und Neuigkeiten per SMS",
    date: "Datum",
    time: "Uhrzeit",
    hour: "Stunde",
    minute: "Minute",
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
      date: "Bitte wähle ein Datum.",
      time: "Bitte wähle eine Uhrzeit.",
      tooMany: (max: number, phone: string) =>
        `Für Gruppen ab ${max + 1} Personen ruf uns bitte an: ${phone}`,
      invalid: "Bitte prüfe deine Angaben.",
      past: "Das Datum liegt in der Vergangenheit.",
      failed: (phone: string) => `Etwas ist schiefgelaufen. Bitte ruf uns an: ${phone}`,
    },
    success: "Danke! Wir haben dir eine Bestätigung deiner Anfrage per E-Mail geschickt und melden uns in Kürze.",
  },

  footer: {
    tagline: "A golden retreat from dawn to late.",
    links: {
      home: "Start",
      menu: "Karte",
      about: "Über uns",
      gallery: "Galerie",
      visit: "Anfahrt",
      reserve: "Reservierung",
    },
    contact: "Kontakt",
    hours: "Öffnungszeiten",
    hoursLines: ["Mo–So 08–20"],
    copyright: "© 2026 Auréa Café & Lounge. Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    imprint: "Impressum",
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
    },
    gate: (provider: string, category: string) =>
      `Dieser Inhalt wird von ${provider} geladen. Er erscheint, sobald du „${category}“ in den Cookie-Einstellungen erlaubst.`,
  },

  legal: {
    backToSite: "Zur Website",
    homeAria: "Auréa — Startseite",
    updated: "Stand",
  },

  offers: {
    eyebrow: "Angebote per E-Mail",
    title: "Bitte",
    titleEm: "bestätigen",
    text: "Du hast bei deiner Reservierung angekreuzt, dass du Angebote und Neuigkeiten von Auréa per E-Mail erhalten möchtest. Bestätige das hier – erst dann schreiben wir dir.",
    withdraw:
      "Du kannst die Einwilligung jederzeit widerrufen, z. B. mit einer kurzen Antwort auf eine unserer E-Mails oder telefonisch.",
    button: "Ja, Angebote per E-Mail erhalten",
    sending: "Einen Moment…",
    doneTitle: "Danke, das hat geklappt",
    doneText: "Deine E-Mail-Adresse ist bestätigt. Ab jetzt erhältst du unsere Angebote und Neuigkeiten.",
    invalidTitle: "Dieser Link funktioniert nicht mehr",
    invalidText:
      "Er wurde schon benutzt oder ist älter als 30 Tage. Möchtest du Angebote erhalten, kreuze es bei deiner nächsten Reservierung einfach wieder an.",
    home: "Zur Startseite",
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
