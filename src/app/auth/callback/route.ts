import { NextResponse, type NextRequest } from "next/server";

import { localizePath, splitLocale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

// The sign-up confirmation email links here with a one-time ?code=.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  // Send people back in the language they signed up in (next is /en/… on the English site).
  const join = localizePath(splitLocale(safeNext).locale, "/login");
  if (!code) return NextResponse.redirect(`${origin}${join}?mode=login&notice=link-invalid`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // The email is already confirmed at this point; the code exchange only fails when the
    // link is opened in a different browser than the one used to sign up.
    return NextResponse.redirect(`${origin}${join}?mode=login&notice=confirmed`);
  }
  return NextResponse.redirect(`${origin}${safeNext}`);
}
