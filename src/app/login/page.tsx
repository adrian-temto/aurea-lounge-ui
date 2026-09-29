import type { Metadata } from "next";
import { redirect } from "next/navigation";

import JoinForm from "@/components/auth/JoinForm";
import { isLocalizedRoute, languageAlternates, localizePath, splitLocale } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { canUseDashboard, getSession } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    title: t.meta.joinTitle,
    description: t.meta.joinDescription,
    alternates: languageAlternates(locale, "/login"),
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function JoinPage({ searchParams }: { searchParams: SearchParams }) {
  const [sp, { locale }] = await Promise.all([searchParams, getI18n()]);
  const nextParam = one(sp["next"]);
  const safe = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  // After signing in, stay in the language of this page (e.g. ?next=/account on /en/login).
  const target = safe ? splitLocale(safe).path : null;
  const next = target ? (isLocalizedRoute(target) ? localizePath(locale, target) : target) : null;

  const session = await getSession();
  if (session.user) {
    redirect(next ?? (canUseDashboard(session) ? "/admin" : localizePath(locale, "/account")));
  }

  return (
    <JoinForm
      initialMode={one(sp["mode"]) === "signup" ? "signup" : "login"}
      next={next}
      notice={one(sp["notice"]) ?? null}
    />
  );
}
