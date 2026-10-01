"use server";

import { getSession } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH, MUST_CHANGE_PASSWORD } from "@/lib/team";

/** Replaces the temporary password from the welcome email with the admin's own. */
export async function setOwnPassword(
  password: string,
  repeat: string,
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.user) return { error: "Bitte melde dich zuerst an." };
  if (password.length < MIN_PASSWORD_LENGTH)
    return { error: `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen.` };
  if (password !== repeat) return { error: "Die beiden Passwörter sind nicht gleich." };

  const { error } = await session.supabase.auth.updateUser({
    password,
    data: { [MUST_CHANGE_PASSWORD]: false },
  });
  if (error) {
    if (error.code === "same_password")
      return { error: "Bitte wähle ein anderes Passwort als das aus der E-Mail." };
    if (error.code === "weak_password")
      return { error: "Dieses Passwort ist zu leicht zu erraten. Bitte wähle ein anderes." };
    return { error: error.message };
  }
  // A new token, so the dashboard sees the cleared flag right away.
  await session.supabase.auth.refreshSession();
  return {};
}
