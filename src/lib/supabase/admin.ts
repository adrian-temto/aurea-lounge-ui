import { createClient } from "@supabase/supabase-js";

/**
 * Supabase with the secret key: bypasses RLS, so server code only, and only where a guest's
 * request needs a value they may not read themselves (the double opt-in token). Null until
 * SUPABASE_SECRET_KEY is set; callers then skip that step.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
