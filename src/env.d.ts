declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    /** Public site address for canonical and hreflang links; defaults to https://aurealounge.de. */
    NEXT_PUBLIC_SITE_URL?: string;
    /** Site address used in notification emails; defaults to https://www.aurealounge.de. */
    ADMIN_URL?: string;
    /** Supabase secret key (server only). Needed to email the double opt-in link for offers. */
    SUPABASE_SECRET_KEY?: string;
    /** Resend API key (server only). Without it no emails are sent. */
    RESEND_API_KEY?: string;
    /** Sender on a domain verified in Resend, e.g. "Auréa <reservierung@aurealounge.de>". */
    EMAIL_FROM?: string;
    /** Team inbox(es) notified about new bookings, comma-separated. */
    RESERVATION_NOTIFY_EMAIL?: string;
    /** Where guests' replies go; defaults to the first RESERVATION_NOTIFY_EMAIL address. */
    EMAIL_REPLY_TO?: string;
  }
}
