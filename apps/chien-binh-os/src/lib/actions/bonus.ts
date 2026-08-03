"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function setBonusConfigAction(pool: number, months: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_bonus_config", { p_pool: pool, p_months: months });
  if (error) return fail(error);
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}
