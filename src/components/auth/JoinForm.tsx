"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import lounge from "@/assets/lounge.jpg";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/client";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";

const inputCls =
  "mt-3 w-full border-0 border-b border-border bg-transparent pb-3 text-base outline-none transition-colors duration-500 placeholder:text-muted-foreground/50 focus:border-gold";

export default function JoinForm({
  initialMode,
  next,
  notice,
}: {
  initialMode: Mode;
  next: string | null;
  notice: string | null;
}) {
  const router = useRouter();
  const { t, href } = useI18n();
  const home = href("/account");
  // Supabase error codes we have wording for; anything else gets a generic message.
  const authMessage = (error: AuthError) =>
    t.auth.errors[error.code ?? ""] ?? t.auth.errors["unknown"] ?? error.message;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password"));
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: String(fd.get("full_name")).trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? home)}`,
        },
      });
      setLoading(false);
      if (error) return setError(authMessage(error));
      // No session means email confirmation is on: the user has to click the link first.
      if (!data.session) return setSentTo(email);
      router.replace(next ?? home);
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return setError(authMessage(error));
    }
    // Staff (any permission) land on the dashboard, guests on their account page.
    const { data: permissions } = await supabase.rpc("my_permissions");
    const isStaff = Array.isArray(permissions) && permissions.length > 0;
    router.replace(next ?? (isStaff ? "/admin" : home));
    router.refresh();
  }

  function switchTo(m: Mode) {
    setMode(m);
    setError(null);
  }

  return (
    <main className="grid min-h-[100svh] bg-background md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-espresso md:block">
        <img
          src={lounge.src}
          alt={t.auth.imageAlt}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-cream">
          <p className="eyebrow text-gold">{t.auth.eyebrow}</p>
          <p className="mt-6 max-w-md font-serif text-5xl font-light leading-[1.05]">
            {t.auth.imageTitle}
            <br />
            <em>{t.auth.imageTitleEm}</em>
          </p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 md:px-16 md:py-12">
        <div className="flex items-center justify-between gap-6">
          <Link href={href("/")} aria-label={t.auth.homeAria} className="block w-fit">
            <img src="/logo.svg" alt="Auréa" width={645} height={167} className="h-10 w-auto" />
          </Link>
          <LanguageSwitcher className="text-[0.72rem]" />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-16">
          {sentTo ? (
            <div>
              <p className="eyebrow text-gold">{t.auth.checkInboxEyebrow}</p>
              <h1 className="mt-4 font-serif text-5xl font-light leading-none">
                {t.auth.checkInboxTitle}
              </h1>
              <div className="my-8 h-px w-16 bg-gold" />
              <p className="leading-relaxed text-muted-foreground">
                <span>{t.auth.checkInboxText(sentTo)[0]}</span>
                <span className="text-foreground">{sentTo}</span>
                <span>{t.auth.checkInboxText(sentTo)[2]}</span>
              </p>
              <button
                onClick={() => {
                  setSentTo(null);
                  switchTo("login");
                }}
                className="link-line mt-10 text-[0.72rem] uppercase tracking-[0.22em]"
              >
                {t.auth.toLogin}
              </button>
            </div>
          ) : (
            <>
              <p className="eyebrow text-gold">{t.auth.eyebrow}</p>
              <h1 className="mt-4 font-serif text-5xl font-light leading-none md:text-6xl">
                {mode === "signup" ? (
                  <span key="signup">
                    {t.auth.signupTitle} <em>{t.auth.signupTitleEm}</em>
                  </span>
                ) : (
                  <span key="login">
                    {t.auth.loginTitle} <em>{t.auth.loginTitleEm}</em>
                  </span>
                )}
              </h1>

              <div className="mt-10 flex gap-8 border-b border-border">
                {(
                  [
                    ["login", t.auth.tabs.login],
                    ["signup", t.auth.tabs.signup],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchTo(m)}
                    className={`relative pb-4 text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-500 ${
                      mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`absolute inset-x-0 -bottom-px h-px bg-gold transition-transform duration-700 ${mode === m ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </button>
                ))}
              </div>

              {notice && t.auth.notices[notice] && (
                <p className="mt-8 border-l-2 border-gold pl-4 text-sm">{t.auth.notices[notice]}</p>
              )}

              <form onSubmit={onSubmit} className="mt-10 space-y-8">
                {mode === "signup" && (
                  <label className="block">
                    <span className="eyebrow text-muted-foreground">{t.auth.name}</span>
                    <input
                      name="full_name"
                      required
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      placeholder={t.auth.namePlaceholder}
                      className={inputCls}
                    />
                  </label>
                )}
                <label className="block">
                  <span className="eyebrow text-muted-foreground">{t.auth.email}</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t.auth.emailPlaceholder}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-muted-foreground">{t.auth.password}</span>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder={mode === "signup" ? t.auth.passwordPlaceholder : ""}
                    className={inputCls}
                  />
                </label>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  disabled={loading}
                  className="w-full bg-foreground py-5 text-[0.72rem] uppercase tracking-[0.28em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground disabled:opacity-60"
                >
                  <span>{loading ? t.auth.wait : mode === "signup" ? t.auth.submitSignup : t.auth.submitLogin}</span>
                </button>
              </form>

              <p className="mt-8 text-sm text-muted-foreground">
                <span>{mode === "signup" ? t.auth.haveAccount : t.auth.noAccount}</span>{" "}
                <button
                  type="button"
                  onClick={() => switchTo(mode === "signup" ? "login" : "signup")}
                  className="link-line text-foreground"
                >
                  <span>{mode === "signup" ? t.auth.tabs.login : t.auth.tabs.signup}</span>
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
