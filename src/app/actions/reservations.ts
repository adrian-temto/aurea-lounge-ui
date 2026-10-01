"use server";

import { after } from "next/server";
import { z } from "zod";

import { DEFAULT_LOCALE, SITE_URL, isLocale, localizePath, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { replyToAddress, sendEmail, staffInboxes } from "@/lib/email/send";
import {
  guestPendingEmail,
  marketingConfirmEmail,
  staffNewReservationEmail,
  type Booking,
} from "@/lib/email/templates";
import { CONTACT, MAX_ONLINE_GUESTS, SEATING, todayInBerlin } from "@/lib/reservation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Same rules in every language; only the messages follow the visitor's language. */
const schemaFor = (e: Dictionary["reservation"]["errors"]) =>
  z.object({
    name: z.string().trim().min(2, e.name).max(100),
    phone: z.string().trim().min(5, e.phone).max(30),
    email: z.string().trim().toLowerCase().email(e.email).max(254),
    // Checkboxes send "on" when ticked and nothing otherwise.
    marketing_email: z.literal("on").optional(),
    marketing_sms: z.literal("on").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, e.date),
    time: z.string().regex(/^\d{2}:\d{2}$/, e.time),
    guests: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_ONLINE_GUESTS, e.tooMany(MAX_ONLINE_GUESTS, CONTACT.phone)),
    seating: z.enum(SEATING.map((s) => s.value) as [string, ...string[]]).optional(),
    special_requests: z.string().trim().max(500).optional(),
  });

export type ReservationState = { ok: boolean; message: string } | null;

export async function createReservation(
  _prev: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const { locale: rawLocale, ...fields } = Object.fromEntries(formData);
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = getDictionary(locale).reservation;

  const parsed = schemaFor(t.errors).safeParse(fields);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? t.errors.invalid };
  }

  const { date, time, seating, special_requests, marketing_email, marketing_sms, ...rest } =
    parsed.data;
  if (date < todayInBerlin()) {
    return { ok: false, message: t.errors.past };
  }

  // There's no seating column; the wish travels with the notes the team already reads (German).
  const seatingLabel =
    seating && seating !== "any" ? SEATING.find((s) => s.value === seating)?.label : null;
  const notes = [seatingLabel && `Sitzwunsch: ${seatingLabel}`, special_requests]
    .filter(Boolean)
    .join("\n");

  const supabase = await createClient();
  const { error } = await supabase.from("reservations").insert({
    ...rest,
    reservation_date: date,
    reservation_time: time,
    special_requests: notes || null,
    marketing_email: !!marketing_email,
    marketing_sms: !!marketing_sms,
    locale,
  });

  if (error) {
    console.error("reservation insert failed", error);
    return { ok: false, message: t.errors.failed(CONTACT.phone) };
  }

  // The guest hears that the request is pending, the team that one is waiting. Sent after the
  // response, so a slow or failing mail service never delays or breaks the booking itself.
  const booking: Booking = {
    name: rest.name,
    phone: rest.phone,
    email: rest.email,
    date,
    time,
    guests: rest.guests,
    notes: notes || null,
    locale,
  };
  after(async () => {
    const team = staffInboxes();
    const results = await Promise.all([
      sendEmail({ ...guestPendingEmail({ ...booking, email: rest.email }), replyTo: replyToAddress() }),
      team.length ? sendEmail(staffNewReservationEmail(booking, team)) : null,
      marketing_email ? requestMarketingConfirmation(rest.name, rest.email, locale) : null,
    ]);
    for (const r of results) if (r && !r.ok) console.error("reservation email failed:", r.error);
  });
  return { ok: true, message: t.success };
}

/**
 * Double opt-in for offers by email: the database made a token for the new reservation (guests
 * can't read it), the secret-key client fetches it and the guest gets a confirmation link.
 * Guests who already confirmed with this address aren't asked again.
 */
async function requestMarketingConfirmation(name: string, email: string, locale: Locale) {
  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: "SUPABASE_SECRET_KEY fehlt: keine Opt-in-E-Mail." };

  const { count } = await admin
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .not("marketing_email_confirmed_at", "is", null);
  if (count) return null;

  const { data, error } = await admin
    .from("reservations")
    .select("marketing_token")
    .eq("email", email)
    .not("marketing_token", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ marketing_token: string }>();
  if (error || !data) return { ok: false as const, error: error?.message ?? "Kein Opt-in-Token gefunden." };

  const link = `${SITE_URL}${localizePath(locale, "/angebote/bestaetigen")}?token=${data.marketing_token}`;
  return sendEmail({ ...marketingConfirmEmail({ name, email, locale }, link), replyTo: replyToAddress() });
}
