import path from "node:path";
import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { loginAs } from "./support/login";
import { ACCOUNTS, PASSWORD } from "./support/accounts";
import type { Database } from "../src/types/database";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Đăng nhập trực tiếp qua supabase-js (bỏ qua UI) — dùng để gọi RPC ở tầng
 * DB cho các kịch bản race-condition / validation mà UI không thể tạo ra
 * được (VD: gửi 2 request y hệt nhau "đồng thời" cần Promise.all thật sự
 * chạm DB cùng lúc, không qua độ trễ render của trình duyệt).
 */
async function signIn(phone: string): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: `${phone}@chienbinh.local`,
    password: PASSWORD,
  });
  if (error) throw error;
  return client;
}

const TEST_PREFIX = "[QA-MSA]";

/** RPC trả về uuid dạng `string | null` theo type codegen — trong test ta
 * luôn biết chắc nó tồn tại (đã expect trước đó), ép kiểu gọn cho các lệnh
 * gọi tiếp theo cần `string` non-null. */
function asId(v: unknown): string {
  return v as string;
}

// Theo dõi mọi id nhiệm vụ được test tạo ra để dọn dẹp ở cuối file — dữ liệu
// demo thật, không được để sót lại rác sau khi test chạy xong.
const createdMissionIds: string[] = [];

test.describe("Epic 04/05 — Nhiệm vụ & Nộp kết quả (gap-fix verification)", () => {
  test("MIS-13: hai yêu cầu nhận nhiệm vụ đồng thời chỉ một lần chuyển sang 'đang làm'", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);

    const { data: soldierMe } = await soldier.rpc("current_profile");
    const soldierId = (Array.isArray(soldierMe) ? soldierMe[0] : soldierMe)?.id as string;
    expect(soldierId).toBeTruthy();

    const { data: missionId, error: createErr } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} accept-race`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 1,
      p_unit: "việc",
      p_exp: 33,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    expect(createErr).toBeNull();
    createdMissionIds.push(asId(missionId));

    const [r1, r2] = await Promise.all([
      soldier.rpc("accept_mission", { p_mission_id: asId(missionId) }),
      soldier.rpc("accept_mission", { p_mission_id: asId(missionId) }),
    ]);

    const results = [r1, r2];
    const succeeded = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    expect(succeeded.length).toBe(1);
    expect(failed.length).toBe(1);
    expect(failed[0]!.error!.message).toContain("không ở trạng thái chưa nhận");

    const { data: mission } = await manager
      .from("missions")
      .select("status")
      .eq("id", asId(missionId))
      .single();
    expect(mission?.status).toBe("doing");
  });

  test("SUB-04: hai yêu cầu nộp kết quả đồng thời chỉ tạo đúng một bản nộp chờ duyệt", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);
    const { data: soldierMe } = await soldier.rpc("current_profile");
    const soldierId = (Array.isArray(soldierMe) ? soldierMe[0] : soldierMe)?.id as string;

    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} submit-race`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 1,
      p_unit: "việc",
      p_exp: 20,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));

    const { error: acceptErr } = await soldier.rpc("accept_mission", { p_mission_id: asId(missionId) });
    expect(acceptErr).toBeNull();

    const [r1, r2] = await Promise.all([
      soldier.rpc("submit_mission_result", { p_mission_id: asId(missionId), p_content: { note: "race A" } }),
      soldier.rpc("submit_mission_result", { p_mission_id: asId(missionId), p_content: { note: "race B" } }),
    ]);
    const results = [r1, r2];
    const succeeded = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    expect(succeeded.length).toBe(1);
    expect(failed.length).toBe(1);
    expect(failed[0]!.error!.message).toContain("không ở trạng thái đang làm");

    const { data: subs } = await manager
      .from("submissions")
      .select("id, round")
      .eq("mission_ref", asId(missionId));
    expect(subs?.length).toBe(1);
    expect(subs?.[0]?.round).toBe(1);
  });

  test("SUB-13 + SUB-12: hai yêu cầu duyệt đồng thời chỉ cộng EXP một lần, đúng theo cấu hình nhiệm vụ (không phải hằng số 40)", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);
    const { data: soldierMe } = await soldier.rpc("current_profile");
    const soldierId = (Array.isArray(soldierMe) ? soldierMe[0] : soldierMe)?.id as string;

    const MISSION_EXP = 77; // cố ý khác hằng số hardcode cũ (40) để lộ bug SUB-12 nếu tái phát
    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} approve-race`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 1,
      p_unit: "việc",
      p_exp: MISSION_EXP,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));

    await soldier.rpc("accept_mission", { p_mission_id: asId(missionId) });
    const { data: subId } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionId),
      p_content: { note: "chờ duyệt" },
    });

    const { data: before } = await manager
      .from("profiles")
      .select("exp")
      .eq("id", soldierId)
      .single();

    const [r1, r2] = await Promise.all([
      manager.rpc("approve_submission", { p_submission_id: asId(subId) }),
      manager.rpc("approve_submission", { p_submission_id: asId(subId) }),
    ]);
    const results = [r1, r2];
    const succeeded = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    expect(succeeded.length).toBe(1);
    expect(failed.length).toBe(1);
    expect(failed[0]!.error!.message).toContain("đã được xử lý");

    // SUB-12: EXP cộng phải khớp mission.exp thật (77), không phải hardcode 40
    const expDelta = (succeeded[0]!.data as { exp_delta: number }).exp_delta;
    expect(expDelta).toBe(MISSION_EXP);

    const { data: after } = await manager
      .from("profiles")
      .select("exp")
      .eq("id", soldierId)
      .single();
    expect((after?.exp ?? 0) - (before?.exp ?? 0)).toBe(MISSION_EXP);

    const { data: expLogRows } = await manager
      .from("exp_log")
      .select("id, delta")
      .eq("ref_id", asId(subId));
    expect(expLogRows?.length).toBe(1); // đúng 1 dòng ledger — không cộng trùng

    // Hoàn tác qua chính RPC thu hồi (SUB-14) — vừa dọn dữ liệu test vừa xác
    // nhận exp được trừ lại đúng số đã cấp.
    const { error: revertErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA cleanup — hoàn tác dữ liệu test",
    });
    expect(revertErr).toBeNull();

    const { data: restored } = await manager
      .from("profiles")
      .select("exp")
      .eq("id", soldierId)
      .single();
    expect(restored?.exp).toBe(before?.exp);
  });

  test("SUB-09: Tổng Tư Lệnh không thể tự duyệt kết quả do chính mình nộp", async () => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const { data: ceoMe } = await ceo.rpc("current_profile");
    const ceoId = (Array.isArray(ceoMe) ? ceoMe[0] : ceoMe)?.id as string;

    const { data: missionId } = await ceo.rpc("create_mission", {
      p_title: `${TEST_PREFIX} self-approve`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: ceoId, // CEO tự giao cho chính mình — luồng đặc biệt theo SUB-09 tiêu chí 3
      p_target: 1,
      p_unit: "việc",
      p_exp: 10,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));

    await ceo.rpc("accept_mission", { p_mission_id: asId(missionId) });
    const { data: subId } = await ceo.rpc("submit_mission_result", {
      p_mission_id: asId(missionId),
      p_content: { note: "ceo tự nộp" },
    });

    const { error } = await ceo.rpc("approve_submission", { p_submission_id: asId(subId) });
    expect(error).not.toBeNull();
    expect(error!.message).toContain("tự duyệt");

    const { data: sub } = await ceo
      .from("submissions")
      .select("status")
      .eq("id", asId(subId))
      .single();
    expect(sub?.status).toBe("cho_duyet"); // dữ liệu không bị đổi
  });

  test("MIS-07: từ chối tạo nhiệm vụ khi chỉ tiêu hoặc EXP âm/bằng 0, hoặc thiếu trường bắt buộc", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);
    const { data: soldierMe } = await soldier.rpc("current_profile");
    const soldierId = (Array.isArray(soldierMe) ? soldierMe[0] : soldierMe)?.id as string;

    const base = {
      p_type: "ngay" as const,
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 5,
      p_unit: "việc",
      p_exp: 50,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    };

    const { error: emptyTitleErr } = await manager.rpc("create_mission", {
      ...base,
      p_title: "   ",
    } as never);
    expect(emptyTitleErr?.message).toContain("tiêu đề");

    const { error: negTargetErr } = await manager.rpc("create_mission", {
      ...base,
      p_title: `${TEST_PREFIX} should-not-exist`,
      p_target: -5,
    } as never);
    expect(negTargetErr?.message).toContain("Chỉ tiêu");

    const { error: zeroTargetErr } = await manager.rpc("create_mission", {
      ...base,
      p_title: `${TEST_PREFIX} should-not-exist`,
      p_target: 0,
    } as never);
    expect(zeroTargetErr?.message).toContain("Chỉ tiêu");

    const { error: negExpErr } = await manager.rpc("create_mission", {
      ...base,
      p_title: `${TEST_PREFIX} should-not-exist`,
      p_exp: -1,
    } as never);
    expect(negExpErr?.message).toContain("EXP");

    const { error: emptyDeadlineErr } = await manager.rpc("create_mission", {
      ...base,
      p_title: `${TEST_PREFIX} should-not-exist`,
      p_deadline: "  ",
    } as never);
    expect(emptyDeadlineErr?.message).toContain("hạn");

    // Không nhiệm vụ rác nào được tạo từ các request trên
    const { data: leaked } = await manager
      .from("missions")
      .select("id")
      .eq("title", `${TEST_PREFIX} should-not-exist`);
    expect(leaked?.length ?? 0).toBe(0);
  });

  test("MIS-06: không thể giao nhiệm vụ mới cho tài khoản đã bị ngưng", async () => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const manager = await signIn(ACCOUNTS.tuLenhMarketing.phone);
    const { data: targetMe } = await ceo
      .from("profiles")
      .select("id, active")
      .eq("phone", ACCOUNTS.chienSyMyLinh.phone)
      .single();
    const targetId = targetMe!.id;
    expect(targetMe!.active).toBe(true); // trạng thái ban đầu — khôi phục lại y hệt sau test

    try {
      const { error: suspendErr } = await ceo.rpc("admin_set_active", {
        p_warrior_id: targetId,
        p_active: false,
      });
      expect(suspendErr).toBeNull();

      const { error: createErr } = await manager.rpc("create_mission", {
        p_title: `${TEST_PREFIX} should-not-exist-suspended`,
        p_type: "ngay",
        p_parent_id: null,
        p_assignee_id: targetId,
        p_target: 1,
        p_unit: "việc",
        p_exp: 10,
        p_badge_reward: null,
        p_deadline: "Hôm nay",
        p_fixed: false,
        p_icon: null,
      } as never);
      expect(createErr?.message).toContain("ngưng");

      const { data: leaked } = await ceo
        .from("missions")
        .select("id")
        .eq("title", `${TEST_PREFIX} should-not-exist-suspended`);
      expect(leaked?.length ?? 0).toBe(0);
    } finally {
      await ceo.rpc("admin_set_active", { p_warrior_id: targetId, p_active: true });
    }
  });
});

test.describe("Xác nhận UI đầu-cuối (E2E qua trình duyệt)", () => {
  test("SUB-12: duyệt qua UI cộng đúng EXP cấu hình trong nhiệm vụ (không phải 40 cố định)", async ({
    page,
  }) => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);
    const { data: soldierMe } = await soldier.rpc("current_profile");
    const soldierId = (Array.isArray(soldierMe) ? soldierMe[0] : soldierMe)?.id as string;

    const MISSION_EXP = 65;
    const uniqueTitle = `${TEST_PREFIX} ui-approve-${Date.now()}`;
    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: uniqueTitle,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 1,
      p_unit: "việc",
      p_exp: MISSION_EXP,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));
    await soldier.rpc("accept_mission", { p_mission_id: asId(missionId) });
    const { data: subId } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionId),
      p_content: { note: "UI test" },
    });

    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/missions");
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    // Khoanh đúng 1 hàng SubmissionCard bằng class gốc của nó (border-cb-line-soft
    // border-b) — tránh trúng nhầm div lồng bên trong (chỉ bọc tiêu đề, không
    // có nút) hoặc cả khối cha chứa nhiều bản nộp khác đang chờ duyệt.
    const card = page.locator("div.border-cb-line-soft.border-b", { hasText: uniqueTitle });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Duyệt" }).click();

    // Toast là UI thoáng qua (tự ẩn sau vài giây) nên xác nhận bằng trạng
    // thái DB thật sau cú click UI — đây mới là bằng chứng đáng tin cậy rằng
    // luồng approve qua UI cộng đúng EXP theo cấu hình nhiệm vụ (65), không
    // phải hằng số cũ (40).
    await expect(async () => {
      const { data: sub } = await manager
        .from("submissions")
        .select("status, exp_granted")
        .eq("id", asId(subId))
        .single();
      expect(sub?.status).toBe("da_duyet");
      expect(sub?.exp_granted).toBe(MISSION_EXP);
    }).toPass({ timeout: 10_000 });

    // Dọn dẹp: hoàn tác duyệt để trả EXP về đúng baseline
    await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA cleanup — hoàn tác dữ liệu test UI",
    });
  });
});
