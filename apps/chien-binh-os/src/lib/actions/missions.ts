"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Json } from "@/types/database";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export async function acceptMissionAction(missionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_mission", { p_mission_id: missionId });
  if (error) return fail(error);
  revalidatePath("/missions");
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function submitMissionResultAction(
  missionId: string,
  content: Record<string, unknown>,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_mission_result", {
    p_mission_id: missionId,
    p_content: content as Json,
  });
  if (error) return fail(error);
  revalidatePath("/missions");
  return { ok: true, data: undefined };
}

export async function approveSubmissionAction(submissionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_submission", { p_submission_id: submissionId });
  if (error) return fail(error);
  revalidatePath("/missions");
  revalidatePath("/admin"); // bảng xếp hạng nằm trong trang Nhân sự
  revalidatePath("/feed");
  revalidatePath("/objectives");
  return { ok: true, data: undefined };
}

export async function rejectSubmissionAction(
  submissionId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionId,
    p_reason: reason,
  });
  if (error) return fail(error);
  revalidatePath("/missions");
  return { ok: true, data: undefined };
}

export async function revertSubmissionAction(
  submissionId: string,
  reason: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("revert_submission_to_rejected", {
    p_submission_id: submissionId,
    p_reason: reason,
  });
  if (error) return fail(error);
  revalidatePath("/missions");
  revalidatePath("/admin"); // bảng xếp hạng nằm trong trang Nhân sự
  return { ok: true, data: undefined };
}

export async function createMissionAction(input: {
  title: string;
  type: Enums<"mission_type">;
  parentId: string | null;
  assigneeId: string;
  target: number;
  unit: string;
  exp: number;
  deadline: string;
  fixed: boolean;
}): Promise<ActionResult<string>> {
  const supabase = await createClient();
  // Codegen đánh dấu p_parent_id/p_badge_reward/p_icon là "string" bắt buộc vì
  // hàm SQL không có DEFAULT NULL — nhưng cột đích đều nullable nên Postgres
  // vẫn nhận null bình thường lúc chạy, chỉ TS quá chặt ở đây.
  const { data, error } = await supabase.rpc("create_mission", {
    p_title: input.title,
    p_type: input.type,
    p_parent_id: input.parentId,
    p_assignee_id: input.assigneeId,
    p_target: input.target,
    p_unit: input.unit,
    p_exp: input.exp,
    p_badge_reward: null,
    p_deadline: input.deadline,
    p_fixed: input.fixed,
    p_icon: null,
  } as never);
  if (error) return fail(error);
  revalidatePath("/missions");
  revalidatePath("/objectives");
  return { ok: true, data: data as string };
}
