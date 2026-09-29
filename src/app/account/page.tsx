import type { Metadata } from "next";
import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { canUseDashboard, displayName, requireUser } from "@/lib/auth";
import type { Reservation, ReservationStatus } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.accountTitle, robots: { index: false } };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const STATUS_CLS: Record<ReservationStatus, string> = {
  new: "bg-gold/20 text-foreground",
  confirmed: "bg-olive/15 text-olive",
  declined: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

type MyReservation = Pick<
  Reservation,
  | "id"
  | "reservation_date"
  | "reservation_time"
  | "guests"
  | "status"
  | "admin_response"
  | "responded_at"
>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const { locale, t } = await getI18n();
  const session = await requireUser(localizePath(locale, "/account"));
  const { user, profile, roles, supabase } = session;
  const { error } = await searchParams;

  const { data } = await supabase
    .from("reservations")
    .select("id, reservation_date, reservation_time, guests, status, admin_response, responded_at")
    .eq("user_id", user.id)
    .order("reservation_date", { ascending: false })
    .limit(20);
  const reservations = (data ?? []) as MyReservation[];

  const longDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(t.intl, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  const since = profile
    ? new Date(profile.created_at).toLocaleDateString(t.intl, { month: "long", year: "numeric" })
    : null;

  return (
    <main className="min-h-[100svh] bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-5 md:px-12">
          <Link href={localizePath(locale, "/")} aria-label={t.auth.homeAria}>
            <img src="/logo.svg" alt="Auréa" width={645} height={167} className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <LanguageSwitcher className="text-[0.7rem]" />
            <form action={signOut}>
              <button className="link-line text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground">
                {t.account.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 py-20 md:px-12 md:py-28">
        {error === "forbidden" && (
          <p className="mb-12 border-l-2 border-gold pl-4 text-sm">{t.account.forbidden}</p>
        )}
        <p className="eyebrow text-gold">{t.account.eyebrow}</p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-[1.02] md:text-7xl">
          {t.account.welcome}
          <br />
          <em>{displayName(session)}</em>
        </h1>
        <div className="my-12 flex items-center gap-3">
          <span className="h-px w-12 bg-gold" />
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
        </div>

        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <dl className="divide-y divide-border border-y border-border text-sm">
              {profile?.full_name && (
                <div className="flex justify-between gap-4 py-5">
                  <dt className="text-muted-foreground">{t.account.name}</dt>
                  <dd className="text-right">{profile.full_name}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-5">
                <dt className="text-muted-foreground">{t.account.email}</dt>
                <dd className="break-all text-right">{user.email}</dd>
              </div>
              {since && (
                <div className="flex justify-between gap-4 py-5">
                  <dt className="text-muted-foreground">{t.account.memberSince}</dt>
                  <dd>{since}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-5">
                <dt className="text-muted-foreground">{t.account.role}</dt>
                <dd>
                  {roles.length
                    ? roles.map((r) => t.account.roles[r]).join(", ")
                    : t.account.roles.guest}
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-col gap-3">
              <Link
                href={localizePath(locale, "/#reserve")}
                className="bg-foreground px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] text-background transition-colors duration-500 hover:bg-gold hover:text-foreground"
              >
                {t.account.reserve}
              </Link>
              {canUseDashboard(session) && (
                <Link
                  href="/admin"
                  className="border border-foreground px-8 py-4 text-center text-[0.7rem] uppercase tracking-[0.25em] transition-colors duration-500 hover:bg-foreground hover:text-background"
                >
                  {t.account.dashboard}
                </Link>
              )}
            </div>
          </div>

          <div className="md:col-span-7">
            <h2 className="font-serif text-4xl font-light">{t.account.reservations}</h2>
            {reservations.length === 0 ? (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {t.account.none}
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {reservations.map((r) => (
                  <li key={r.id} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="font-serif text-2xl">
                        {longDate(r.reservation_date)},{" "}
                        {t.reservation.atTime(r.reservation_time.slice(0, 5))}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[0.6rem] uppercase tracking-widest ${STATUS_CLS[r.status]}`}
                      >
                        {t.account.status[r.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.reservation.persons(r.guests)}
                    </p>
                    {r.admin_response && (
                      <div className="mt-4 border-l-2 border-gold bg-card px-4 py-3">
                        <p className="eyebrow text-gold">{t.account.message}</p>
                        {/* Written by staff, in German. */}
                        <p lang="de" className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                          {r.admin_response}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
