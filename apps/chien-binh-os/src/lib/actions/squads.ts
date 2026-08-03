"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./missions";

function fail(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : "Có lỗi xảy ra" };
}

export type ChucTrongDoi = "leader" | "deputy" | "member";

/** Bổ nhiệm hoặc chuyển chức. Người đang giữ chức bị thay sẽ lùi về thành viên. */
export async function assignSquadMemberAction(
  squadId: string,
  warriorId: string,
  chuc: ChucTrongDoi,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_squad_member", {
    p_squad_id: squadId,
    p_warrior_id: warriorId,
    p_squad_role: chuc,
  });
  if (error) return fail(error);
  lamMoi();
  return { ok: true, data: undefined };
}

/** Gỡ hẳn một người khỏi tiểu đội (cả chức lẫn tư cách thành viên). */
export async function removeSquadMemberAction(
  squadId: string,
  warriorId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_squad_member", {
    p_squad_id: squadId,
    p_warrior_id: warriorId,
  });
  if (error) return fail(error);
  lamMoi();
  return { ok: true, data: undefined };
}

/**
 * Đổi cơ cấu tiểu đội ảnh hưởng cả ba chế độ xem của trang Nhân sự: quân số ở
 * Tiểu đội, nhãn chức vụ ở bảng xếp hạng, và bảng xếp hạng cấp 2 gộp điểm theo
 * đội. Cả ba nằm chung `/admin` nên một lần làm mới là đủ.
 */
function lamMoi() {
  revalidatePath("/admin");
}
