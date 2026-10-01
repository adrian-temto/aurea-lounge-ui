"use client";

import { useConsent } from "@/components/consent/ConsentProvider";
import { useI18n } from "@/i18n/client";
import { NONE } from "@/lib/consent";
import { CONTACT } from "@/lib/reservation";

/**
 * The café on Google Maps. The iframe sends the visitor's IP address and cookies to Google, so
 * it only loads once "External content" (media) is allowed — either in the cookie settings or
 * with the button here, which turns on just that category. Listed in lib/consent-services.ts.
 */
export function GoogleMap({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const { ready, allows, consent, save, openSettings } = useConsent();
  const m = t.visit.map;
  const query = encodeURIComponent(`${CONTACT.mapsQuery}`);
  const src = `https://www.google.com/maps?q=${query}&z=16&hl=${locale}&output=embed`;

  if (ready && allows("media")) {
    return (
      <iframe
        src={src}
        title={m.title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className={`block h-full w-full border-0 ${className}`}
      />
    );
  }

  return (
    <div className={`grid h-full w-full place-items-center bg-card p-6 text-center ${className}`}>
      <div className="max-w-sm">
        <p className="eyebrow text-gold">Google Maps</p>
        <p className="mt-4 font-serif text-2xl font-light leading-snug">
          {CONTACT.street}
          <br />
          {CONTACT.city}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.consent}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => save({ ...(consent ?? NONE), media: true })}
            className="press min-h-11 bg-foreground px-6 py-3 text-[0.7rem] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {m.load}
          </button>
          <button
            type="button"
            onClick={openSettings}
            className="link-line min-h-11 text-xs text-muted-foreground hover:text-foreground"
          >
            {t.consent.settingsTitle}
          </button>
        </div>
      </div>
    </div>
  );
}
