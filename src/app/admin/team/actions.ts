"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ADMIN_URL } from "@/lib/admin-host";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { adminWelcomeEmail } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { MUST_CHANGE_PASSWORD, NO_SECRET_KEY } from "@/lib/team";
import { newTemporaryPassword } from "@/lib/temporary-password";

type Result = { error?: string };

const FORBIDDEN = { error: "Das darf nur der Super-Admin." } as const;

/**
 * Only the super admin, once they have chosen their own password. Returns the secret-key client:
 * accounts and other people's roles are out of reach for the normal one.
 */
async function authorizeOwner() {
  const session = await getSession();
  if (!session.user || !session.isOwner || session.mustChangePassword) return { error: FORBIDDEN };
  const admin = createAdminClient();
  if (!admin) return { error: { error: NO_SECRET_KEY } };
  return { admin, userId: session.user.id };
}

/** Sign-in page for the email button. Never built from the request, which could claim any host. */
function loginUrl() {
  return `${ADMIN_URL}/login`;
}

const newAdminSchema = z.object({
  name: z.string().trim().max(80, "Höchstens 80 Zeichen."),
  email: z.string().trim().toLowerCase().email("Bitte gib eine gültige E-Mail-Adresse ein."),
});

/**
 * Creates an admin account with a temporary password and emails the login details. If the email
 * can't be sent, the account is removed again so the owner can simply try once more.
 */
export async function createAdmin(input: { name: string; email: string }): Promise<Result> {
  const auth = await authorizeOwner();
  if ("error" in auth) return auth.error;
  const parsed = newAdminSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  const { name, email } = parsed.data;
  const { admin } = auth;

  const password = newTemporaryPassword();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { ...(name ? { full_name: name } : {}), [MUST_CHANGE_PASSWORD]: true },
  });
  const user = created.data.user;
  if (created.error || !user) {
    if (created.error?.code === "email_exists")
      return { error: "Für diese E-Mail-Adresse gibt es schon ein Konto." };
    return { error: created.error?.message ?? "Das Konto konnte nicht angelegt werden." };
  }

  const role = await admin.from("user_roles").insert({ user_id: user.id, role: "admin" });
  if (role.error) {
    await admin.auth.admin.deleteUser(user.id);
    return { error: role.error.message };
  }
  if (name) {
    // Shown in the dashboard; best effort, the name is in the account's metadata as well.
    const profile = await admin.from("profiles").upsert({ id: user.id, full_name: name });
    if (profile.error) console.error("admin profile name not saved", profile.error);
  }

  const sent = await sendEmail(adminWelcomeEmail({ name, email }, password, loginUrl()));
  if (!sent.ok) {
    await admin.auth.admin.deleteUser(user.id);
    return {
      error: `Die E-Mail konnte nicht gesendet werden, das Konto wurde nicht angelegt: ${sent.error}`,
    };
  }

  revalidatePath("/admin/team");
  return {};
}

/** Roles of one account, read with the secret key. */
async function rolesOf(admin: NonNullable<ReturnType<typeof createAdminClient>>, userId: string) {
  const { data, error } = await admin.from("user_roles").select("role").eq("user_id", userId);
  return { roles: ((data ?? []) as { role: string }[]).map((r) => r.role), error };
}

/**
 * For an admin who hasn't signed in yet (email lost, landed in spam): a new temporary password,
 * emailed again. The previous one stops working.
 */
export async function resendLogin(userId: string): Promise<Result> {
  const auth = await authorizeOwner();
  if ("error" in auth) return auth.error;
  if (!z.string().uuid().safeParse(userId).success) return { error: "Ungültiges Konto." };
  const { admin } = auth;

  const { roles, error } = await rolesOf(admin, userId);
  if (error) return { error: error.message };
  if (!roles.includes("admin")) return { error: "Dieses Konto ist kein Admin." };

  const { data } = await admin.auth.admin.getUserById(userId);
  const user = data.user;
  if (!user?.email) return { error: "Konto nicht gefunden." };
  if (user.user_metadata?.[MUST_CHANGE_PASSWORD] !== true)
    return { error: "Diese Person hat schon ein eigenes Passwort festgelegt." };

  const password = newTemporaryPassword();
  const updated = await admin.auth.admin.updateUserById(userId, { password });
  if (updated.error) return { error: updated.error.message };

  const name =
    typeof user.user_metadata?.["full_name"] === "string" ? user.user_metadata["full_name"] : "";
  const sent = await sendEmail(
    adminWelcomeEmail({ name, email: user.email }, password, loginUrl()),
  );
  if (!sent.ok) return { error: `Die E-Mail konnte nicht gesendet werden: ${sent.error}` };
  return {};
}

/**
 * Takes an admin's access away by deleting their account, so the same email can be added
 * again later. Reservations they answered keep the answer (responded_by becomes empty).
 */
export async function removeAdmin(userId: string): Promise<Result> {
  const auth = await authorizeOwner();
  if ("error" in auth) return auth.error;
  if (!z.string().uuid().safeParse(userId).success) return { error: "Ungültiges Konto." };
  if (userId === auth.userId) return { error: "Deinen eigenen Zugang kannst du nicht entfernen." };
  const { admin } = auth;

  const { roles, error: rolesError } = await rolesOf(admin, userId);
  if (rolesError) return { error: rolesError.message };
  if (roles.includes("owner")) return { error: "Der Super-Admin kann nicht entfernt werden." };
  if (!roles.includes("admin")) return { error: "Dieses Konto ist kein Admin." };

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/team");
  return {};
}
