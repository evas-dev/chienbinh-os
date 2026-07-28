"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function proposeCommendationAction(
  staffId: string,
  badgeCode: string,
  reason: string,
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("propose_commendation", {
    p_staff_id: staffId,
    p_badge_code: badgeCode,
    p_reason: reason,
  });
  if (error) return fail(error);
  revalidatePath("/commend");
  return { ok: true, data: data as string };
}

export async function approveCommendationAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_commendation", { p_commendation_id: id });
  if (error) return fail(error);
  revalidatePath("/commend");
  revalidatePath("/feed");
  return { ok: true, data: undefined };
}

export async function rejectCommendationAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_commendation", { p_commendation_id: id });
  if (error) return fail(error);
  revalidatePath("/commend");
  return { ok: true, data: undefined };
}

export async function revokeCommendationAction(id: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_commendation", {
    p_commendation_id: id,
    p_reason: reason,
  });
  if (error) return fail(error);
  revalidatePath("/commend");
  revalidatePath("/feed");
  return { ok: true, data: undefined };
}
