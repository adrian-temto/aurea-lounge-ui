/**
 * The dashboard and its login live on their own subdomain of the same site, e.g.
 * admin.aurealounge.de next to aurealounge.de: one app, one deployment, one DNS zone.
 * proxy.ts serves /admin and /login only there and answers 404 for them on the public site.
 *
 * A host counts as the admin host when it starts with "admin." (admin.aurealounge.de,
 * admin.localhost:3000 in development) or equals ADMIN_HOST.
 */
export function isAdminHost(host: string | null | undefined) {
  const name = (host ?? "").toLowerCase().replace(/:\d+$/, "");
  if (!name) return false;
  const configured = process.env.ADMIN_HOST?.toLowerCase();
  return name.startsWith("admin.") || (!!configured && name === configured);
}

/** Paths that exist only on the admin host. */
export const ADMIN_PATHS = ["/admin", "/login"];

/** Absolute dashboard address, for links in notification emails. */
export const ADMIN_URL = (process.env.ADMIN_URL ?? "https://admin.aurealounge.de").replace(
  /\/$/,
  "",
);
