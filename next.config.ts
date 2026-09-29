import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/** Without these every page answers 500, so a deploy (e.g. on Vercel) must stop early. */
const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // /join was renamed to /login; keep old links and emails working.
  async redirects() {
    return [
      { source: "/join", destination: "/login", permanent: true },
      { source: "/en/join", destination: "/en/login", permanent: true },
    ];
  },
};

export default function config(phase: string): NextConfig {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length) {
    const message = `Missing environment variables: ${missing.join(", ")}. Copy .env.example to .env.local, or add them in Vercel → Project → Settings → Environment Variables.`;
    if (phase === PHASE_PRODUCTION_BUILD) throw new Error(message);
    console.warn(`⚠ ${message}`);
  }
  return nextConfig;
}
