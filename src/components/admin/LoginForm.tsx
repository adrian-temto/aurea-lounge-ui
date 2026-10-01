"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import lounge from "@/assets/lounge.jpg";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "mt-3 w-full border-0 border-b border-border bg-transparent pb-3 text-base outline-none transition-colors duration-500 placeholder:text-muted-foreground/50 focus:border-gold";

const FORBIDDEN = "Dieses Konto hat keinen Zugang zum Admin-Bereich.";

// Supabase error codes we have wording for; anything else gets a generic message.
const ERRORS: Record<string, string> = {
  invalid_credentials: "E-Mail oder Passwort ist falsch.",
  email_not_confirmed: "Bitte bestätige zuerst deine E-Mail-Adresse.",
  over_request_rate_limit: "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
};
const authMessage = (error: AuthError) =>
  ERRORS[error.code ?? ""] ?? "Anmeldung fehlgeschlagen. Bitte versuche es erneut.";

/** Email + password login for the team. Accounts without a staff role are signed out again. */
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
    <main className="grid min-h-[100svh] bg-background md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso md:block">
        <img
          src={lounge.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-cream">
          <p className="eyebrow text-gold">Auréa Admin</p>
          <p className="mt-6 max-w-md font-serif text-5xl font-light leading-[1.05]">
            Reservierungen &amp;
            <br />
            <em>Speisekarte</em>
          </p>
        </div>
      </div>

      <div className="flex flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:px-16 md:py-12">
        <img
          src="/logo.svg"
          alt="Auréa"
          width={645}
          height={167}
          className="h-10 w-auto self-start"
        />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          <p className="eyebrow text-gold">Team-Bereich</p>
          <h1 className="mt-4 font-serif text-5xl font-light leading-none md:text-6xl">Anmelden</h1>
          <div className="my-8 h-px w-16 bg-gold" aria-hidden />

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

            <button
              disabled={loading}
              className="min-h-11 w-full bg-foreground py-5 text-[0.72rem] uppercase tracking-[0.28em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground disabled:opacity-60"
            >
              {loading ? "Einen Moment…" : "Anmelden"}
            </button>
          </form>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Zugänge vergibt ein Administrator. Passwort vergessen? Wende dich an ihn.
          </p>
        </div>
      </div>
    </main>
  );
}
