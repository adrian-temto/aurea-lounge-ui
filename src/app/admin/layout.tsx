import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";

import AdminShell from "@/components/admin/AdminShell";
import { displayName, requireDashboard } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/team";

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
      roleLabel={ROLE_LABEL[session.isOwner ? "owner" : "admin"]}
      permissions={session.permissions}
      isOwner={session.isOwner}
      newCount={count ?? 0}
      defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}
    >
      {children}
    </AdminShell>
  );
}
