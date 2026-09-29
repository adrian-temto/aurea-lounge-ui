import type { NextConfig } from "next";

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

export default function config(): NextConfig {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length) {
    const message = `Missing environment variables: ${missing.join(", ")}. Copy .env.example to .env.local, or add them in Vercel -> Project -> Settings -> Environment Variables.`;
    console.warn(`Warning: ${message}`);
  }
  return nextConfig;
}
