import type { Locale } from "@/i18n/config";
import type { Session } from "@/lib/auth";
import { buildPublicMenu } from "@/lib/menu";

/**
 * The public menu in one language. Visitors only receive published rows (RLS); staff get
 * everything, which buildPublicMenu filters so they see what guests see. `*` rather than a
 * column list keeps the menu working before the newer migrations run; buildPublicMenu fills in
 * the newer columns' defaults.
 */
export async function loadPublicMenu(session: Session, locale: Locale) {
  const [cats, items] = await Promise.all([
    session.supabase.from("menu_categories").select("*"),
    session.supabase.from("menu_items").select("*"),
  ]);
  if (cats.error || items.error) console.error("menu load failed", cats.error ?? items.error);
  return buildPublicMenu(cats.data ?? [], items.data ?? [], locale);
}
