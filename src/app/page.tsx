import type { Metadata } from "next";

import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Auréa — Frühstück, Café & Lounge in Beelitz",
  description:
    "Eine goldene Stunde, von früh bis spät. Frühstück, Specialty Coffee und eine intime Abend-Lounge in Beelitz.",
  openGraph: {
    title: "Auréa — Frühstück, Café & Lounge",
    description:
      "Wo Morgenlicht auf Kerzenschein trifft. Come for breakfast, stay for coffee, return for the evening.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <HomePage />;
}
