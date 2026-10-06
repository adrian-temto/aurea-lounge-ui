import type { Metadata } from "next";
import { redirect } from "next/navigation";

import LoginForm from "@/components/admin/LoginForm";
import { canUseDashboard, getSession } from "@/lib/auth";

/** Team login at /login. There is no sign-up: the super admin creates admin accounts in the dashboard. */
export const metadata: Metadata = { title: "Anmelden — Auréa Admin", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const nextParam = one(sp["next"]);
  const next = nextParam?.startsWith("/admin") ? nextParam : "/admin";

  const session = await getSession();
  if (session.user && canUseDashboard(session)) redirect(next);

  // Signed in without a team role (e.g. an old guest account): the form signs them out.
  const forbidden = one(sp["error"]) === "forbidden" || !!session.user;
  return <LoginForm next={next} forbidden={forbidden} />;
}
