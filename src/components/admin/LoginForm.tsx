"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

import { AuthFrame, authButtonCls, authInputCls as inputCls } from "./AuthFrame";

const FORBIDDEN = "Dieses Konto hat keinen Zugang zum Admin-Bereich.";

// Supabase error codes we have wording for; anything else gets a generic message.
const ERRORS: Record<string, string> = {
  invalid_credentials: "E-Mail oder Passwort ist falsch.",
  email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.",
  over_request_rate_limit: "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
};
const authMessage = (error: AuthError) =>
  ERRORS[error.code ?? ""] ?? "Anmeldung fehlgeschlagen. Bitte versuche es erneut.";

/** Email + password login for the team. Accounts without a team role are signed out again. */
export default function LoginForm({ next, forbidden }: { next: string; forbidden: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(forbidden ? FORBIDDEN : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forbidden) void createClient().auth.signOut();
  }, [forbidden]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")).trim(),
      password: String(fd.get("password")),
    });
    if (error) {
      setLoading(false);
      return setError(authMessage(error));
    }
    const { data: permissions } = await supabase.rpc("my_permissions");
    if (!Array.isArray(permissions) || permissions.length === 0) {
      await supabase.auth.signOut();
      setLoading(false);
      return setError(FORBIDDEN);
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <AuthFrame eyebrow="Team-Bereich" title="Anmelden">
      <form onSubmit={onSubmit} className="space-y-8">
        <label className="block">
          <span className="eyebrow text-muted-foreground">E-Mail</span>
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">Passwort</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button disabled={loading} className={authButtonCls}>
          {loading ? "Einen Moment…" : "Anmelden"}
        </button>
      </form>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        Zugänge legt der Super-Admin an; die Zugangsdaten kommen per E-Mail. Passwort vergessen?
        Wende dich an ihn.
      </p>
    </AuthFrame>
  );
}
