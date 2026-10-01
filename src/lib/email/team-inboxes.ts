import { createAdminClient } from "@/lib/supabase/admin";

import { staffInboxes } from "./send";

/**
 * Who hears about a new booking: every account with a dashboard role (super admin and admins),
 * plus any extra inbox in RESERVATION_NOTIFY_EMAIL, e.g. a shared café address. Without the
 * secret key only the configured inboxes are known.
 */
export async function teamInboxes(): Promise<string[]> {
  const inboxes = new Set(staffInboxes().map((e) => e.toLowerCase()));

  const admin = createAdminClient();
  if (admin) {
    const [roles, users] = await Promise.all([
      admin.from("user_roles").select("user_id"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
    ]);
    if (roles.error || users.error) {
      console.error("team inboxes: could not read admins", roles.error ?? users.error);
    } else {
      const team = new Set(((roles.data ?? []) as { user_id: string }[]).map((r) => r.user_id));
      for (const u of users.data.users)
        if (team.has(u.id) && u.email) inboxes.add(u.email.toLowerCase());
    }
  }
  return [...inboxes];
}
