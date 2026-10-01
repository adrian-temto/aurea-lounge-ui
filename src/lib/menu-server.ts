import type { Locale } from "@/i18n/config";
import { buildPublicMenu } from "@/lib/menu";
import { createClient } from "@/lib/supabase/server";

/**
 * The public menu in one language. Visitors only receive published rows (RLS). `*` rather than
 * a column list keeps the menu working before the newer migrations run; buildPublicMenu fills in
 * the newer columns' defaults.
 */
export async function loadPublicMenu(locale: Locale) {
  const supabase = await createClient();
  const [cats, items] = await Promise.all([
    supabase.from("menu_categories").select("*"),
    supabase.from("menu_items").select("*"),
  ]);
  if (cats.error || items.error) console.error("menu load failed", cats.error ?? items.error);
  return buildPublicMenu(cats.data ?? [], items.data ?? [], locale);
}
