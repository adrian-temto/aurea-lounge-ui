import type { Dictionary } from "./de";

/** English. Every key from de.ts is required. Marketing copy here still wants a native review. */
const en: Dictionary = {
  meta: {
    homeTitle: "Auréa — Breakfast, Café & Lounge in Beelitz",
    homeDescription:
      "A golden hour from dawn to late. Breakfast, specialty coffee and an intimate evening lounge in Beelitz.",
    homeOgTitle: "Auréa — Breakfast, Café & Lounge",
    homeOgDescription:
      "Where morning light meets candlelight. Breakfast, coffee and candlelit evenings in Beelitz.",
    notFoundTitle: "Page not found — Auréa",
    privacyTitle: "Privacy policy — Auréa",
    privacyDescription:
      "Which personal data the Auréa website processes, why, for how long, and what your rights are.",
    imprintTitle: "Legal notice — Auréa",
    offersTitle: "Confirm offers — Auréa",
  },

  language: {
    label: "Language",
    names: { de: "Deutsch", en: "English" },
    switchTo: (name: string) => `Switch language: ${name}`,
  },

  nav: {
    items: [
      ["Home", "#top"],
      ["Menu", "/karte"],
      ["About us", "/ueber-uns"],
      ["Gallery", "/galerie"],
      ["Visit", "/anfahrt"],
    ],
    home: "Auréa — home",
    logoAlt: "Auréa — Breakfast · Café · Lounge",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    staffLogin: "Staff login",
    reserve: "Reserve a table",
    address: "Berliner Straße 196 · Beelitz · +49 33204 634887",
  },

  hero: {
    imageAlt: "The bar at Auréa Lounge: white lilies and finger food on the counter, glasses on the shelves behind",
    eyebrow: "Breakfast · Café · Lounge",
    title: "A golden hour,",
    titleEm: "from dawn to late.",
    text: "Where morning light meets candlelight. A warm retreat for unhurried coffees, cosy breakfasts and quiet conversations.",
    reserve: "Reserve a table",
    menu: "Explore the menu",
  },

  intro: {
    eyebrow: "Three moments, one place",
    title: "A day at",
    titleEm: "Auréa",
    text: "From the first espresso to the last glass of wine — we keep the stove warm through every moment of the day.",
  },

  chapters: [
    {
      time: "From 08:00",
      title: "Breakfast",
      alt: "Bagel with egg, avocado and rocket",
      copy: "Avocado Benedict, egg & avocado croissant, porridge and yoghurt bowls — plus a breakfast buffet until noon.",
    },
    {
      time: "From 11:00",
      title: "Lunch",
      alt: "Ciabatta with mozzarella",
      copy: "Ciabatta, bagels, bowls, salads and pinsa — with illy coffee, cold brew and matcha.",
    },
    {
      time: "From 18:00",
      title: "Evening menu",
      alt: "Truffle burrata pasta",
      copy: "Flammkuchen, pasta and the seasonal menu — with alcohol-free spritz, 0.0 % prosecco and Sanbittèr.",
    },
  ],

  story: {
    imageAlt: "The lounge at Auréa: the Auréa screen above velvet and houndstooth armchairs with golden table lamps",
    eyebrow: "Our story",
    title: "Rooted in warmth,",
    titleEm: "gilded with care.",
    p1: "Auréa grew from a simple wish — to create a place that carries you through the whole day. A place where mornings smell of cardamom and dark-roasted beans, where afternoons hum quietly over good books, and where evenings flicker golden in candlelight.",
    p2: "Every detail — from the brass we polish each morning to the bread we bake before sunrise — is chosen with care.",
  },

  menu: {
    eyebrow: "A selection from",
    title: "the menu",
    subtitle: "Seasonal, honest and freshly prepared every day.",
    empty: "The menu is being updated.",
    legend: "V vegetarian · VG vegan · Our team is happy to answer questions about allergens.",
    fullMenu: "Full menu",
    unavailable: "Currently unavailable",
    allergens: "Allergens",
    tags: { V: "vegetarian", VG: "vegan" },
    allergenNames: {
      gluten: "Gluten",
      crustaceans: "Crustaceans",
      eggs: "Eggs",
      fish: "Fish",
      peanuts: "Peanuts",
      soy: "Soy",
      milk: "Milk",
      nuts: "Tree nuts",
      celery: "Celery",
      mustard: "Mustard",
      sesame: "Sesame",
      sulphites: "Sulphites",
      lupin: "Lupin",
      molluscs: "Molluscs",
    },
  },

  atmosphere: {
    eyebrow: "The atmosphere",
    title: "Slow mornings.",
    titleEm: "Golden evenings.",
    alts: [
      "Golden Auréa Lounge lettering on the facade, with white and gold balloons below",
      "Strawberry pistachio cheesecake",
      "Beelitz strawberry porridge",
      "Burrata & fig salad",
    ],
  },

  kitchen: {
    eyebrow: "From our kitchen",
    title: "Fresh onto the",
    titleEm: "plate.",
    text: "From pinsa to the green power bowl — a small look at what leaves our kitchen every day.",
    dishes: [
      "Caesar salad",
      "Chicken & avocado bagel",
      "Avocado Benedict",
      "Mini pancakes",
      "Vegetarian flammkuchen",
      "Pinsa",
      "Penne with courgette, gorgonzola & walnuts",
      "Asparagus & salmon",
      "Ciabatta",
      "Green power bowl",
    ],
  },

  opening: {
    eyebrow: "The opening",
    title: "The evening",
    titleEm: "it all began.",
    text: "Friends, neighbours and our first guests — with prosecco, small bites and plenty of good cheer, we opened the doors of Auréa Lounge.",
    alts: [
      "Golden Auréa Lounge lettering above the entrance, with balloons below",
      "Chalkboard announcing the opening of Auréa Lounge",
      "Small bites and lilies on the counter",
    ],
  },

  pages: {
    menu: {
      metaTitle: "Menu — Auréa Café & Lounge",
      metaDescription:
        "The full menu of Auréa Lounge in Beelitz: breakfast, café and lounge — with prices and allergen information.",
      eyebrow: "Menu",
      title: "Our",
      titleEm: "menu.",
      text: "Breakfast, café and lounge — everything that comes from our kitchen and our bar.",
    },
    about: {
      metaTitle: "About us — Auréa Café & Lounge",
      metaDescription:
        "The story of Auréa Lounge in Beelitz: breakfast, café and lounge under one roof.",
      eyebrow: "About us",
      title: "A place for",
      titleEm: "every moment.",
      valuesTitle: "What we stand for",
      values: [
        { title: "Freshly prepared", text: "From pinsa to the green power bowl: what lands on your plate is made in our kitchen." },
        { title: "Morning to evening", text: "Breakfast, café and lounge under one roof — for every moment of the day." },
        { title: "Warm welcome", text: "Friends, neighbours, families: every guest is welcome here." },
      ],
      openingTitle: "Well visited from the start",
      openingText: "At the opening, friends, neighbours and our first guests raised a glass with us.",
      toGallery: "To the gallery",
      toMenu: "To the menu",
    },
    gallery: {
      metaTitle: "Gallery — Auréa Café & Lounge",
      metaDescription: "Pictures from our kitchen, the lounge and the opening of Auréa Lounge in Beelitz.",
      eyebrow: "Gallery",
      title: "A look inside",
      titleEm: "Auréa.",
      text: "Dishes from our kitchen, our lounge and moments from the opening.",
      filterLabel: "Filter photos",
      filters: { all: "All", food: "From the kitchen", lounge: "Lounge & bar", opening: "Opening" },
      loungeAlts: [
        "A glass on ice on the counter, the glowing Auréa sign behind it",
        "Iced coffee in front of the Auréa screen",
        "The coffee bar and espresso machine below the menu boards",
        "The espresso machine and illy coffee grinder at the bar",
      ],
      open: "Enlarge photo:",
      close: "Close",
      prev: "Previous photo",
      next: "Next photo",
      dialog: "Photo viewer",
    },
    visit: {
      metaTitle: "Directions & opening hours — Auréa Café & Lounge",
      metaDescription:
        "How to find Auréa Lounge in Beelitz: address, phone and opening hours from Monday to Sunday.",
    },
  },

  visit: {
    eyebrow: "Find us",
    title: "Come by,",
    titleEm: "stay a while.",
    hours: [
      ["Monday — Sunday", "08:00 – 20:00"],
    ],
    address: "Address",
    country: "Germany",
    phone: "Phone",
    directions: "Get directions →",
    map: {
      title: "Auréa on Google Maps",
      consent:
        "The map is loaded from Google, which receives data such as your IP address.",
      load: "Load map",
    },
  },

  reservation: {
    eyebrow: "Reservations",
    title: "Reserve",
    titleEm: "a table",
    intro: "Tell us when you'd like to come by. We confirm within an hour.",
    name: "Name",
    namePlaceholder: "First and last name",
    phone: "Phone",
    email: "Email",
    emailPlaceholder: "name@example.com",
    remember: "Save my details for my next reservations.",
    marketingEmail:
      "Send me offers and news by email (only after I confirm via a link I receive by email).",
    marketingSms: "Send me offers and news by SMS.",
    date: "Date",
    time: "Time",
    hour: "Hour",
    minute: "Minute",
    guests: "Guests",
    seating: "Area",
    requests: "Special requests",
    requestsPlaceholder: "Occasion, allergies, a favourite spot by the window…",
    submit: "Send request",
    sending: "Sending…",
    persons: (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`,
    atTime: (t: string) => t,
    seatingOptions: {
      any: "No preference",
      cafe: "Café",
      lounge: "Lounge",
      window: "Window seat",
    },
    groupHint: (max: number) => `More than ${max} guests? Give us a call:`,
    privacy:
      "We use your details to handle your reservation and to contact you about it by phone, SMS, WhatsApp or email. We only send offers and news if you tick that above. If you're signed in, the request also appears in your account. More in our",
    privacyLink: "privacy policy",
    newTab: "(opens in a new tab)",
    modalTitle: "Reserve",
    modalTitleEm: "a table",
    modalDescription: "Choose guests, date and time.",
    continue: "Reserve",
    noSlotsToday: "Online booking is closed for today. Please choose another date.",
    back: "Back",
    contactTitle: "Almost",
    contactTitleEm: "done",
    sentTitle: "Request",
    sentTitleEm: "sent",
    sentNote: "Your reservation is valid once we have confirmed it.",
    close: "Close",
    errors: {
      name: "Please enter your name.",
      phone: "Please enter a phone number.",
      email: "Please enter a valid email address.",
      date: "Please choose a date.",
      time: "Please choose a time.",
      tooMany: (max: number, phone: string) =>
        `For groups of ${max + 1} or more, please call us: ${phone}`,
      invalid: "Please check your details.",
      past: "That date is in the past.",
      failed: (phone: string) => `Something went wrong. Please call us: ${phone}`,
    },
    success: "Thank you! We've emailed you a copy of your request and will be in touch shortly.",
  },

  footer: {
    tagline: "A golden retreat from dawn to late.",
    links: {
      home: "Home",
      menu: "Menu",
      about: "About us",
      gallery: "Gallery",
      visit: "Visit",
      reserve: "Reservations",
    },
    contact: "Contact",
    hours: "Opening hours",
    hoursLines: ["Mon–Sun 08–20"],
    copyright: "© 2026 Auréa Café & Lounge. All rights reserved.",
    privacy: "Privacy policy",
    imprint: "Legal notice",
    cookieSettings: "Cookie settings",
  },

  consent: {
    eyebrow: "Privacy",
    summaryTitle: "Cookies & services",
    settingsTitle: "Cookie settings",
    text: "Essential technologies keep the website and your table reservation working. We only load optional services such as statistics, marketing or external content with your consent. You can change your choice at any time via “Cookie settings” in the footer.",
    learnMore: "Learn more (German)",
    acceptAll: "Accept all",
    rejectOptional: "Reject optional",
    settings: "Settings",
    save: "Save selection",
    categories: "Categories",
    alwaysActive: "Always active",
    services: "Services",
    none: "We don't currently use any services in this category.",
    categoryInfo: {
      necessary: {
        title: "Essential",
        description:
          "Keep the website and table reservations working. These are always active.",
      },
      analytics: {
        title: "Statistics",
        description: "Help us understand how the website is used, e.g. which pages are visited.",
      },
      marketing: {
        title: "Marketing",
        description: "Advertising and social media pixels that recognise you on other websites.",
      },
      media: {
        title: "External content",
        description:
          "Content embedded from other providers, e.g. maps, videos or booking widgets, which send data to those providers when loaded.",
      },
    },
    gate: (provider: string, category: string) =>
      `This content is loaded from ${provider}. It appears once you allow “${category}” in the cookie settings.`,
  },

  legal: {
    backToSite: "Back to website",
    homeAria: "Auréa — home",
    updated: "Last updated",
  },

  offers: {
    eyebrow: "Offers by email",
    title: "Please",
    titleEm: "confirm",
    text: "When you booked, you ticked that you would like to receive offers and news from Auréa by email. Please confirm here – only then will we write to you.",
    withdraw:
      "You can withdraw your consent at any time, e.g. with a short reply to any of our emails or by phone.",
    button: "Yes, send me offers by email",
    sending: "One moment…",
    doneTitle: "Thank you, all set",
    doneText: "Your email address is confirmed. From now on you will receive our offers and news.",
    invalidTitle: "This link no longer works",
    invalidText:
      "It has already been used or is older than 30 days. If you would like offers, simply tick the box again next time you book.",
    home: "Back to the homepage",
  },

  notFound: {
    title: "Page not found",
    text: "This page doesn't exist or has moved.",
    home: "Back to the home page",
  },

  error: {
    title: "This page didn't load",
    text: "Something went wrong on our end. Refresh the page or go back to the home page.",
    retry: "Try again",
    home: "Back to the home page",
  },

  intl: "en-GB",
};

export default en;
