"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export type ConfirmState = "done" | "invalid" | null;

/**
 * Second step of the double opt-in for offers by email. Runs on a button press, not on opening
 * the link, so mail scanners that follow links can't confirm on the guest's behalf. The
 * database function checks the token (unused, at most 30 days old) and stores the timestamp.
 */
export async function confirmMarketing(
  _prev: ConfirmState,
  formData: FormData,
): Promise<ConfirmState> {
  const token = z.string().uuid().safeParse(formData.get("token"));
  if (!token.success) return "invalid";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_marketing_email", { p_token: token.data });
  if (error) console.error("marketing confirmation failed", error);
  return data === true ? "done" : "invalid";
}
