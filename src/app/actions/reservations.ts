"use server";

import { z } from "zod";

import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { CONTACT, MAX_ONLINE_GUESTS, SEATING, todayInBerlin } from "@/lib/reservation";
import { createClient } from "@/lib/supabase/server";

/** Same rules in every language; only the messages follow the visitor's language. */
const schemaFor = (e: Dictionary["reservation"]["errors"]) =>
  z.object({
    name: z.string().trim().min(2, e.name).max(100),
    phone: z.string().trim().min(5, e.phone).max(30),
    email: z.string().trim().toLowerCase().email(e.email).max(254),
    // Checkboxes send "on" when ticked and nothing otherwise.
    terms: z.literal("on", { errorMap: () => ({ message: e.terms }) }),
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
  const t = getDictionary(isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE).reservation;

  const parsed = schemaFor(t.errors).safeParse(fields);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? t.errors.invalid };
  }

  const { date, time, seating, special_requests, terms, marketing_email, marketing_sms, ...rest } =
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
  // Signed-in guests get the booking linked to their account so they can see the response there.
  const { data: auth } = await supabase.auth.getClaims();
  const { error } = await supabase.from("reservations").insert({
    ...rest,
    reservation_date: date,
    reservation_time: time,
    special_requests: notes || null,
    terms_accepted_at: terms ? new Date().toISOString() : null,
    marketing_email: !!marketing_email,
    marketing_sms: !!marketing_sms,
    user_id: auth?.claims.sub ?? null,
  });

  if (error) {
    console.error("reservation insert failed", error);
    return { ok: false, message: t.errors.failed(CONTACT.phone) };
  }
  return { ok: true, message: t.success };
}
