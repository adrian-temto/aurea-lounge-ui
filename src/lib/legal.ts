/**
 * Business facts the Datenschutzerklärung needs. `null` means the owner hasn't supplied it yet:
 * /datenschutz then shows a highlighted "Fehlt: …" marker in development and leaves the detail
 * out in production. Fill these in rather than editing the page.
 */
export const LEGAL = {
  businessName: "Auréa Café & Lounge",
  /** Legal owner: the person's full name, or the company name with its legal form (e.g. GmbH). */
  owner: null as string | null,
  /** Address for privacy requests. */
  email: null as string | null,
  /** Company that hosts the website, with its address. */
  hosting: null as string | null,
  /** How long the host keeps access logs (IP address etc.). */
  hostingLogRetention: null as string | null,
  /** Where the Supabase project stores data, e.g. "Frankfurt (EU)". */
  supabaseRegion: "Frankfurt am Main, Deutschland (AWS eu-central-1)" as string | null,
  /** Date of the current version. */
  updated: "September 2026",
};
