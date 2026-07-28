"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function createSupportRequestAction(
  type: Enums<"support_type">,
  targetId: string,
  content: string,
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_support_request", {
    p_type: type,
    p_target_id: targetId,
    p_content: content,
  });
  if (error) return fail(error);
  revalidatePath("/requests");
  return { ok: true, data: data as string };
}

export async function respondSupportRequestAction(
  requestId: string,
  approve: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_support_request", {
    p_request_id: requestId,
    p_approve: approve,
  });
  if (error) return fail(error);
  revalidatePath("/requests");
  return { ok: true, data: undefined };
}

export async function cancelSupportRequestAction(requestId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_support_request", { p_request_id: requestId });
  if (error) return fail(error);
  revalidatePath("/requests");
  return { ok: true, data: undefined };
}
