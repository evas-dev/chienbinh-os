"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

function lamMoi() {
  revalidatePath("/objectives");
  revalidatePath("/missions");
  revalidatePath("/");
}

/** Tạo lịch lặp cho từng người được chọn. Trả về số lịch đã tạo. */
export async function createRecurringMissionAction(input: {
  title: string;
  target: number;
  unit: string;
  exp: number;
  assigneeIds: string[];
  weekdays: number[];
}): Promise<ActionResult<number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_recurring_mission", {
    p_title: input.title,
    p_target: input.target,
    p_unit: input.unit,
    p_exp: input.exp,
    p_assignee_ids: input.assigneeIds,
    p_weekdays: input.weekdays,
  });
  if (error) return fail(error);
  lamMoi();
  return { ok: true, data: (data as number) ?? 0 };
}

/** Tạm dừng / bật lại lịch mà không xoá — nhiệm vụ đã giao vẫn giữ nguyên. */
export async function setRecurringActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_recurring_mission_active", {
    p_id: id,
    p_active: active,
  });
  if (error) return fail(error);
  lamMoi();
  return { ok: true, data: undefined };
}

export async function deleteRecurringAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_recurring_mission", { p_id: id });
  if (error) return fail(error);
  lamMoi();
  return { ok: true, data: undefined };
}
