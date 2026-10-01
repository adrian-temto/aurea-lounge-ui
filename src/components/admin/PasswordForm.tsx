"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { setOwnPassword } from "@/app/login/passwort/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/team";

import { authButtonCls, authInputCls } from "./AuthFrame";

/** Replaces the temporary password; the dashboard opens right after. */
export default function PasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await setOwnPassword(String(fd.get("password")), String(fd.get("repeat")));
      if (res.error) return setError(res.error);
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <>
      <p className="leading-relaxed text-muted-foreground">
        Das Passwort aus der E-Mail gilt nur für die erste Anmeldung. Lege jetzt dein eigenes fest,
        mindestens {MIN_PASSWORD_LENGTH} Zeichen.
      </p>
      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        {/* Lets password managers store the new password under the right account. */}
        <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
        <label className="block">
          <span className="eyebrow text-muted-foreground">Neues Passwort</span>
          <span className="relative block">
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              className={`${authInputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
              aria-pressed={show}
              className="absolute bottom-1 right-0 grid size-11 place-items-center text-muted-foreground hover:text-foreground"
            >
              {show ? (
                <EyeOff className="size-5" aria-hidden />
              ) : (
                <Eye className="size-5" aria-hidden />
              )}
            </button>
          </span>
        </label>
        <label className="block">
          <span className="eyebrow text-muted-foreground">Passwort wiederholen</span>
          <input
            name="repeat"
            type={show ? "text" : "password"}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className={authInputCls}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button disabled={pending} className={authButtonCls}>
          {pending ? "Einen Moment…" : "Speichern und weiter"}
        </button>
      </form>
    </>
  );
}
