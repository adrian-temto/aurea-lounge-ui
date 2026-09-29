import type { NextConfig } from "next";

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

export default nextConfig;
