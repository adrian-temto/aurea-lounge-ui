import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { OPTIONAL_CATEGORIES } from "@/lib/consent";
import { SERVICES } from "@/lib/consent-services";
import { getDictionary } from "@/i18n/dictionaries";
import { LEGAL } from "@/lib/legal";
import { CONTACT } from "@/lib/reservation";

import { Facts, LegalPage, Missing, Section, ServiceList, Toc, legalButton } from "./LegalPage";

/** English translation of PrivacyDe. Same content and order; keep them in step. */
const SECTIONS = [
  ["controller", "Controller"],
  ["overview", "Overview"],
  ["website", "Visiting the website & hosting"],
  ["reservation", "Table reservations"],
  ["offers", "Offers by email (double opt-in)"],
  ["email", "Reservation emails (Resend)"],
  ["supabase", "Database (Supabase)"],
  ["map", "Map (Google Maps)"],
  ["cookies", "Cookies & storage"],
  ["fonts", "Fonts"],
  ["rights", "Your rights"],
] as const;

const link = "link-line text-foreground";
const categoryInfo = getDictionary("en").consent.categoryInfo;

export function PrivacyEn() {
  return (
    <LegalPage locale="en" eyebrow="Privacy" title="Privacy " titleEm="policy">
      <p className="mt-8 leading-relaxed text-muted-foreground">
        This page explains which personal data is processed when you visit this website and when you
        book a table, for what purpose, on which legal basis and for how long. Last updated:{" "}
        {LEGAL.updatedEn}.
      </p>
      <p className="mt-4 border-l-2 border-gold pl-4 text-sm leading-relaxed text-muted-foreground">
        This is a translation for your convenience. If the two versions differ, the German version (
        <span lang="de">Datenschutzerklärung</span>, “DE” above) prevails.
      </p>

      <Toc entries={SECTIONS} label="Contents" />

      <Section id="controller" entries={SECTIONS}>
        <p>The controller responsible for data processing on this website is:</p>
        <address className="mt-4 border-l-2 border-gold pl-4 not-italic text-foreground">
          {LEGAL.owner ?? (
            <Missing>Name der Inhaberin / des Inhabers bzw. Firma mit Rechtsform</Missing>
          )}
          {LEGAL.owner && <br />}
          {LEGAL.businessName}
          <br />
          {CONTACT.street}, {CONTACT.city}, Germany
          <br />
          Phone:{" "}
          <a href={CONTACT.phoneHref} className="link-line">
            {CONTACT.phone}
          </a>
          <br />
          {LEGAL.email ? (
            <>
              Email:{" "}
              <a href={`mailto:${LEGAL.email}`} className="link-line">
                {LEGAL.email}
              </a>
            </>
          ) : (
            <Missing>E-Mail-Adresse für Datenschutzanfragen</Missing>
          )}
        </address>
      </Section>

      <Section id="overview" entries={SECTIONS}>
        <p>
          We only process what is needed for the website and your reservation. There are no customer
          accounts: you book without registering, and we reply by email. We currently use{" "}
          <strong className="font-medium text-foreground">no</strong> analytics or statistics
          services and no advertising or social media pixels. We only send offers by email if you
          have expressly asked for them and confirmed via a link. The Google Maps map on the “Visit”
          page only loads once you allow it. The links to social networks in the footer do not load
          any content from those providers. There is no contact form; if you call us, we use your
          details only to deal with your request.
        </p>
        <p>We do not use automated decision-making or profiling.</p>
      </Section>

      <Section id="website" entries={SECTIONS}>
        <p>
          When you open the website, our hosting provider processes the technically necessary
          connection data so that the pages can be delivered: IP address, date and time, the address
          requested, the amount of data transferred, and your browser and operating system.
        </p>
        <Facts
          rows={[
            ["Provider", LEGAL.hosting ?? <Missing>Hosting-Anbieter mit Anschrift</Missing>],
            [
              "Legal basis",
              "Art. 6(1)(f) GDPR – our legitimate interest in a secure, working website",
            ],
            [
              "Retention",
              LEGAL.hostingLogRetention ?? (
                <Missing>wie lange der Hosting-Anbieter Zugriffsprotokolle speichert</Missing>
              ),
            ],
          ]}
        />
      </Section>

      <Section id="reservation" entries={SECTIONS}>
        <p>
          When you request a table through the booking dialog or the form on the homepage, we store
          your request in our database (see{" "}
          <a href="#supabase" className={link}>
            Supabase
          </a>
          ). Our team sees it in our internal, password-protected dashboard. You immediately receive
          an email confirming that your request has arrived, and another one as soon as we confirm
          or decline it or have a question (see{" "}
          <a href="#email" className={link}>
            reservation emails
          </a>
          ).
        </p>
        <Facts
          rows={[
            [
              "Data",
              "Name, phone number, email address, date, time, party size, seating preference, the language you booked in, your choice about offers by email, – voluntarily – special requests, as well as our reply to you and when we sent it.",
            ],
            [
              "Purpose",
              "Handling, confirming or declining your reservation and contacting you about it, mainly by email.",
            ],
            [
              "Legal basis",
              "Art. 6(1)(b) GDPR (steps taken at your request before entering into a contract).",
            ],
            [
              "Required details",
              "We need your name, phone number and email address to confirm the reservation. Without them, online booking is not possible; you can always call us instead.",
            ],
            [
              "Retention",
              "Two years after the reservation date, we automatically remove everything that identifies you (name, phone number, email address, requests, our reply, your choice about offers). Only the date, time, party size and status remain, with no link to you, for our planning. If you ask for deletion earlier, we delete all your reservations completely.",
            ],
          ]}
        />
        <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
          Questions by phone, text message or WhatsApp
        </h3>
        <p>
          We usually reply by email. If we can't reach you that way, we get in touch by phone, text
          message or WhatsApp. If we write to you on WhatsApp, WhatsApp Ireland Limited (Merrion
          Road, Dublin 4, Ireland) receives your phone number and the content of the message; data
          may also be transferred to its parent company Meta Platforms, Inc. in the USA. If you
          don't want to be contacted via WhatsApp, tell us by phone or in the special requests field
          of the form on the homepage.
        </p>
        <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
          Allergies and intolerances
        </h3>
        <p>
          Information about allergies or intolerances in the special requests field is voluntary. If
          you provide it, we process it with your explicit consent (Art. 9(2)(a) GDPR) solely to
          prepare for your visit. You can withdraw your consent at any time, e.g. by phone.
        </p>
        <h3 className="pt-2 font-serif text-2xl font-light text-foreground">
          Saving your details for future bookings
        </h3>
        <p>
          If you tick “Save my details for my next reservations”, your browser stores your name,
          phone number and email address in this device’s local storage so the form is already
          filled in next time. This copy never reaches us. If you untick the box on a later booking,
          we delete it again; you can also delete it via your browser data.
        </p>
      </Section>

      <Section id="offers" entries={SECTIONS}>
        <p>
          We only send offers and news by email with your consent (Art. 6(1)(a) GDPR, Section 7(2)
          no. 2 of the German Unfair Competition Act, UWG). The box in the booking form is
          voluntary; you can book just the same without it. If you tick it, we send you an email
          with a confirmation link (double opt-in). Only once you confirm there is your consent
          given. If you don't confirm within 30 days, the link expires and you won't receive any
          offers.
        </p>
        <Facts
          rows={[
            [
              "Data",
              "Email address, name, language and, as proof of your consent, the time of sign-up (booking) and of confirmation.",
            ],
            [
              "Withdrawal",
              "At any time with effect for the future, e.g. with a short reply to any of our emails or by phone. We then keep the proof of consent only as long as we need it to defend against claims, at most until it is anonymised after 2 years.",
            ],
            ["Sending", "Via Resend (see below). We do not send offers by text message."],
          ]}
        />
      </Section>

      <Section id="email" entries={SECTIONS}>
        <p>
          We send the emails about your reservation – the confirmation of receipt, our reply and, if
          applicable, the confirmation email for offers – through the email service Resend. Our team
          also receives a notification about each new request containing your reservation details.
          If you reply to one of our emails, your message arrives in our inbox.
        </p>
        <Facts
          rows={[
            [
              "Provider",
              <>
                Resend, Inc., USA{" "}
                <Missing>vollständige Anschrift laut Resend-AV-Vertrag (DPA)</Missing>
              </>,
            ],
            [
              "Data",
              "Email address, name, date, time, party size, requests and the text of our reply, plus delivery logs (time, delivery status).",
            ],
            [
              "Legal basis",
              "Art. 6(1)(b) GDPR (handling your reservation); for the confirmation email about offers, Art. 6(1)(a) GDPR. Resend processes the data on our behalf (Art. 28 GDPR).",
            ],
            [
              "Third country",
              "Resend stores account and delivery data in the USA. Resend is certified under the EU-US Data Privacy Framework (Art. 45 GDPR).",
            ],
            [
              "Retention",
              <>
                At Resend according to its retention period for delivery logs{" "}
                <Missing>Frist aus eurem Resend-Tarif (z. B. 30 Tage)</Missing>; in our inbox until
                your request has been dealt with, at most 2 years.
              </>,
            ],
          ]}
        />
      </Section>

      <Section id="supabase" entries={SECTIONS}>
        <p>
          Reservations, the menu and our team’s sign-in to the admin area run on Supabase, a
          database and authentication service of Supabase Inc. Supabase processes the data on our
          behalf (Art. 28 GDPR).
        </p>
        <p>
          Your browser loads menu photos directly from Supabase’s servers. Supabase then receives
          technically necessary connection data such as your IP address, the image requested and
          details about your browser. The legal basis is our legitimate interest in a complete,
          fast-loading menu (Art. 6(1)(f) GDPR). Supabase sets no cookies for this.
        </p>
        <Facts
          rows={[
            ["Server location", LEGAL.supabaseRegionEn],
            [
              "Data processing agreement",
              <Missing key="dpa">
                Bestätigung, dass der Supabase-AV-Vertrag (DPA) abgeschlossen ist, und die Grundlage
                für eine etwaige Übermittlung in die USA
              </Missing>,
            ],
          ]}
        />
      </Section>

      <Section id="map" entries={SECTIONS}>
        <p>
          On the “Visit” page we show our location with Google Maps, a service of Google Ireland
          Limited, Gordon House, Barrow Street, Dublin 4, Ireland. The map only loads once you
          choose “Load map” or allow “External content” in the cookie settings. Your browser then
          sends Google your IP address among other data, and Google may set cookies. Data may be
          transferred to Google LLC in the USA; Google is certified under the EU-US Data Privacy
          Framework.
        </p>
        <Facts
          rows={[
            [
              "Legal basis",
              "Your consent (Art. 6(1)(a) GDPR, Section 25(1) TDDDG), which you can withdraw at any time in the cookie settings.",
            ],
            [
              "Google’s privacy policy",
              <a
                key="g"
                href="https://policies.google.com/privacy?hl=en"
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
          Without consent you see our address instead. The “Get directions” link only opens Google
          Maps when you click it.
        </p>
      </Section>

      <Section id="cookies" entries={SECTIONS}>
        <p>
          We use strictly necessary cookies and storage entries without consent under Section 25(2)
          no. 2 TDDDG (German Telecommunications Digital Services Data Protection Act), because the
          website would not work as intended without them. We only load optional services with your
          consent (Art. 6(1)(a) GDPR, Section 25(1) TDDDG). Declining optional services does not
          limit the website or booking. You can change or withdraw your choice at any time.
        </p>
        <CookieSettingsButton className={`mt-2 ${legalButton}`} />

        <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
          {categoryInfo.necessary.title}
        </h3>
        <p>
          {categoryInfo.necessary.description} On the public website, visitors only receive the
          cookie for the cookie settings and – only if you tick the box when booking or switch
          language – your saved contact details in local storage or the language cookie. Sign-in
          cookies exist only for our team in the admin area.
        </p>
        <ServiceList services={SERVICES.necessary} locale="en" />

        {OPTIONAL_CATEGORIES.map((c) => (
          <div key={c}>
            <h3 className="pt-6 font-serif text-2xl font-light text-foreground">
              {categoryInfo[c].title}{" "}
              <span className="text-base text-muted-foreground">· optional</span>
            </h3>
            <p className="mt-3">{categoryInfo[c].description}</p>
            {SERVICES[c].length ? (
              <ServiceList services={SERVICES[c]} locale="en" />
            ) : (
              <p className="mt-3 border-l-2 border-gold pl-4 text-sm text-foreground">
                We currently use no services in this category.
              </p>
            )}
          </div>
        ))}
      </Section>

      <Section id="fonts" entries={SECTIONS}>
        <p>
          We serve the fonts Cormorant Garamond and Manrope from our own server. No connection to
          Google Fonts is made when you visit the website.
        </p>
      </Section>

      <Section id="rights" entries={SECTIONS}>
        <p>You have the right at any time to</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>access the data we hold about you (Art. 15 GDPR),</li>
          <li>have incorrect data corrected (Art. 16 GDPR),</li>
          <li>have your data deleted (Art. 17 GDPR),</li>
          <li>restrict processing (Art. 18 GDPR),</li>
          <li>data portability (Art. 20 GDPR),</li>
          <li>object to processing based on our legitimate interest (Art. 21 GDPR),</li>
          <li>
            withdraw consent with effect for the future (Art. 7(3) GDPR) – for cookies via the
            cookie settings.
          </li>
        </ul>
        <p>
          Please use the contact details above. For deletion, the email address or phone number you
          booked with is enough; we then delete all reservations linked to it and confirm this to
          you. You can also lodge a complaint with a data protection supervisory authority (Art. 77
          GDPR), e.g. the authority responsible for us: Die Landesbeauftragte für den Datenschutz
          und für das Recht auf Akteneinsicht Brandenburg, Stahnsdorfer Damm 77, 14532 Kleinmachnow,
          Germany.
        </p>
      </Section>
    </LegalPage>
  );
}
