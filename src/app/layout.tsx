import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { LOCALE_SWITCH_KEY, SITE_URL } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

import { Providers } from "./providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Auréa — Breakfast · Café · Lounge",
  description: "A golden retreat from dawn to late in Beelitz.",
  openGraph: { type: "website", siteName: "Auréa" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Set by proxy.ts: "en" under /en, otherwise German.
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Arriving from a language switch: stay hidden until the scroll position is restored,
            then useLocaleArrival fades the page in. CSS un-hides it after 1.5s regardless. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem(${JSON.stringify(LOCALE_SWITCH_KEY)})&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("locale-arriving")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
