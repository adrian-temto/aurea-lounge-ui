import { redirect } from "next/navigation";

import ReservationsView from "@/components/admin/ReservationsView";
import { FILTER_KEYS, addDays, todayISO, type Filter } from "@/components/admin/format";
import { requireDashboard } from "@/lib/auth";
import type { Reservation } from "@/lib/types";

export const metadata = { title: "Reservierungen — Auréa Admin" };

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; open?: string }>;
}) {
  const session = await requireDashboard();
  if (!session.permissions.includes("reservations.manage")) redirect("/admin");

  const params = await searchParams;
  const filter = (FILTER_KEYS as readonly string[]).includes(params.status ?? "")
    ? (params.status as Filter)
    : "upcoming";

  // The last 30 days plus everything ahead; older history isn't needed day to day.
  const { data, error } = await session.supabase
    .from("reservations")
    .select("*")
    .gte("reservation_date", addDays(todayISO(), -30))
    .order("reservation_date")
    .order("reservation_time");
  if (error) console.error("reservations load failed", error);

  return (
    <ReservationsView
      reservations={(data ?? []) as Reservation[]}
      initialFilter={filter}
      openId={Number(params.open) || null}
    />
  );
}
