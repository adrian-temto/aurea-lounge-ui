import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";

import AdminShell from "@/components/admin/AdminShell";
import { displayName, requireDashboard } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin — Auréa", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireDashboard();
  const canReservations = session.permissions.includes("reservations.manage");

  const [{ count }, cookieStore] = await Promise.all([
    canReservations
      ? session.supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("status", "new")
      : Promise.resolve({ count: 0 }),
    cookies(),
  ]);

  return (
    <AdminShell
      name={displayName(session)}
      email={session.user.email}
      roleLabel={session.roles.includes("admin") ? "Administrator" : "Team"}
      permissions={session.permissions}
      newCount={count ?? 0}
      defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}
    >
      {children}
    </AdminShell>
  );
}
