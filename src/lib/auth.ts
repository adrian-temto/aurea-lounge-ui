import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { MUST_CHANGE_PASSWORD } from "@/lib/team";
import type { Permission, Profile, Role } from "@/lib/types";

export type Session = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  roles: Role[];
  permissions: Permission[];
  /** The one super admin: decides who else has access. */
  isOwner: boolean;
  /** Signed in with the temporary password from the welcome email; must choose their own first. */
  mustChangePassword: boolean;
};

/** The signed-in team member (verified JWT claims), their profile and what they may do. */
export async function getSession(): Promise<Session> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims)
    return {
      supabase,
      user: null,
      profile: null,
      roles: [],
      permissions: [],
      isOwner: false,
      mustChangePassword: false,
    };

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
  const meta = claims["user_metadata"] as Record<string, unknown> | undefined;
  const userRoles = ((roles.data ?? []) as { role: Role }[]).map((r) => r.role);
  return {
    supabase,
    user: { id: claims.sub, email },
    profile: profile.data,
    roles: userRoles,
    permissions: (permissions.data ?? []) as Permission[],
    isOwner: userRoles.includes("owner"),
    mustChangePassword: meta?.[MUST_CHANGE_PASSWORD] === true,
  };
}

/** First name from the profile, falling back to the part of the email before the @. */
export function displayName(session: Session) {
  const name = session.profile?.full_name?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  return session.user?.email.split("@")[0] ?? "";
}

export const canUseDashboard = (session: Session) => session.permissions.length > 0;

/**
 * Any team permission opens the dashboard; each tab and action checks its own permission.
 * There are no guest accounts: a signed-in user without a permission is sent back to the login.
 * Someone still on their temporary password chooses their own before anything else.
 */
export async function requireDashboard() {
  const session = await getSession();
  if (!session.user) redirect(`/login?next=${encodeURIComponent("/admin")}`);
  if (!canUseDashboard(session)) redirect("/login?error=forbidden");
  if (session.mustChangePassword) redirect("/login/passwort");
  return { ...session, user: session.user };
}

/** Pages only the super admin may open; everyone else lands on the overview. */
export async function requireOwner() {
  const session = await requireDashboard();
  if (!session.isOwner) redirect("/admin");
  return session;
}
