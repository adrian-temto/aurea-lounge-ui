"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarX2,
  Check,
  MailCheck,
  MessageSquareReply,
  MoreHorizontal,
  Phone,
  Search,
  ShieldX,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { deleteReservation, setReservationStatus } from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationStatus } from "@/lib/types";

import {
  FILTER_KEYS,
  byDateTime,
  guests,
  relativeDay,
  time,
  timeAgo,
  todayISO,
  type Filter,
} from "./format";
import { EraseGuestDialog, type EraseTarget } from "./EraseGuestDialog";
import { PageHeader } from "./PageHeader";
import { RespondDialog } from "./RespondDialog";
import { StatusBadge } from "./StatusBadge";

const FILTER_LABEL: Record<Filter, string> = {
  upcoming: "Kommend",
  today: "Heute",
  new: "Offen",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  cancelled: "Storniert",
  all: "Alle",
};

function matches(r: Reservation, filter: Filter, today: string) {
  switch (filter) {
    case "upcoming":
      return r.reservation_date >= today;
    case "today":
      return r.reservation_date === today;
    case "all":
      return true;
    default:
      return r.status === filter;
  }
}

type Props = { reservations: Reservation[]; initialFilter: Filter; openId: number | null };

export default function ReservationsView({ reservations, initialFilter, openId }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [query, setQuery] = useState("");
  const [responding, setResponding] = useState<Reservation | null>(
    () => reservations.find((r) => r.id === openId) ?? null,
  );
  const [erasing, setErasing] = useState<EraseTarget | null>(null);
  const [deleting, setDeleting] = useState<Reservation | null>(null);
  const [, startTransition] = useTransition();
  // Status changes show instantly; the server refresh (or the realtime event) confirms them.
  const [list, setOptimistic] = useOptimistic(
    reservations,
    (rs, { id, status }: { id: number; status: ReservationStatus }) =>
      rs.map((r) => (r.id === id ? { ...r, status } : r)),
  );
  const today = todayISO();

  // Keep the filter in the URL so it survives reloads and can be shared; no server round trip.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter === "upcoming") url.searchParams.delete("status");
    else url.searchParams.set("status", filter);
    url.searchParams.delete("open");
    window.history.replaceState(null, "", url);
  }, [filter]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      list
        .filter((r) => matches(r, filter, today))
        .filter(
          (r) =>
            !q ||
            r.name.toLowerCase().includes(q) ||
            !!r.email?.includes(q) ||
            !!r.phone?.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
        )
        .sort(byDateTime),
    [list, filter, today, q],
  );

  // Group rows by day so a service can be read at a glance.
  const days = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of visible)
      map.set(r.reservation_date, [...(map.get(r.reservation_date) ?? []), r]);
    return [...map];
  }, [visible]);

  function changeStatus(r: Reservation, status: ReservationStatus, success: string) {
    startTransition(async () => {
      setOptimistic({ id: r.id, status });
      const res = await setReservationStatus(r.id, status);
      if (res.error) toast.error(res.error);
      else
        toast.success(success, {
          description: `${r.name} · ${relativeDay(r.reservation_date, today)}, ${time(r)} Uhr`,
        });
      router.refresh();
    });
  }

  function remove(r: Reservation) {
    startTransition(async () => {
      const res = await deleteReservation(r.id);
      if (res.error) toast.error(res.error);
      else toast.success("Reservierung gelöscht", { description: r.name });
      router.refresh();
    });
  }

  const actions = {
    onRespond: setResponding,
    onStatus: changeStatus,
    onDelete: setDeleting,
    onErase: (r: Reservation) => setErasing({ email: r.email ?? "", phone: r.phone ?? "", name: r.name }),
  };

  const openCount = list.filter((r) => r.status === "new").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Reservierungen"
        description={
          openCount === 0
            ? "Alle Anfragen sind beantwortet."
            : `${openCount} ${openCount === 1 ? "Anfrage wartet" : "Anfragen warten"} auf eine Antwort.`
        }
        actions={
          <Button variant="outline" className="h-9" onClick={() => setErasing({ email: "", phone: "" })}>
            <ShieldX aria-hidden /> Datenlöschung
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Reservierungen filtern"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0"
        >
          {FILTER_KEYS.map((f) => {
            const count = list.filter((r) => matches(r, f, today)).length;
            const active = filter === f;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {FILTER_LABEL[f]}
                <span
                  className={cn(
                    "rounded px-1.5 text-xs tabular-nums",
                    active ? "bg-background/20" : "bg-muted",
                    f === "new" && count > 0 && !active && "bg-gold/30 text-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name oder Telefon suchen"
            aria-label="Reservierungen durchsuchen"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {days.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
          <CalendarX2 className="size-10 text-muted-foreground/60" aria-hidden />
          <p className="mt-4 text-lg font-semibold">
            {q ? "Keine Treffer" : "Keine Reservierungen"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {q
              ? `Niemand passt zu „${query.trim()}“.`
              : "Neue Anfragen von der Website erscheinen hier automatisch."}
          </p>
          {(q || filter !== "all") && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Alle anzeigen
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {days.map(([day, rows]) => {
            const people = rows
              .filter((r) => r.status !== "declined" && r.status !== "cancelled")
              .reduce((n, r) => n + r.guests, 0);
            return (
              <section key={day} aria-labelledby={`day-${day}`}>
                <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
                  <h2 id={`day-${day}`} className="text-sm font-semibold">
                    {relativeDay(day, today)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {rows.length} {rows.length === 1 ? "Tisch" : "Tische"} · {people} Gäste
                  </p>
                </div>

                {/* Desktop: table */}
                <div className="hidden overflow-hidden rounded-lg border border-border bg-card/40 md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                      <tr>
                        <th scope="col" className="w-20 px-4 py-2.5 font-medium">
                          Zeit
                        </th>
                        <th scope="col" className="px-4 py-2.5 font-medium">
                          Gast
                        </th>
                        <th scope="col" className="w-28 px-4 py-2.5 font-medium">
                          Personen
                        </th>
                        <th scope="col" className="w-32 px-4 py-2.5 font-medium">
                          Status
                        </th>
                        <th scope="col" className="w-28 px-4 py-2.5 font-medium">
                          Eingang
                        </th>
                        <th scope="col" className="w-56 px-4 py-2.5 text-right font-medium">
                          <span className="sr-only">Aktionen</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className={cn(
                            "align-top transition-colors duration-150 hover:bg-muted/40",
                            r.status === "new" && "bg-gold/[0.06]",
                          )}
                        >
                          <td className="px-4 py-3 text-base font-semibold tabular-nums">
                            {time(r)}
                          </td>
                          <td className="px-4 py-3">
                            <GuestCell r={r} />
                          </td>
                          <td className="px-4 py-3 tabular-nums">{guests(r.guests)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td
                            className="px-4 py-3 text-xs text-muted-foreground"
                            title={new Date(r.created_at).toLocaleString("de-DE")}
                          >
                            {timeAgo(r.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <RowActions r={r} {...actions} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <ul className="space-y-2 md:hidden">
                  {rows.map((r) => (
                    <li
                      key={r.id}
                      className={cn(
                        "rounded-lg border border-border bg-card/40 p-4",
                        r.status === "new" && "border-gold/60 bg-gold/[0.06]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-semibold tabular-nums">{time(r)}</span>
                          <span className="text-sm text-muted-foreground">{guests(r.guests)}</span>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-2">
                        <GuestCell r={r} />
                      </div>
                      <div className="mt-4 border-t border-border pt-3">
                        <RowActions r={r} {...actions} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <RespondDialog
        reservation={responding}
        onOpenChange={(open) => !open && setResponding(null)}
        onSaved={() => router.refresh()}
      />
      <EraseGuestDialog
        target={erasing}
        onOpenChange={(open) => !open && setErasing(null)}
        onErased={() => router.refresh()}
      />
      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reservierung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting &&
                `${deleting.name}, ${relativeDay(deleting.reservation_date, today)} um ${time(deleting)} Uhr. `}
              Die Reservierung wird endgültig gelöscht. Der Gast wird nicht benachrichtigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && remove(deleting)}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function GuestCell({ r }: { r: Reservation }) {
  return (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-2 font-medium">
        {r.name}
        {r.locale === "en" && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] font-normal text-muted-foreground" title="Hat auf Englisch gebucht; E-Mails gehen auf Englisch raus">
            EN
          </span>
        )}
      </p>
      {r.phone && (
        <a
          href={`tel:${r.phone}`}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {r.phone}
        </a>
      )}
      {r.email && (
        <a
          href={`mailto:${r.email}`}
          className="block truncate text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {r.email}
        </a>
      )}
      {r.marketing_email && (
        <p className="mt-1 text-xs text-muted-foreground">
          {r.marketing_email_confirmed_at
            ? "Angebote per E-Mail: bestätigt"
            : "Angebote per E-Mail: angefragt, noch nicht bestätigt (nicht anschreiben)"}
        </p>
      )}
      {r.special_requests && (
        <p className="mt-1.5 line-clamp-2 text-sm italic text-muted-foreground">
          „{r.special_requests}“
        </p>
      )}
      {r.admin_response && (
        <p className="mt-1.5 line-clamp-1 border-l-2 border-gold pl-2 text-xs text-muted-foreground">
          Antwort: {r.admin_response}
        </p>
      )}
      {r.response_emailed_at && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-olive" title={new Date(r.response_emailed_at).toLocaleString("de-DE")}>
          <MailCheck className="size-3.5" aria-hidden /> Antwort per E-Mail gesendet
        </p>
      )}
    </div>
  );
}

function RowActions({
  r,
  onRespond,
  onStatus,
  onDelete,
  onErase,
}: {
  r: Reservation;
  onRespond: (r: Reservation) => void;
  onStatus: (r: Reservation, s: ReservationStatus, success: string) => void;
  onDelete: (r: Reservation) => void;
  onErase: (r: Reservation) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {r.status === "new" && (
        // Opens the answer with the confirmation text ready, so the guest gets it by email.
        <Button size="sm" variant="outline" onClick={() => onRespond(r)} className="h-9">
          <Check aria-hidden /> Bestätigen
        </Button>
      )}
      <Button size="sm" onClick={() => onRespond(r)} className="h-9">
        <MessageSquareReply aria-hidden />
        {r.admin_response ? "Antwort ändern" : "Antworten"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-9"
            aria-label={`Weitere Aktionen für ${r.name}`}
          >
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {r.phone && (
            <>
              <DropdownMenuItem asChild>
                <a href={`tel:${r.phone}`}>
                  <Phone aria-hidden /> Anrufen
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Nur Status ändern (ohne E-Mail)
          </DropdownMenuLabel>
          {r.status !== "confirmed" && (
            <DropdownMenuItem onSelect={() => onStatus(r, "confirmed", "Reservierung bestätigt")}>
              <Check aria-hidden /> Als bestätigt markieren
            </DropdownMenuItem>
          )}
          {r.status !== "new" && (
            <DropdownMenuItem onSelect={() => onStatus(r, "new", "Wieder als offen markiert")}>
              <MessageSquareReply aria-hidden /> Wieder öffnen
            </DropdownMenuItem>
          )}
          {r.status !== "cancelled" && (
            <DropdownMenuItem
              onSelect={() => onStatus(r, "cancelled", "Reservierung storniert")}
              className="text-destructive focus:text-destructive"
            >
              <X aria-hidden /> Stornieren
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onDelete(r)} className="text-destructive focus:text-destructive">
            <Trash2 aria-hidden /> Reservierung löschen
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onErase(r)} className="text-destructive focus:text-destructive">
            <ShieldX aria-hidden /> Alle Daten des Gastes löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
