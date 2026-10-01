/**
 * Cookie consent: what the visitor chose, stored in a first-party cookie.
 *
 * Only strictly necessary technologies run without a choice. Anything optional must be
 * rendered through <ConsentGate category=…> so it never loads before consent.
 */

export const OPTIONAL_CATEGORIES = ["analytics", "marketing", "media"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];
export type Category = "necessary" | OptionalCategory;

export type Choices = Record<OptionalCategory, boolean>;
export type Consent = Choices & { version: number; decidedAt: string };

export const CONSENT_COOKIE = "aurea_consent";
/** Bump when the list of optional services changes, so visitors are asked again. */
export const CONSENT_VERSION = 2;
/** Ask again after 12 months. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export const NONE: Choices = { analytics: false, marketing: false, media: false };
export const ALL: Choices = { analytics: true, marketing: true, media: true };

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (v.version !== CONSENT_VERSION || typeof v.decidedAt !== "string") return null;
    return {
      version: v.version,
      decidedAt: v.decidedAt,
      analytics: v.analytics === true,
      marketing: v.marketing === true,
      media: v.media === true,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(c: Consent) {
  return encodeURIComponent(JSON.stringify(c));
}

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  try {
    const entry = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
    return parseConsent(entry?.slice(CONSENT_COOKIE.length + 1));
  } catch {
    // Cookies blocked (e.g. sandboxed frame): treat as undecided, so nothing optional loads.
    return null;
  }
}

export function writeConsent(choices: Choices): Consent {
  const consent: Consent = {
    ...choices,
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  try {
    document.cookie = `${CONSENT_COOKIE}=${serializeConsent(consent)}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    // Cookies blocked: the choice still applies for this page view.
  }
  return consent;
}

export function allows(consent: Consent | null, category: Category) {
  if (category === "necessary") return true;
  return consent?.[category] === true;
}

/** Indirection so tests can observe the reload that follows a withdrawal. */
export const browser = { reload: () => window.location.reload() };
