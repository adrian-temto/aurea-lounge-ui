import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocalizedRoute,
  localizePath,
  splitLocale,
} from "@/i18n/config";
import { ADMIN_PATHS } from "@/lib/admin-host";

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const { locale, path } = splitLocale(pathname);

  // The team area (/login, /admin) is German only; /en/admin falls through to the redirect below.
  if (locale === DEFAULT_LOCALE && startsWithAny(path, ADMIN_PATHS)) return adminProxy(request);

  // English exists for the public pages only; /en/datenschutz, /en/admin … use the German page.
  if (locale !== DEFAULT_LOCALE && !isLocalizedRoute(path)) {
    return NextResponse.redirect(new URL(`${path}${search}`, request.url));
  }

  // Someone who picked English in the switcher gets it again on the plain URL (e.g. a QR code).
  if (
    locale === DEFAULT_LOCALE &&
    isLocalizedRoute(path) &&
    request.cookies.get(LOCALE_COOKIE)?.value === "en" &&
    request.method === "GET"
  ) {
    return NextResponse.redirect(new URL(localizePath("en", `${path}${search}`), request.url));
  }

  // Pages learn the language from this header; any value sent by the client is replaced.
  const respond = () => {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, locale);
    if (locale === DEFAULT_LOCALE) return NextResponse.next({ request: { headers } });
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url, { request: { headers } });
  };
  return respond();
}

/** /login and /admin: in German, with the Supabase session refreshed. */
async function adminProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const respond = () => {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
    return NextResponse.next({ request: { headers } });
  };
  let response = respond();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = respond();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session cookie when it is close to expiring.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && startsWithAny(pathname, ["/admin"])) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Everything except Next internals and files with an extension.
  matcher: ["/((?!_next/|.*\\.[a-z0-9]+$).*)"],
};
