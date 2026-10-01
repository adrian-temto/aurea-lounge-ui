import TeamView, { type Member } from "@/components/admin/TeamView";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { MUST_CHANGE_PASSWORD } from "@/lib/team";
import type { Role } from "@/lib/types";

export const metadata = { title: "Team — Auréa Admin" };

/** Super admin only: who has access, adding and removing admins. */
export default async function TeamPage() {
  const session = await requireOwner();

  // Other people's roles and emails are only readable with the secret key.
  const admin = createAdminClient();
  let members: Member[] = [];
  if (admin) {
    const [roles, users, profiles] = await Promise.all([
      admin.from("user_roles").select("user_id, role"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("profiles").select("id, full_name"),
    ]);
    const names = new Map(
      ((profiles.data ?? []) as { id: string; full_name: string | null }[]).map((p) => [
        p.id,
        p.full_name,
      ]),
    );
    const roleOf = new Map<string, Role>();
    for (const r of (roles.data ?? []) as { user_id: string; role: Role }[]) {
      if (r.role === "owner" || !roleOf.has(r.user_id)) roleOf.set(r.user_id, r.role);
    }
    members = (users.data?.users ?? [])
      .filter((u) => roleOf.has(u.id))
      .map((u) => ({
        id: u.id,
        name:
          names.get(u.id)?.trim() ||
          (typeof u.user_metadata?.["full_name"] === "string"
            ? u.user_metadata["full_name"]
            : "") ||
          (u.email?.split("@")[0] ?? ""),
        email: u.email ?? "",
        role: roleOf.get(u.id)!,
        joinedAt: u.created_at,
        waitingForFirstLogin: u.user_metadata?.[MUST_CHANGE_PASSWORD] === true,
      }))
      .sort((a, b) =>
        a.role === b.role ? a.joinedAt.localeCompare(b.joinedAt) : a.role === "owner" ? -1 : 1,
      );
  }

  return <TeamView meId={session.user.id} members={members} hasSecretKey={!!admin} />;
}
