"use client";

import { useI18n } from "@/i18n/client";

import { useConsent } from "./ConsentProvider";

/** Reopens the consent modal so visitors can change or withdraw their choice. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} aria-haspopup="dialog" className={className}>
      {t.footer.cookieSettings}
    </button>
  );
}
