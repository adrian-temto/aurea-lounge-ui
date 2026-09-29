"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ConsentProvider } from "@/components/consent/ConsentProvider";
import type { Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { useLocaleArrival } from "@/i18n/switch";

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  useLocaleArrival();
  return (
    <I18nProvider locale={locale}>
      <QueryClientProvider client={queryClient}>
        <ConsentProvider>{children}</ConsentProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
