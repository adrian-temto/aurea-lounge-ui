import { CONTACT } from "./reservation";

/**
 * Business facts the Impressum and the privacy policy (both languages) need. `null` means the
 * owner hasn't supplied it yet: the pages then show a highlighted "Fehlt: …" marker in
 * development and leave the detail out in production. Fill these in rather than editing pages.
 */
export const LEGAL = {
  businessName: "Auréa Café & Lounge",
  /** Legal owner: the person's full name, or the company name with its legal form (e.g. GmbH). */
  owner: "Aurea GmbH" as string | null,
  /** For a company: who represents it, e.g. "Geschäftsführer: Max Mustermann". */
  representative: "Geschäftsführer: Abdija Burim" as string | null,
  /** Address for privacy requests and the Impressum. */
  email: CONTACT.email as string | null,
  /** Commercial register entry if registered, e.g. "Amtsgericht Potsdam, HRB 12345". */
  register: "Amtsgericht Potsdam, HRB 42163" as string | null,
  /** VAT ID (USt-IdNr.) if there is one, e.g. "DE123456789". */
  vatId: "DE462796535" as string | null,
  /** Person responsible for the content (§ 18 Abs. 2 MStV), with address if it differs. */
  contentResponsible: "Abdija Burim" as string | null,
  /** Company that hosts the website, with its address. */
  hosting: null as string | null,
  /** How long the host keeps access logs (IP address etc.). */
  hostingLogRetention: null as string | null,
  /** Where the Supabase project stores data (eu-west-1, Ireland). */
  supabaseRegion: "Irland (AWS eu-west-1)" as string | null,
  supabaseRegionEn: "Ireland (AWS eu-west-1)",
  /** Date of the current version. */
  updated: "Oktober 2026",
  updatedEn: "October 2026",
};
