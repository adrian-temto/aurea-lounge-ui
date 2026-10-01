import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { OPTIONAL_CATEGORIES } from "@/lib/consent";
import { CATEGORY_INFO, SERVICES } from "@/lib/consent-services";
import { LEGAL } from "@/lib/legal";
import { CONTACT } from "@/lib/reservation";

import { Facts, LegalPage, Missing, Section, ServiceList, Toc, legalButton } from "./LegalPage";

/** Datenschutzerklärung. The English version (PrivacyEn) must say the same; keep them in step. */
const SECTIONS = [
  ["verantwortlich", "Verantwortlicher"],
  ["ueberblick", "Überblick"],
  ["website", "Besuch der Website & Hosting"],
  ["reservierung", "Tischreservierung"],
  ["angebote", "Angebote per E-Mail (Double-Opt-in)"],
  ["email", "E-Mails zur Reservierung (Resend)"],
  ["supabase", "Datenbank (Supabase)"],
  ["karte", "Karte (Google Maps)"],
  ["cookies", "Cookies & Speicher"],
  ["schriften", "Schriftarten"],
  ["rechte", "Deine Rechte"],
] as const;

const link = "link-line text-foreground";

export function PrivacyDe() {
  return (
    <LegalPage locale="de" eyebrow="Datenschutz" title={"Datenschutz­"} titleEm="erklärung">
      <p className="mt-8 leading-relaxed text-muted-foreground">
        Hier erklären wir, welche personenbezogenen Daten beim Besuch dieser Website und bei einer
        Tischreservierung verarbeitet werden, wofür, auf welcher Rechtsgrundlage und wie lange.
        Stand: {LEGAL.updated}.
      </p>

      <Toc entries={SECTIONS} label="Inhalt" />

      <Section id="verantwortlich" entries={SECTIONS}>
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

      <Section id="ueberblick" entries={SECTIONS}>
        <p>
          Wir verarbeiten nur, was für die Website und deine Reservierung nötig ist. Es gibt keine
          Kundenkonten: Du reservierst ohne Registrierung, und wir antworten dir per E-Mail. Wir
          setzen derzeit <strong className="font-medium text-foreground">keine</strong> Analyse-
          oder Statistikdienste und keine Werbe- oder Social-Media-Pixel ein. Angebote per E-Mail
          schicken wir nur, wenn du sie ausdrücklich bestellt und per Link bestätigt hast. Die Karte
          von Google Maps auf der Seite „Anfahrt“ lädt erst, wenn du es erlaubst. Die Links zu
          sozialen Netzwerken im Footer laden keine Inhalte dieser Anbieter. Es gibt kein
          Kontaktformular; wenn du uns anrufst, nutzen wir deine Angaben nur, um dein Anliegen zu
          beantworten.
        </p>
        <p>Eine automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.</p>
      </Section>

      <Section id="website" entries={SECTIONS}>
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
          Bestätigung, dass ein Auftragsverarbeitungsvertrag (AVV) mit dem Hosting-Anbieter besteht
          — erst dann hier erwähnen
        </Missing>
      </Section>

      <Section id="reservierung" entries={SECTIONS}>
        <p>
          Wenn du über das Reservierungsfenster oder das Formular auf der Startseite einen Tisch
          anfragst, speichern wir deine Anfrage in unserer Datenbank (siehe{" "}
          <a href="#supabase" className={link}>
            Supabase
          </a>
          ). Unser Team sieht sie in unserem internen, passwortgeschützten Dashboard. Du erhältst
          sofort eine E-Mail, dass deine Anfrage eingegangen ist, und eine weitere, sobald wir sie
          bestätigen, ablehnen oder eine Rückfrage haben (siehe{" "}
          <a href="#email" className={link}>
            E-Mails zur Reservierung
          </a>
          ).
        </p>
        <Facts
          rows={[
            [
              "Daten",
              "Name, Telefonnummer, E-Mail-Adresse, Datum, Uhrzeit, Anzahl der Personen, Sitzwunsch, die Sprache, in der du reserviert hast, deine Auswahl zu Angeboten per E-Mail, – freiwillig – besondere Wünsche sowie unsere Antwort an dich und wann wir sie verschickt haben.",
            ],
            [
              "Zweck",
              "Deine Reservierung bearbeiten, bestätigen oder absagen und dich dazu kontaktieren, vor allem per E-Mail.",
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
              "Zwei Jahre nach dem Reservierungsdatum entfernen wir automatisch alle Angaben, die dich identifizieren (Name, Telefonnummer, E-Mail-Adresse, Wünsche, unsere Antwort, deine Auswahl zu Angeboten). Übrig bleiben nur Datum, Uhrzeit, Personenzahl und Status, ohne Bezug zu dir, für unsere Planung. Verlangst du die Löschung früher, löschen wir alle deine Reservierungen vollständig.",
            ],
          ]}
        />
        <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
          Rückfragen per Telefon, SMS oder WhatsApp
        </h3>
        <p>
          In der Regel antworten wir per E-Mail. Erreichen wir dich so nicht, melden wir uns
          telefonisch, per SMS oder per WhatsApp. Wenn wir dir über WhatsApp schreiben, erhält die
          WhatsApp Ireland Limited (Merrion Road, Dublin 4, Irland) deine Telefonnummer und den
          Inhalt der Nachricht; dabei können Daten auch an die Muttergesellschaft Meta Platforms,
          Inc. in den USA übermittelt werden. Möchtest du nicht über WhatsApp kontaktiert werden,
          sag uns das telefonisch oder im Feld für besondere Wünsche im Formular auf der Startseite.
        </p>
        <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
          Allergien und Unverträglichkeiten
        </h3>
        <p>
          Angaben zu Allergien oder Unverträglichkeiten im Feld für besondere Wünsche sind
          freiwillig. Machst du sie, verarbeiten wir sie mit deiner ausdrücklichen Einwilligung
          (Art. 9 Abs. 2 lit. a DSGVO) ausschließlich, um deinen Besuch vorzubereiten. Du kannst die
          Einwilligung jederzeit widerrufen, z. B. telefonisch.
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

      <Section id="angebote" entries={SECTIONS}>
        <p>
          Angebote und Neuigkeiten per E-Mail schicken wir dir nur mit deiner Einwilligung (Art. 6
          Abs. 1 lit. a DSGVO, § 7 Abs. 2 Nr. 2 UWG). Das Häkchen im Reservierungsformular ist
          freiwillig; ohne es kannst du genauso reservieren. Kreuzt du es an, schicken wir dir eine
          E-Mail mit einem Bestätigungslink (Double-Opt-in). Erst wenn du dort bestätigst, ist deine
          Einwilligung erteilt. Bestätigst du nicht innerhalb von 30 Tagen, verfällt der Link und du
          erhältst keine Angebote.
        </p>
        <Facts
          rows={[
            [
              "Daten",
              "E-Mail-Adresse, Name, Sprache sowie als Nachweis deiner Einwilligung der Zeitpunkt der Anmeldung (Reservierung) und der Bestätigung.",
            ],
            [
              "Widerruf",
              "Jederzeit mit Wirkung für die Zukunft, z. B. mit einer kurzen Antwort auf eine unserer E-Mails oder telefonisch. Den Nachweis der Einwilligung bewahren wir danach nur so lange auf, wie wir ihn zur Abwehr von Ansprüchen brauchen, längstens bis zur Anonymisierung nach 2 Jahren.",
            ],
            ["Versand", "Über Resend (siehe unten). Angebote per SMS schicken wir nicht."],
          ]}
        />
      </Section>

      <Section id="email" entries={SECTIONS}>
        <p>
          Die E-Mails zu deiner Reservierung – die Eingangsbestätigung, unsere Antwort und ggf. die
          Bestätigungs-E-Mail für Angebote – verschicken wir über den E-Mail-Dienst Resend. Unser
          Team erhält außerdem eine Benachrichtigung über jede neue Anfrage mit deinen
          Reservierungsangaben. Antwortest du auf eine unserer E-Mails, landet deine Nachricht in
          unserem Postfach.
        </p>
        <Facts
          rows={[
            [
              "Anbieter",
              <>
                Resend, Inc., USA{" "}
                <Missing>vollständige Anschrift laut Resend-AV-Vertrag (DPA)</Missing>
              </>,
            ],
            [
              "Daten",
              "E-Mail-Adresse, Name, Datum, Uhrzeit, Personenzahl, Wünsche und der Text unserer Antwort sowie Versandprotokolle (Zeitpunkt, Zustellstatus).",
            ],
            [
              "Rechtsgrundlage",
              "Art. 6 Abs. 1 lit. b DSGVO (Bearbeitung deiner Reservierung); für die Bestätigungs-E-Mail zu Angeboten Art. 6 Abs. 1 lit. a DSGVO. Resend verarbeitet die Daten in unserem Auftrag (Art. 28 DSGVO).",
            ],
            [
              "Drittland",
              "Resend speichert Konto- und Versanddaten in den USA. Resend ist nach dem EU-US Data Privacy Framework zertifiziert (Art. 45 DSGVO).",
            ],
            [
              "Speicherdauer",
              <>
                Bei Resend laut dessen Aufbewahrungsfrist für Versandprotokolle{" "}
                <Missing>Frist aus eurem Resend-Tarif (z. B. 30 Tage)</Missing>; in unserem Postfach
                bis zur Erledigung deines Anliegens, spätestens nach 2 Jahren.
              </>,
            ],
          ]}
        />
        <Missing>
          Bestätigung, dass der AV-Vertrag (DPA) mit Resend abgeschlossen ist — Resend bietet ihn im
          Dashboard an
        </Missing>
      </Section>

      <Section id="supabase" entries={SECTIONS}>
        <p>
          Reservierungen, die Speisekarte und die Anmeldung unseres Teams im Admin-Bereich laufen
          über Supabase, einen Datenbank- und Anmeldedienst der Supabase Inc. Supabase verarbeitet
          die Daten in unserem Auftrag (Art. 28 DSGVO).
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
                Bestätigung, dass der Supabase-AV-Vertrag (DPA) abgeschlossen ist, und die Grundlage
                für eine etwaige Übermittlung in die USA
              </Missing>,
            ],
          ]}
        />
      </Section>

      <Section id="karte" entries={SECTIONS}>
        <p>
          Auf der Seite „Anfahrt“ zeigen wir unseren Standort mit Google Maps, einem Dienst der
          Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Die Karte lädt
          erst, wenn du „Karte laden“ wählst oder „Externe Inhalte“ in den Cookie-Einstellungen
          erlaubst. Dann überträgt dein Browser u. a. deine IP-Adresse an Google, und Google kann
          Cookies setzen. Dabei können Daten an Google LLC in den USA übermittelt werden; Google ist
          nach dem EU-US Data Privacy Framework zertifiziert.
        </p>
        <Facts
          rows={[
            [
              "Rechtsgrundlage",
              "Deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG), jederzeit widerrufbar über die Cookie-Einstellungen.",
            ],
            [
              "Datenschutz bei Google",
              <a
                key="g"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                policies.google.com/privacy
              </a>,
            ],
          ]}
        />
        <p>
          Ohne Einwilligung siehst du stattdessen unsere Adresse. Der Link „Route planen“ öffnet
          Google Maps erst, wenn du ihn anklickst.
        </p>
      </Section>

      <Section id="cookies" entries={SECTIONS}>
        <p>
          Notwendige Cookies und Speichereinträge setzen wir nach § 25 Abs. 2 Nr. 2 TDDDG ohne
          Einwilligung ein, weil die Website ohne sie nicht wie gewünscht funktioniert. Optionale
          Dienste laden wir nur mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1
          TDDDG). Das Ablehnen optionaler Dienste schränkt die Website und die Reservierung nicht
          ein. Du kannst deine Auswahl jederzeit ändern oder widerrufen.
        </p>
        <CookieSettingsButton className={`mt-2 ${legalButton}`} />

        <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
          {CATEGORY_INFO.necessary.title}
        </h3>
        <p>
          {CATEGORY_INFO.necessary.description} Besucher erhalten auf der öffentlichen Website nur
          das Cookie für die Cookie-Einstellungen und – nur wenn du es bei einer Reservierung
          ankreuzt bzw. die Sprache umschaltest – deine gespeicherten Kontaktdaten im Local Storage
          bzw. das Sprach-Cookie. Anmelde-Cookies gibt es nur für unser Team im Admin-Bereich.
        </p>
        <ServiceList services={SERVICES.necessary} locale="de" />

        {OPTIONAL_CATEGORIES.map((c) => (
          <div key={c}>
            <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
              {CATEGORY_INFO[c].title}{" "}
              <span className="text-base text-muted-foreground">· optional</span>
            </h3>
            <p className="mt-3">{CATEGORY_INFO[c].description}</p>
            {SERVICES[c].length ? (
              <ServiceList services={SERVICES[c]} locale="de" />
            ) : (
              <p className="mt-3 border-l-2 border-gold pl-4 text-sm text-foreground">
                Derzeit setzen wir in dieser Kategorie keine Dienste ein.
              </p>
            )}
          </div>
        ))}
      </Section>

      <Section id="schriften" entries={SECTIONS}>
        <p>
          Die Schriften Cormorant Garamond und Manrope liefern wir von unserem eigenen Server aus.
          Beim Besuch der Website wird dafür keine Verbindung zu Google Fonts aufgebaut.
        </p>
      </Section>

      <Section id="rechte" entries={SECTIONS}>
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
          Wende dich dafür an die oben genannten Kontaktdaten. Für eine Löschung genügt die
          E-Mail-Adresse oder Telefonnummer, mit der du reserviert hast; wir löschen dann alle
          Reservierungen dazu und bestätigen dir das. Außerdem kannst du dich bei einer
          Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO), z. B. bei der für uns zuständigen
          Landesbeauftragten für den Datenschutz und für das Recht auf Akteneinsicht Brandenburg,
          Stahnsdorfer Damm 77, 14532 Kleinmachnow.
        </p>
      </Section>
    </LegalPage>
  );
}
