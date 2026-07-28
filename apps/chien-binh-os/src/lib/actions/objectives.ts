"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function assignObjectiveItemAction(input: {
  ownerId: string;
  metric: string;
  metricKey: string | null;
  target: number;
  unit: string;
  weight: number;
  confirm?: boolean;
}): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("assign_objective_item", {
    p_owner_id: input.ownerId,
    p_metric: input.metric,
    p_metric_key: input.metricKey,
    p_target: input.target,
    p_unit: input.unit,
    p_weight: input.weight,
    p_confirm: input.confirm ?? false,
  } as never);
  if (error) return fail(error);
  revalidatePath("/objectives");
  revalidatePath("/");
  return { ok: true, data: data as string };
}
