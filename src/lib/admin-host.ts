/**
 * The dashboard and its login live on the public site itself: /login and /admin (German only).
 * proxy.ts keeps the Supabase session fresh there and sends signed-out visitors to /login.
 */

/** Paths of the team area. */
export const ADMIN_PATHS = ["/admin", "/login"];

/** Absolute site address, for links in notification emails. */
export const ADMIN_URL = (process.env.ADMIN_URL ?? "https://www.aurealounge.de").replace(/\/$/, "");
