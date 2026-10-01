import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthFrame } from "@/components/admin/AuthFrame";
import PasswordForm from "@/components/admin/PasswordForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Passwort festlegen — Auréa Admin",
  robots: { index: false },
};

/** First sign-in with the temporary password from the welcome email: choose your own. */
export default async function FirstPasswordPage() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (!session.mustChangePassword) redirect("/admin");
  return (
    <AuthFrame eyebrow="Erste Anmeldung" title="Dein Passwort">
      <PasswordForm email={session.user.email} />
    </AuthFrame>
  );
}
