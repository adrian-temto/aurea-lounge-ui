import { SITE_URL, localizePath, type Locale } from "@/i18n/config";
import { ADMIN_URL } from "@/lib/admin-host";
import { CONTACT } from "@/lib/reservation";
import type { ReservationStatus } from "@/lib/types";

import type { Email } from "./send";

/** What every reservation email shows. Times are "HH:MM", dates "YYYY-MM-DD". */
export type Booking = {
  name: string;
  phone: string | null;
  email: string | null;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  locale: Locale;
};

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
const paragraphs = (s: string) => esc(s).replace(/\r?\n/g, "<br>");
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

const COPY = {
  de: {
    intl: "de-DE",
    at: (t: string) => `${t} Uhr`,
    persons: (n: number) => `${n} ${n === 1 ? "Person" : "Personen"}`,
    labels: { date: "Datum", time: "Uhrzeit", guests: "Personen", notes: "Deine Wünsche" },
    hello: (n: string) => `Hallo ${n},`,
    sign: "Herzliche Grüße<br>Dein Auréa-Team",
    signText: "Herzliche Grüße\nDein Auréa-Team",
    footer: "Du erhältst diese E-Mail, weil du über unsere Website einen Tisch angefragt hast.",
    privacy: "Datenschutz",
    imprint: "Impressum",
    offers: {
      subject: "Bitte bestätige: Angebote von Auréa per E-Mail",
      title: "Nur noch ein Klick",
      text: "du möchtest Angebote und Neuigkeiten von Auréa per E-Mail erhalten. Bitte bestätige das über den Button. Erst dann schicken wir dir Angebote.",
      button: "Angebote bestätigen",
      ignore:
        "Du hast das nicht angefordert oder es dir anders überlegt? Dann ignoriere diese E-Mail einfach; ohne Bestätigung erhältst du keine Angebote. Der Link ist 30 Tage gültig. Deine Einwilligung kannst du jederzeit widerrufen – eine kurze Antwort auf eine unserer E-Mails genügt.",
    },
    pending: {
      subject: "Deine Reservierungsanfrage bei Auréa",
      title: "Anfrage erhalten",
      text: "vielen Dank für deine Anfrage! Sie ist bei uns eingegangen und wartet noch auf unsere Bestätigung. Wir melden uns so schnell wie möglich per E-Mail bei dir.",
      change: (phone: string) =>
        `Möchtest du etwas ändern? Antworte einfach auf diese E-Mail oder ruf uns an: ${phone}.`,
    },
    response: {
      subject: {
        confirmed: "Deine Reservierung bei Auréa ist bestätigt",
        declined: "Zu deiner Reservierungsanfrage bei Auréa",
        cancelled: "Deine Reservierung bei Auréa wurde storniert",
        new: "Rückfrage zu deiner Reservierung bei Auréa",
      },
      title: {
        confirmed: "Reservierung bestätigt",
        declined: "Leider ausgebucht",
        cancelled: "Reservierung storniert",
        new: "Eine Rückfrage",
      },
      reply: (phone: string) =>
        `Fragen? Antworte einfach auf diese E-Mail oder ruf uns an: ${phone}.`,
    },
  },
  en: {
    intl: "en-GB",
    at: (t: string) => t,
    persons: (n: number) => `${n} ${n === 1 ? "person" : "people"}`,
    labels: { date: "Date", time: "Time", guests: "Guests", notes: "Your requests" },
    hello: (n: string) => `Hello ${n},`,
    sign: "Warm regards<br>The Auréa team",
    signText: "Warm regards\nThe Auréa team",
    footer: "You are receiving this email because you requested a table on our website.",
    privacy: "Privacy policy",
    imprint: "Legal notice",
    offers: {
      subject: "Please confirm: offers from Auréa by email",
      title: "Just one more click",
      text: "you would like to receive offers and news from Auréa by email. Please confirm with the button below. Only then will we send you offers.",
      button: "Confirm offers",
      ignore:
        "Didn't ask for this, or changed your mind? Simply ignore this email; without confirmation you won't receive any offers. The link is valid for 30 days. You can withdraw your consent at any time – a short reply to any of our emails is enough.",
    },
    pending: {
      subject: "Your reservation request at Auréa",
      title: "Request received",
      text: "thank you for your request! It has reached us and is waiting for our confirmation. We will get back to you by email as soon as possible.",
      change: (phone: string) =>
        `Need to change something? Simply reply to this email or call us: ${phone}.`,
    },
    response: {
      subject: {
        confirmed: "Your reservation at Auréa is confirmed",
        declined: "About your reservation request at Auréa",
        cancelled: "Your reservation at Auréa has been cancelled",
        new: "A question about your reservation at Auréa",
      },
      title: {
        confirmed: "Reservation confirmed",
        declined: "Fully booked, unfortunately",
        cancelled: "Reservation cancelled",
        new: "A quick question",
      },
      reply: (phone: string) => `Questions? Simply reply to this email or call us: ${phone}.`,
    },
  },
} satisfies Record<Locale, unknown>;

function details(b: Booking) {
  const c = COPY[b.locale];
  const date = new Date(`${b.date}T12:00:00`).toLocaleDateString(c.intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const rows: [string, string][] = [
    [c.labels.date, date],
    [c.labels.time, c.at(b.time)],
    [c.labels.guests, c.persons(b.guests)],
    ...(b.notes ? ([[c.labels.notes, b.notes]] as [string, string][]) : []),
  ];
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e6dccb;margin:24px 0">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:12px 0;border-bottom:1px solid #e6dccb;color:#7a6a58;font-size:14px;width:40%;vertical-align:top">${esc(k)}</td><td style="padding:12px 0;border-bottom:1px solid #e6dccb;font-size:15px">${paragraphs(v)}</td></tr>`,
      )
      .join("")}</table>`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}

/** Brand frame: gold-on-espresso header, cream body. Inline styles only, for email clients. */
function layout(locale: Locale, title: string, body: string) {
  const c = COPY[locale];
  const privacy = `${SITE_URL}${localizePath(locale, "/datenschutz")}`;
  const imprint = `${SITE_URL}${localizePath(locale, "/impressum")}`;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:Georgia,'Times New Roman',serif;color:#2b1d14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8">
<tr><td style="background:#1c120c;padding:28px 32px;color:#c9a35c;font-size:26px;letter-spacing:6px">AURÉA</td></tr>
<tr><td style="padding:32px;font-size:16px;line-height:1.6">
<h1 style="margin:0 0 20px;font-weight:normal;font-size:28px;line-height:1.2">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e6dccb;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#7a6a58">
Auréa Café &amp; Lounge · ${esc(CONTACT.street)} · ${esc(CONTACT.city)} · ${esc(CONTACT.phone)}<br>
${esc(c.footer)} <a href="${privacy}" style="color:#7a6a58">${esc(c.privacy)}</a> · <a href="${imprint}" style="color:#7a6a58">${esc(c.imprint)}</a>
</td></tr></table></td></tr></table></body></html>`;
}

/** To the guest, right after booking: received, not yet confirmed. */
export function guestPendingEmail(b: Booking & { email: string }): Email {
  const c = COPY[b.locale];
  const d = details(b);
  const hello = c.hello(firstName(b.name));
  return {
    to: b.email,
    subject: c.pending.subject,
    html: layout(
      b.locale,
      c.pending.title,
      `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0">${esc(c.pending.text)}</p>${d.html}<p style="margin:0 0 20px">${esc(c.pending.change(CONTACT.phone))}</p><p style="margin:0">${c.sign}</p>`,
    ),
    text: `${hello}\n\n${c.pending.text}\n\n${d.text}\n\n${c.pending.change(CONTACT.phone)}\n\n${c.signText}`,
  };
}

/** To the team inbox: a new request is waiting in the dashboard. Always German. */
export function staffNewReservationEmail(b: Booking, to: string[]): Email {
  const when = `${new Date(`${b.date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" })} ${b.time}`;
  const link = `${ADMIN_URL}/admin/reservations?status=new`;
  const rows: [string, string][] = [
    ["Name", b.name],
    ["Telefon", b.phone ?? "—"],
    ["E-Mail", b.email ?? "—"],
    ["Datum", when],
    ["Personen", String(b.guests)],
    ["Sprache", b.locale === "en" ? "Englisch" : "Deutsch"],
    ...(b.notes ? ([["Wünsche", b.notes]] as [string, string][]) : []),
  ];
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#7a6a58">${esc(k)}</td><td style="padding:6px 0">${paragraphs(v)}</td></tr>`,
    )
    .join("");
  return {
    to,
    subject: `Neue Reservierungsanfrage: ${b.name}, ${when}, ${b.guests} Pers.`,
    html: layout(
      "de",
      "Neue Reservierungsanfrage",
      `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px">${table}</table>
<p style="margin:28px 0 0"><a href="${link}" style="display:inline-block;background:#1c120c;color:#f4efe6;padding:14px 24px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase">Im Dashboard beantworten</a></p>`,
    ),
    text: `Neue Reservierungsanfrage\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nIm Dashboard beantworten: ${link}`,
    ...(b.email ? { replyTo: b.email } : {}),
  };
}

/** To the guest, when the team saves an answer in the dashboard. The message is the team's own text. */
export function guestResponseEmail(
  b: Booking & { email: string },
  status: ReservationStatus,
  message: string,
): Email {
  const c = COPY[b.locale];
  const d = details(b);
  return {
    to: b.email,
    subject: c.response.subject[status],
    html: layout(
      b.locale,
      c.response.title[status],
      `<p style="margin:0">${paragraphs(message)}</p>${d.html}<p style="margin:0;font-size:14px;color:#7a6a58">${esc(c.response.reply(CONTACT.phone))}</p>`,
    ),
    text: `${message}\n\n${d.text}\n\n${c.response.reply(CONTACT.phone)}`,
  };
}

/**
 * Double opt-in: asks the guest to confirm that they want offers by email. `link` points to
 * /angebote/bestaetigen?token=…, where a button (not the link itself) confirms, so mail
 * scanners that open links can't confirm on the guest's behalf.
 */
export function marketingConfirmEmail(
  g: { name: string; email: string; locale: Locale },
  link: string,
): Email {
  const c = COPY[g.locale];
  const hello = c.hello(firstName(g.name));
  return {
    to: g.email,
    subject: c.offers.subject,
    html: layout(
      g.locale,
      c.offers.title,
      `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0">${esc(c.offers.text)}</p>
<p style="margin:28px 0"><a href="${esc(link)}" style="display:inline-block;background:#1c120c;color:#f4efe6;padding:14px 24px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase">${esc(c.offers.button)}</a></p>
<p style="margin:0 0 20px;font-size:14px;color:#7a6a58">${esc(c.offers.ignore)}</p><p style="margin:0">${c.sign}</p>`,
    ),
    text: `${hello}\n\n${c.offers.text}\n\n${c.offers.button}: ${link}\n\n${c.offers.ignore}\n\n${c.signText}`,
  };
}

/**
 * To a new admin, when the super admin created their account (or sent the details again): the
 * temporary password and a sign-in button. Always German, like the dashboard.
 */
export function adminWelcomeEmail(
  a: { name: string; email: string },
  password: string,
  link = `${ADMIN_URL}/login`,
): Email {
  const hello = a.name.trim() ? `Hallo ${firstName(a.name)},` : "Hallo,";
  const intro =
    "für dich wurde ein Zugang zum Team-Bereich der Auréa Lounge angelegt. Damit meldest du dich an:";
  const note =
    "Nach der ersten Anmeldung legst du dein eigenes Passwort fest. Dieses Passwort gilt nur bis dahin.";
  const notYou = "Du hast mit dieser E-Mail nicht gerechnet? Dann melde dich bitte bei uns.";
  const rows: [string, string][] = [
    ["E-Mail", a.email],
    ["Passwort", password],
  ];
  return {
    to: a.email,
    subject: "Dein Zugang zum Auréa Team-Bereich",
    html: layout(
      "de",
      "Willkommen im Team",
      `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0">${esc(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e6dccb;margin:24px 0">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:12px 0;border-bottom:1px solid #e6dccb;color:#7a6a58;font-size:14px;width:40%">${esc(k)}</td><td style="padding:12px 0;border-bottom:1px solid #e6dccb;font-family:Consolas,Menlo,monospace;font-size:17px;letter-spacing:1px">${esc(v)}</td></tr>`,
        )
        .join("")}</table>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#1c120c;color:#f4efe6;padding:14px 24px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase">Jetzt anmelden</a></p>
<p style="margin:0 0 12px;font-size:14px;color:#7a6a58">${esc(note)}</p>
<p style="margin:0;font-size:14px;color:#7a6a58">${esc(notYou)}</p>`,
    ),
    text: `${hello}\n\n${intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nAnmelden: ${link}\n\n${note}\n\n${notYou}`,
  };
}
