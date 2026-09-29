import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AccountLink, Permission, Profile, Role } from "@/lib/types";

export type Session = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  roles: Role[];
  permissions: Permission[];
};

/** The signed-in user (verified JWT claims), their profile and what they may do. */
export async function getSession(): Promise<Session> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return { supabase, user: null, profile: null, roles: [], permissions: [] };

  // Roles live in user_roles, which the API lets users read but never write.
  const [profile, roles, permissions] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, created_at")
      .eq("id", claims.sub)
      .single<Profile>(),
    supabase.from("user_roles").select("role").eq("user_id", claims.sub),
    supabase.rpc("my_permissions"),
  ]);

  const email = typeof claims["email"] === "string" ? claims["email"] : "";
  return {
    supabase,
    user: { id: claims.sub, email },
    profile: profile.data,
    roles: ((roles.data ?? []) as { role: Role }[]).map((r) => r.role),
    permissions: (permissions.data ?? []) as Permission[],
  };
}

/** First name from the profile, falling back to the part of the email before the @. */
export function displayName(session: Session) {
  const name = session.profile?.full_name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  return session.user?.email.split("@")[0] ?? "";
}

export const canUseDashboard = (session: Session) => session.permissions.length > 0;

export async function requireUser(next = "/account") {
  const session = await getSession();
  if (!session.user) redirect(`/join?mode=login&next=${encodeURIComponent(next)}`);
  return { ...session, user: session.user };
}

/** Any staff permission opens the dashboard; each tab and action checks its own permission. */
export async function requireDashboard() {
  const session = await requireUser("/admin");
  if (!canUseDashboard(session)) redirect("/account?error=forbidden");
  return session;
}

export function accountLink(session: Session): AccountLink {
  if (!session.user) return { href: "/join", kind: "join" };
  if (canUseDashboard(session)) return { href: "/admin", kind: "dashboard" };
  return { href: "/account", kind: "account" };
}
