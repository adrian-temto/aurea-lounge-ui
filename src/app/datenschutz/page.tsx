import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { OPTIONAL_CATEGORIES } from "@/lib/consent";
import { CATEGORY_INFO, SERVICES, type Service } from "@/lib/consent-services";
import { LEGAL } from "@/lib/legal";
import { CONTACT } from "@/lib/reservation";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Auréa",
  description:
    "Welche personenbezogenen Daten die Website von Auréa verarbeitet, wofür, wie lange und welche Rechte du hast.",
};

const button =
  "inline-block border border-foreground px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.25em] transition-colors duration-500 hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

/** Gaps in LEGAL are flagged while developing and left out of the live page. */
const SHOW_GAPS = process.env.NODE_ENV !== "production";
function Missing({ children }: { children: ReactNode }) {
  if (!SHOW_GAPS) return null;
  return <mark className="bg-gold/30 px-1 text-foreground">Fehlt: {children}</mark>;
}

const SECTIONS = [
  ["verantwortlich", "Verantwortlicher"],
  ["ueberblick", "Überblick"],
  ["website", "Besuch der Website & Hosting"],
  ["reservierung", "Tischreservierung"],
  ["konto", "Kundenkonto"],
  ["supabase", "Datenbank & Anmeldung (Supabase)"],
  ["cookies", "Cookies & Speicher"],
  ["schriften", "Schriftarten"],
  ["rechte", "Deine Rechte"],
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <Link href="/" aria-label="Auréa — Startseite">
            <img src="/logo.svg" alt="Auréa" width={645} height={167} className="h-9 w-auto" />
          </Link>
          <Link href="/" className="link-line text-[0.7rem] uppercase tracking-[0.22em]">
            Zur Website
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="eyebrow text-gold">Datenschutz</p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none md:text-7xl">
          Datenschutz&shy;<em>erklärung</em>
        </h1>
        <p className="mt-8 leading-relaxed text-muted-foreground">
          Hier erklären wir, welche personenbezogenen Daten beim Besuch dieser Website, bei einer
          Tischreservierung und bei der Registrierung verarbeitet werden, wofür, auf welcher
          Rechtsgrundlage und wie lange. Stand: {LEGAL.updated}.
        </p>

        <nav aria-label="Inhalt" className="mt-10 border-y border-border py-6">
          <ol className="grid gap-2 text-sm sm:grid-cols-2">
            {SECTIONS.map(([id, title], i) => (
              <li key={id}>
                <a href={`#${id}`} className="link-line">
                  {i + 1}. {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="verantwortlich">
          <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
          <address className="mt-4 border-l-2 border-gold pl-4 not-italic text-foreground">
            {LEGAL.owner ?? (
              <Missing>Name der Inhaberin / des Inhabers bzw. Firma mit Rechtsform</Missing>
            )}
            {LEGAL.owner && <br />}
            {LEGAL.businessName}
            <br />
            {CONTACT.street}, {CONTACT.city}
            <br />
            Telefon:{" "}
            <a href={CONTACT.phoneHref} className="link-line">
              {CONTACT.phone}
            </a>
            <br />
            {LEGAL.email ? (
              <>
                E-Mail:{" "}
                <a href={`mailto:${LEGAL.email}`} className="link-line">
                  {LEGAL.email}
                </a>
              </>
            ) : (
              <Missing>E-Mail-Adresse für Datenschutzanfragen</Missing>
            )}
          </address>
        </Section>

        <Section id="ueberblick">
          <p>
            Wir verarbeiten nur, was für die Website, deine Reservierung und dein Kundenkonto nötig
            ist. Wir setzen derzeit <strong className="font-medium text-foreground">keine</strong>{" "}
            Analyse- oder Statistikdienste, keine Werbe- oder Social-Media-Pixel, keine
            eingebetteten Karten oder Videos und keinen Newsletter ein. Wir verschicken keine
            Werbung per E-Mail oder SMS. Die Links zu sozialen Netzwerken im Footer laden keine
            Inhalte dieser Anbieter. Es gibt kein Kontaktformular; wenn du uns anrufst, nutzen wir
            deine Angaben nur, um dein Anliegen zu beantworten.
          </p>
          <p>Eine automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.</p>
        </Section>

        <Section id="website">
          <p>
            Beim Aufruf der Website verarbeitet unser Hosting-Anbieter technisch notwendige
            Verbindungsdaten, damit die Seiten ausgeliefert werden können: IP-Adresse, Datum und
            Uhrzeit, aufgerufene Adresse, übertragene Datenmenge sowie Browser und Betriebssystem.
          </p>
          <Facts
            rows={[
              ["Anbieter", LEGAL.hosting ?? <Missing>Hosting-Anbieter mit Anschrift</Missing>],
              [
                "Rechtsgrundlage",
                "Art. 6 Abs. 1 lit. f DSGVO – unser berechtigtes Interesse an einer sicheren und funktionsfähigen Website",
              ],
              [
                "Speicherdauer",
                LEGAL.hostingLogRetention ?? (
                  <Missing>wie lange der Hosting-Anbieter Zugriffsprotokolle speichert</Missing>
                ),
              ],
            ]}
          />
          <Missing>
            Bestätigung, dass ein Auftragsverarbeitungsvertrag (AVV) mit dem Hosting-Anbieter
            besteht — erst dann hier erwähnen
          </Missing>
        </Section>

        <Section id="reservierung">
          <p>
            Wenn du über das Reservierungsfenster oder das Formular auf der Startseite einen Tisch
            anfragst, speichern wir deine Anfrage in unserer Datenbank (siehe{" "}
            <a href="#supabase" className="link-line text-foreground">
              Supabase
            </a>
            ). Unser Team sieht sie in unserem internen Dashboard.
          </p>
          <Facts
            rows={[
              [
                "Daten",
                "Name, Telefonnummer, E-Mail-Adresse, Datum, Uhrzeit, Anzahl der Personen, Sitzwunsch, der Zeitpunkt, zu dem du die AGB akzeptiert hast, deine Auswahl zu Angeboten per E-Mail oder SMS und – freiwillig – besondere Wünsche. Bist du angemeldet, verknüpfen wir die Anfrage mit deinem Konto.",
              ],
              [
                "Zweck",
                "Deine Reservierung bearbeiten, bestätigen oder absagen und dich dazu kontaktieren.",
              ],
              [
                "Rechtsgrundlage",
                "Art. 6 Abs. 1 lit. b DSGVO (Durchführung vorvertraglicher Maßnahmen auf deine Anfrage).",
              ],
              [
                "Pflichtangaben",
                "Name, Telefonnummer und E-Mail-Adresse brauchen wir, um die Reservierung bestätigen zu können. Ohne sie ist eine Online-Reservierung nicht möglich; du kannst uns aber jederzeit anrufen.",
              ],
              [
                "Speicherdauer",
                "Wir speichern Reservierungsanfragen, bis wir sie löschen. Eine feste Löschfrist gibt es derzeit nicht. Du kannst die Löschung jederzeit verlangen.",
              ],
            ]}
          />
          <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
            Rückmeldung per Telefon, SMS oder WhatsApp
          </h3>
          <p>
            Wir melden uns zu deiner Reservierung telefonisch, per SMS oder per WhatsApp. Bist du
            angemeldet, siehst du unsere Antwort außerdem in deinem Konto. Wenn wir dir über
            WhatsApp schreiben, erhält die WhatsApp Ireland Limited (Merrion Road, Dublin 4, Irland)
            deine Telefonnummer und den Inhalt der Nachricht; dabei können Daten auch an die
            Muttergesellschaft Meta Platforms, Inc. in den USA übermittelt werden. Möchtest du nicht
            über WhatsApp kontaktiert werden, sag uns das telefonisch oder im Feld für besondere
            Wünsche im Formular auf der Startseite.
          </p>
          <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
            Allergien und Unverträglichkeiten
          </h3>
          <p>
            Angaben zu Allergien oder Unverträglichkeiten im Feld für besondere Wünsche sind
            freiwillig. Machst du sie, verarbeiten wir sie mit deiner ausdrücklichen Einwilligung
            (Art. 9 Abs. 2 lit. a DSGVO) ausschließlich, um deinen Besuch vorzubereiten. Du kannst
            die Einwilligung jederzeit widerrufen, z. B. telefonisch.
          </p>
          <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
            Angebote und Neuigkeiten
          </h3>
          <p>
            Angebote und Neuigkeiten per E-Mail oder SMS schicken wir dir nur, wenn du das im
            Reservierungsformular ausdrücklich ankreuzt (Art. 6 Abs. 1 lit. a DSGVO, § 7 Abs. 2
            UWG). Beide Häkchen sind freiwillig; ohne sie kannst du genauso reservieren. Du kannst
            deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, z. B. telefonisch.
            Ansonsten nutzen wir deine Kontaktdaten nur für deine Reservierung.
          </p>
          <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
            Angaben für künftige Reservierungen speichern
          </h3>
          <p>
            Kreuzt du „Speichern Sie die Informationen für meine nächsten Reservierungen“ an,
            speichert dein Browser Name, Telefonnummer und E-Mail-Adresse im Local Storage dieses
            Geräts, damit das Formular beim nächsten Mal schon ausgefüllt ist. Diese Kopie erreicht
            uns nicht. Entfernst du das Häkchen bei einer späteren Reservierung, löschen wir sie
            wieder; du kannst sie auch über die Browserdaten löschen.
          </p>
        </Section>

        <Section id="konto">
          <p>
            Unter „Login“ kannst du ein Kundenkonto anlegen. Dann siehst du deine Reservierungen
            und unsere Antworten an einem Ort.
          </p>
          <Facts
            rows={[
              [
                "Daten",
                "Name, E-Mail-Adresse, Passwort (nur verschlüsselt als Hash gespeichert), Zeitpunkt der Registrierung und Anmeldung sowie deine verknüpften Reservierungen.",
              ],
              [
                "Zweck",
                "Konto bereitstellen, deine E-Mail-Adresse bestätigen und dich angemeldet halten.",
              ],
              ["Rechtsgrundlage", "Art. 6 Abs. 1 lit. b DSGVO (Nutzungsvertrag für das Konto)."],
              [
                "E-Mails",
                "Du erhältst nur die Bestätigungs-E-Mail zur Registrierung, verschickt über Supabase. Wir senden keine Newsletter.",
              ],
              [
                "Speicherdauer",
                "Bis du die Löschung deines Kontos verlangst. Deine Reservierungen bleiben danach ohne Verknüpfung zum Konto erhalten, bis wir sie löschen.",
              ],
            ]}
          />
        </Section>

        <Section id="supabase">
          <p>
            Reservierungen, Kundenkonten, die Anmeldung und die Speisekarte laufen über Supabase,
            einen Datenbank- und Anmeldedienst der Supabase Inc. Supabase verarbeitet die Daten in
            unserem Auftrag (Art. 28 DSGVO) und verschickt die Bestätigungs-E-Mails zur
            Registrierung.
          </p>
          <p>
            Fotos auf der Speisekarte lädt dein Browser direkt von den Servern von Supabase. Dabei
            erhält Supabase technisch notwendige Verbindungsdaten wie deine IP-Adresse, die
            aufgerufene Bilddatei und Angaben zu deinem Browser. Rechtsgrundlage ist unser
            berechtigtes Interesse an einer vollständigen und schnell ladenden Speisekarte (Art. 6
            Abs. 1 lit. f DSGVO). Cookies setzt Supabase dabei nicht.
          </p>
          <Facts
            rows={[
              [
                "Serverstandort",
                LEGAL.supabaseRegion ?? (
                  <Missing>Region des Supabase-Projekts (z. B. Frankfurt)</Missing>
                ),
              ],
              [
                "Auftragsverarbeitung",
                <Missing key="dpa">
                  Bestätigung, dass der Supabase-AV-Vertrag (DPA) abgeschlossen ist, und die
                  Grundlage für eine etwaige Übermittlung in die USA
                </Missing>,
              ],
            ]}
          />
        </Section>

        <Section id="cookies">
          <p>
            Notwendige Cookies und Speichereinträge setzen wir nach § 25 Abs. 2 Nr. 2 TDDDG ohne
            Einwilligung ein, weil die Website ohne sie nicht wie gewünscht funktioniert. Optionale
            Dienste würden wir nur mit deiner Einwilligung laden (Art. 6 Abs. 1 lit. a DSGVO, § 25
            Abs. 1 TDDDG). Das Ablehnen optionaler Dienste schränkt die Website und die Reservierung
            nicht ein. Du kannst deine Auswahl jederzeit ändern oder widerrufen.
          </p>
          <CookieSettingsButton className={`mt-2 ${button}`} />

          <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
            {CATEGORY_INFO.necessary.title}
          </h3>
          <p>
            {CATEGORY_INFO.necessary.description} Besucher ohne Konto erhalten auf der öffentlichen
            Website nur das Cookie für die Cookie-Einstellungen und – nur wenn du es bei einer
            Reservierung ankreuzt – deine gespeicherten Kontaktdaten im Local Storage.
          </p>
          <ServiceList services={SERVICES.necessary} />

          {OPTIONAL_CATEGORIES.map((c) => (
            <div key={c}>
              <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
                {CATEGORY_INFO[c].title}{" "}
                <span className="text-base text-muted-foreground">· optional</span>
              </h3>
              <p className="mt-3">{CATEGORY_INFO[c].description}</p>
              {SERVICES[c].length ? (
                <ServiceList services={SERVICES[c]} />
              ) : (
                <p className="mt-3 border-l-2 border-gold pl-4 text-sm text-foreground">
                  Derzeit setzen wir in dieser Kategorie keine Dienste ein.
                </p>
              )}
            </div>
          ))}
        </Section>

        <Section id="schriften">
          <p>
            Die Schriften Cormorant Garamond und Manrope liefern wir von unserem eigenen Server aus.
            Beim Besuch der Website wird dafür keine Verbindung zu Google Fonts aufgebaut.
          </p>
        </Section>

        <Section id="rechte">
          <p>Du hast gegenüber uns jederzeit das Recht auf</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO),</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
            <li>Löschung (Art. 17 DSGVO),</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
            <li>
              Widerspruch gegen Verarbeitungen, die auf unserem berechtigten Interesse beruhen (Art.
              21 DSGVO),
            </li>
            <li>
              Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO) – für
              Cookies über die Cookie-Einstellungen.
            </li>
          </ul>
          <p>
            Wende dich dafür an die oben genannten Kontaktdaten. Außerdem kannst du dich bei einer
            Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), z. B. bei der für uns
            zuständigen Landesbeauftragten für den Datenschutz und für das Recht auf Akteneinsicht
            Brandenburg, Stahnsdorfer Damm 77, 14532 Kleinmachnow.
          </p>
        </Section>
      </article>
    </main>
  );
}

function Section({ id, children }: { id: (typeof SECTIONS)[number][0]; children: ReactNode }) {
  const index = SECTIONS.findIndex(([s]) => s === id);
  return (
    <section className="mt-14 scroll-mt-8" aria-labelledby={id}>
      <h2 id={id} className="font-serif text-3xl font-light">
        {index + 1}. {SECTIONS[index]?.[1]}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border border-y border-border text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-1 py-4 md:grid-cols-[180px_1fr] md:gap-6">
          <dt className="text-foreground/80">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function ServiceList({ services }: { services: Service[] }) {
  return (
    <dl className="mt-6 divide-y divide-border border-y border-border">
      {services.map((s) => (
        <div key={s.name} className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:gap-6">
          <dt>
            <span className="block font-medium text-foreground">{s.name}</span>
            <span className="block text-xs text-muted-foreground">{s.provider}</span>
          </dt>
          <dd className="text-sm leading-relaxed text-muted-foreground">
            <p className="text-foreground">{s.purpose}</p>
            <p className="mt-2">
              <span className="text-foreground/80">Speicher:</span> {s.storage}
            </p>
            <p>
              <span className="text-foreground/80">Dauer:</span> {s.retention}
            </p>
            {s.scope && (
              <p>
                <span className="text-foreground/80">Betrifft:</span> {s.scope}
              </p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
