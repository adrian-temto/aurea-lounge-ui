import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Inbox,
  Plus,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  addDays,
  byDateTime,
  guests,
  relativeDay,
  time,
  timeAgo,
  todayISO,
} from "@/components/admin/format";
import { Button } from "@/components/ui/button";
import { displayName, requireDashboard } from "@/lib/auth";
import type { Reservation } from "@/lib/types";

/** Greeting by the café's local time, computed on the server so it doesn't flicker on hydration. */
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
  );
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

const active = (r: Reservation) => r.status === "new" || r.status === "confirmed";

export default async function AdminOverview() {
  const session = await requireDashboard();
  const { supabase, permissions } = session;
  const canRes = permissions.includes("reservations.manage");
  const canMenu = permissions.includes("menu.manage");
  const today = todayISO();

  const [res, items] = await Promise.all([
    canRes
      ? supabase
          .from("reservations")
          .select("*")
          .gte("reservation_date", today)
          .lte("reservation_date", addDays(today, 6))
      : Promise.resolve({ data: [] }),
    canMenu ? supabase.from("menu_items").select("id, is_visible") : Promise.resolve({ data: [] }),
  ]);

  const week = ((res.data ?? []) as Reservation[]).sort(byDateTime);
  const todays = week.filter((r) => r.reservation_date === today && active(r));
  const open = week.filter((r) => r.status === "new");
  const weekActive = week.filter(active);
  const menu = (items.data ?? []) as { id: number; is_visible: boolean }[];
  const sum = (rs: Reservation[]) => rs.reduce((n, r) => n + r.guests, 0);
  const dateLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={
          <>
            {greeting()}, <em>{displayName(session)}</em>
          </>
        }
        description={dateLabel}
        actions={
          <>
            {canMenu && (
              <Button asChild variant="outline" className="h-10">
                <Link href="/admin/menu">
                  <Plus aria-hidden /> Gericht
                </Link>
              </Button>
            )}
            {canRes && (
              <Button asChild className="h-10">
                <Link href="/admin/reservations">
                  Reservierungen <ArrowRight aria-hidden />
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {canRes && (
          <>
            <Stat
              href="/admin/reservations?status=new"
              Icon={Inbox}
              label="Offene Anfragen"
              value={open.length}
              hint={open.length ? "warten auf Antwort" : "alles beantwortet"}
              highlight={open.length > 0}
            />
            <Stat
              href="/admin/reservations?status=today"
              Icon={CalendarClock}
              label="Heute"
              value={todays.length}
              hint={`${sum(todays)} Gäste erwartet`}
            />
            <Stat
              href="/admin/reservations"
              Icon={CalendarDays}
              label="Nächste 7 Tage"
              value={weekActive.length}
              hint={`${sum(weekActive)} Gäste`}
            />
          </>
        )}
        {canMenu && (
          <Stat
            href="/admin/menu"
            Icon={UtensilsCrossed}
            label="Speisekarte"
            value={menu.filter((i) => i.is_visible).length}
            hint={`sichtbar · ${menu.filter((i) => !i.is_visible).length} ausgeblendet`}
          />
        )}
      </div>

      {canRes && (
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <Panel
            className="lg:col-span-3"
            title="Heute"
            href="/admin/reservations?status=today"
            empty="Heute stehen keine Reservierungen an."
          >
            {todays.length > 0 && (
              <ol className="divide-y divide-border">
                {todays.map((r) => (
                  <li key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-14 text-base font-semibold tabular-nums">{time(r)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.name}</span>
                      {r.special_requests && (
                        <span className="block truncate text-xs italic text-muted-foreground">
                          „{r.special_requests}“
                        </span>
                      )}
                    </span>
                    <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
                      {guests(r.guests)}
                    </span>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel
            className="lg:col-span-2"
            title="Wartet auf Antwort"
            href="/admin/reservations?status=new"
            empty="Keine offenen Anfragen."
          >
            {open.length > 0 && (
              <ul className="divide-y divide-border">
                {open.slice(0, 6).map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/admin/reservations?status=new&open=${r.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                    >
                      <span className="size-2 shrink-0 rounded-full bg-gold" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{r.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {relativeDay(r.reservation_date, today)}, {time(r)} · {guests(r.guests)}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(r.created_at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function Stat({
  href,
  Icon,
  label,
  value,
  hint,
  highlight,
}: {
  href: string;
  Icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-lg border p-4 transition-colors duration-200 hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5 ${
        highlight ? "border-gold/60 bg-gold/10" : "border-border bg-card/40"
      }`}
    >
      <span className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="mt-3 block text-3xl font-semibold tabular-nums leading-none tracking-tight md:text-4xl">
        {value}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{hint}</span>
    </Link>
  );
}

function Panel({
  title,
  href,
  empty,
  className,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-border bg-card/40 ${className ?? ""}`}
      aria-labelledby={`panel-${href}`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id={`panel-${href}`} className="text-sm font-semibold">
          {title}
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Alle <ArrowRight className="size-3" aria-hidden />
        </Link>
      </div>
      {children || <p className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
