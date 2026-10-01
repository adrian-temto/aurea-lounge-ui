"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { replyToAddress, sendEmail } from "@/lib/email/send";
import { guestResponseEmail } from "@/lib/email/templates";
import { ALLERGEN_KEYS, IMAGE_PATH, MENU_BUCKET } from "@/lib/menu";
import type { Permission, Reservation, ReservationStatus } from "@/lib/types";

type Result = { error?: string };

const FORBIDDEN: Result = { error: "Dafür fehlt dir die Berechtigung." };

/** RLS enforces the same permissions in the database; this gives a clear error first. */
async function authorize(permission: Permission) {
  const session = await getSession();
  if (!session.user || !session.permissions.includes(permission)) return null;
  return { supabase: session.supabase, userId: session.user.id };
}

function done(error: { message: string; code?: string } | null): Result {
  // 23505: the only unique rule is category names among siblings.
  if (error?.code === "23505")
    return { error: "Eine Kategorie mit diesem Namen gibt es hier schon." };
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  return {};
}

const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? "Ungültige Eingabe.";
const idSchema = z.number().int().positive();

/* ---------------- Menu (menu.manage) ---------------- */

type Supabase = NonNullable<Awaited<ReturnType<typeof authorize>>>["supabase"];

/** Best effort: a leftover file costs storage, not correctness, so failures are only logged. */
async function removeImages(supabase: Supabase, paths: (string | null | undefined)[]) {
  const clean = paths.filter((p): p is string => !!p && IMAGE_PATH.test(p));
  if (!clean.length) return;
  const { error } = await supabase.storage.from(MENU_BUCKET).remove(clean);
  if (error) console.error("menu image cleanup failed", error);
}

/** Optional English text: blank means "not translated", stored as null so the site falls back to German. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Höchstens ${max} Zeichen.`)
    .nullable()
    .transform((v) => v || null);

export type CategoryInput = {
  name: string;
  name_en: string | null;
  parent_id: number | null;
  is_published: boolean;
};

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name fehlt.").max(60, "Höchstens 60 Zeichen."),
  name_en: optionalText(60),
  parent_id: idSchema.nullable(),
  is_published: z.boolean(),
});

export async function saveCategory(id: number | null, input: CategoryInput): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const data = parsed.data;

  // The database trigger enforces one level too; these give a readable message first.
  if (data.parent_id !== null) {
    if (data.parent_id === id) return { error: "Eine Kategorie kann nicht in sich selbst liegen." };
    const { data: parent } = await auth.supabase
      .from("menu_categories")
      .select("parent_id")
      .eq("id", data.parent_id)
      .maybeSingle<{ parent_id: number | null }>();
    if (!parent) return { error: "Die übergeordnete Kategorie gibt es nicht mehr." };
    if (parent.parent_id !== null)
      return { error: "Unterkategorien können keine eigenen Unterkategorien haben." };
    if (id) {
      const { count } = await auth.supabase
        .from("menu_categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", id);
      if (count) return { error: "Diese Kategorie hat Unterkategorien und bleibt deshalb oben." };
    }
  }

  if (id) {
    const { error } = await auth.supabase.from("menu_categories").update(data).eq("id", id);
    return done(error);
  }
  const siblings = auth.supabase.from("menu_categories").select("sort_order");
  const { data: last } = await (
    data.parent_id === null
      ? siblings.is("parent_id", null)
      : siblings.eq("parent_id", data.parent_id)
  )
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  const { error } = await auth.supabase
    .from("menu_categories")
    .insert({ ...data, sort_order: (last?.sort_order ?? 0) + 1 });
  return done(error);
}

export async function setCategoryPublished(id: number, is_published: boolean): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  if (!idSchema.safeParse(id).success) return { error: "Ungültige Kategorie." };
  const { error } = await auth.supabase
    .from("menu_categories")
    .update({ is_published: is_published === true })
    .eq("id", id);
  return done(error);
}

/** Removes the category, its subcategories and every dish in them (cascades in the database). */
export async function deleteCategory(id: number): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  if (!idSchema.safeParse(id).success) return { error: "Ungültige Kategorie." };

  const { data: subs } = await auth.supabase
    .from("menu_categories")
    .select("id")
    .eq("parent_id", id);
  const ids = [id, ...(subs ?? []).map((s: { id: number }) => s.id)];
  const { data: images } = await auth.supabase
    .from("menu_items")
    .select("image_path")
    .in("category_id", ids)
    .not("image_path", "is", null);

  const { error } = await auth.supabase.from("menu_categories").delete().eq("id", id);
  if (!error)
    await removeImages(
      auth.supabase,
      (images ?? []).map((i) => i.image_path),
    );
  return done(error);
}

/**
 * Stores a new order for siblings: `ids` is the full list in the wanted order. Rows that
 * don't share one parent (categories) or one category (dishes) are rejected.
 */
async function reorder(
  table: "menu_categories" | "menu_items",
  group: "parent_id" | "category_id",
  ids: number[],
): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  const parsed = z.array(idSchema).min(1).max(500).safeParse(ids);
  if (!parsed.success || new Set(ids).size !== ids.length)
    return { error: "Ungültige Reihenfolge." };

  const { data: rows, error: readError } = await auth.supabase
    .from(table)
    .select(`id, ${group}`)
    .in("id", ids);
  if (readError) return { error: readError.message };
  const groups = new Set((rows ?? []).map((r) => (r as Record<string, unknown>)[group] ?? null));
  if (rows?.length !== ids.length || groups.size !== 1)
    return { error: "Die Einträge gehören nicht zur selben Gruppe." };

  const results = await Promise.all(
    ids.map((rowId, i) =>
      auth.supabase
        .from(table)
        .update({ sort_order: i + 1 })
        .eq("id", rowId),
    ),
  );
  return done(results.find((r) => r.error)?.error ?? null);
}

export async function reorderCategories(ids: number[]): Promise<Result> {
  return reorder("menu_categories", "parent_id", ids);
}

export async function reorderMenuItems(ids: number[]): Promise<Result> {
  return reorder("menu_items", "category_id", ids);
}

export type ItemInput = {
  category_id: number;
  name: string;
  description: string;
  name_en: string | null;
  description_en: string | null;
  price: string;
  tag: "V" | "VG" | null;
  allergens: string[];
  image_path: string | null;
  is_visible: boolean;
  is_available: boolean;
  sort_order: number;
};

const itemSchema = z.object({
  category_id: idSchema,
  name: z.string().trim().min(1, "Name fehlt.").max(120),
  description: z.string().trim().max(300),
  name_en: optionalText(120),
  description_en: optionalText(300),
  price: z
    .string()
    .trim()
    .regex(/^\d{1,4}([.,]\d{1,2})?$/, "Preis bitte im Format 13,90 angeben.")
    .transform((p) => Number(p.replace(",", "."))),
  tag: z.enum(["V", "VG"]).nullable(),
  allergens: z.array(z.enum(ALLERGEN_KEYS)).transform((a) => [...new Set(a)]),
  image_path: z.string().regex(IMAGE_PATH, "Ungültiges Bild.").nullable(),
  is_visible: z.boolean(),
  is_available: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export async function saveMenuItem(id: number | null, input: ItemInput): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (!id) {
    const { error } = await auth.supabase.from("menu_items").insert(parsed.data);
    return done(error);
  }

  const { data: before } = await auth.supabase
    .from("menu_items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle<{ image_path: string | null }>();
  const { error } = await auth.supabase.from("menu_items").update(parsed.data).eq("id", id);
  // The old photo goes only once the dish no longer points to it.
  if (!error && before?.image_path && before.image_path !== parsed.data.image_path)
    await removeImages(auth.supabase, [before.image_path]);
  return done(error);
}

export async function setMenuItemFlags(
  id: number,
  flags: { is_visible?: boolean; is_available?: boolean },
): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  const parsed = z
    .object({ is_visible: z.boolean().optional(), is_available: z.boolean().optional() })
    .strict()
    .safeParse(flags);
  if (!idSchema.safeParse(id).success || !parsed.success || !Object.keys(parsed.data).length)
    return { error: "Ungültige Eingabe." };
  const { error } = await auth.supabase.from("menu_items").update(parsed.data).eq("id", id);
  return done(error);
}

export async function deleteMenuItem(id: number): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  if (!idSchema.safeParse(id).success) return { error: "Ungültiges Gericht." };
  const { data: row } = await auth.supabase
    .from("menu_items")
    .select("image_path")
    .eq("id", id)
    .maybeSingle<{ image_path: string | null }>();
  const { error } = await auth.supabase.from("menu_items").delete().eq("id", id);
  if (!error) await removeImages(auth.supabase, [row?.image_path]);
  return done(error);
}

/** Drops a photo that was uploaded for a dish but never saved (e.g. the form was cancelled). */
export async function discardUpload(path: string): Promise<Result> {
  const auth = await authorize("menu.manage");
  if (!auth) return FORBIDDEN;
  if (!IMAGE_PATH.test(path)) return { error: "Ungültiges Bild." };
  const { count } = await auth.supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("image_path", path);
  if (!count) await removeImages(auth.supabase, [path]);
  return {};
}

/* ---------------- Reservations (reservations.manage) ---------------- */

const statusSchema = z.enum(["new", "confirmed", "declined", "cancelled"]);

export async function setReservationStatus(id: number, status: ReservationStatus): Promise<Result> {
  const auth = await authorize("reservations.manage");
  if (!auth) return FORBIDDEN;
  if (!statusSchema.safeParse(status).success) return { error: "Ungültiger Status." };
  const { error } = await auth.supabase.from("reservations").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return {};
}

const responseSchema = z.object({
  status: statusSchema,
  message: z
    .string()
    .trim()
    .min(1, "Bitte schreibe eine Nachricht.")
    .max(2000, "Die Nachricht ist zu lang."),
  notify: z.boolean(),
});

/** How the guest heard about the answer: emailed, not wanted, or failed (with the reason). */
export type Delivery = { emailed: true } | { emailed: false; reason: string };

/**
 * Saves the team's answer and, when `notify` is set, emails it to the guest in the language
 * they booked in. The answer is saved even if the email fails; the result says so.
 */
export async function respondToReservation(
  id: number,
  status: ReservationStatus,
  message: string,
  notify = true,
): Promise<Result & { reservation?: Reservation; delivery?: Delivery }> {
  const auth = await authorize("reservations.manage");
  if (!auth) return FORBIDDEN;
  const parsed = responseSchema.safeParse({ status, message, notify });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  if (!idSchema.safeParse(id).success) return { error: "Ungültige Reservierung." };

  const { data, error } = await auth.supabase
    .from("reservations")
    .update({
      status: parsed.data.status,
      admin_response: parsed.data.message,
      responded_at: new Date().toISOString(),
      responded_by: auth.userId,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  let reservation = data as Reservation;

  let delivery: Delivery = { emailed: false, reason: "Der E-Mail-Versand war abgewählt." };
  if (parsed.data.notify) {
    if (!reservation.email) {
      delivery = { emailed: false, reason: "Für diese Reservierung ist keine E-Mail-Adresse hinterlegt." };
    } else {
      const sent = await sendEmail({
        ...guestResponseEmail(
          {
            name: reservation.name,
            phone: reservation.phone,
            email: reservation.email,
            date: reservation.reservation_date,
            time: reservation.reservation_time.slice(0, 5),
            guests: reservation.guests,
            notes: reservation.special_requests,
            locale: reservation.locale === "en" ? "en" : "de",
          },
          parsed.data.status,
          parsed.data.message,
        ),
        replyTo: replyToAddress(),
      });
      if (sent.ok) {
        delivery = { emailed: true };
        const { data: marked } = await auth.supabase
          .from("reservations")
          .update({ response_emailed_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (marked) reservation = marked as Reservation;
      } else {
        console.error("response email failed:", sent.error);
        delivery = { emailed: false, reason: sent.error };
      }
    }
  }

  revalidatePath("/admin", "layout");
  return { reservation, delivery };
}

/* ---------------- Guest data (reservations.manage) ---------------- */

/** Deletes one reservation for good. */
export async function deleteReservation(id: number): Promise<Result> {
  const auth = await authorize("reservations.manage");
  if (!auth) return FORBIDDEN;
  if (!idSchema.safeParse(id).success) return { error: "Ungültige Reservierung." };
  const { error } = await auth.supabase.from("reservations").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return {};
}

const eraseSchema = z
  .object({
    email: z.string().trim().toLowerCase().max(254),
    phone: z.string().trim().max(30),
  })
  .refine((v) => v.email.includes("@") || v.phone.replace(/\D/g, "").length >= 5, {
    message: "Bitte gib eine E-Mail-Adresse oder Telefonnummer an.",
  });

/**
 * Right to erasure (Art. 17 DSGVO): deletes every reservation with this email address or phone
 * number, in any spelling of the number (+49 …, 0049 …, 0 …). Returns how many were deleted.
 */
export async function eraseGuestData(
  email: string,
  phone: string,
): Promise<Result & { deleted?: number }> {
  const auth = await authorize("reservations.manage");
  if (!auth) return FORBIDDEN;
  const parsed = eraseSchema.safeParse({ email, phone });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { data, error } = await auth.supabase.rpc("erase_guest_data", {
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { deleted: Number(data) || 0 };
}
