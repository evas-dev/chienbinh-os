"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function setActiveAction(warriorId: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_active", {
    p_warrior_id: warriorId,
    p_active: active,
  });
  if (error) return fail(error);
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}
