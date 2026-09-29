import { redirect } from "next/navigation";

import MenuView from "@/components/admin/MenuView";
import { requireDashboard } from "@/lib/auth";
import { normalizeCategories, normalizeItems } from "@/lib/menu";

export const metadata = { title: "Speisekarte — Auréa Admin" };

export default async function MenuPage() {
  const session = await requireDashboard();
  if (!session.permissions.includes("menu.manage")) redirect("/admin");

  // menu.manage sees every row, published or not (RLS "for all" policy).
  const [cats, items] = await Promise.all([
    session.supabase.from("menu_categories").select("*").order("sort_order"),
    session.supabase.from("menu_items").select("*").order("sort_order"),
  ]);

  return (
    <MenuView
      categories={normalizeCategories(cats.data ?? [])}
      items={normalizeItems(items.data ?? [])}
    />
  );
}
