declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
    /** Public site address for canonical and hreflang links; defaults to https://aurealounge.de. */
    NEXT_PUBLIC_SITE_URL?: string;
  }
}
