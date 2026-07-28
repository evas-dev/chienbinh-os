"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function applyPenaltyAction(
  warriorId: string,
  code: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_penalty", {
    p_warrior_id: warriorId,
    p_code: code,
    p_reason: reason,
  });
  if (error) return fail(error);
  revalidatePath("/penalty");
  revalidatePath("/");
  revalidatePath("/ranks");
  return { ok: true, data: undefined };
}
