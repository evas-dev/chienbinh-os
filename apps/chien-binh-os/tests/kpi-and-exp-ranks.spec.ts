import path from "node:path";
import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { loginAs } from "./support/login";
import { ACCOUNTS, PASSWORD } from "./support/accounts";
import type { Database } from "../src/types/database";
import { ranksConfigIssue, expProgress } from "../src/lib/ranks";
import { weightedProgress, weightedRaw } from "../src/lib/objectives";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Đăng nhập trực tiếp qua supabase-js (bỏ qua UI) — cho các RPC/kiểm chứng
 * DB không cần trình duyệt. Cùng quy ước với tests/missions-and-submissions.spec.ts. */
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

const TEST_PREFIX = "[QA-KPIEXP]";

function asId(v: unknown): string {
  return v as string;
}

async function meId(client: SupabaseClient<Database>): Promise<string> {
  const { data } = await client.rpc("current_profile");
  return (Array.isArray(data) ? data[0] : data)!.id as string;
}

// Dọn dẹp cuối file — không được để rác trong dữ liệu demo thật.
const createdMissionIds: string[] = [];
const createdObjectiveItemIds: string[] = [];
const createdObjectiveIds = new Set<string>();

// Máy chạy test dùng chung với nhiều tiến trình dev-server/agent khác cùng
// lúc nên trang có thể tải chậm hơn 30s mặc định — nới riêng cho file này,
// không đụng tới playwright.config.ts (dùng chung với các epic khác).
test.setTimeout(90_000);

test.describe("Epic 06 — Mục tiêu và KPI (gap-fix verification)", () => {
  test("KPI-05: duyệt kết quả cộng đúng vào KPI của Tư Lệnh (người giao) — không phải Chiến Sỹ (người nộp)", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhSale.phone);
    const soldier = await signIn(ACCOUNTS.chienSyLanChi.phone);
    const managerId = await meId(manager);
    const soldierId = await meId(soldier);

    // Baseline: chỉ tiêu "Khách hàng mới" (metric_key='lead') của Minh Đức —
    // trước khi sửa, approve_submission khớp theo submitter (Lan Chi, không sở
    // hữu objective nào) nên current không bao giờ nhích — đây là bug cốt lõi.
    const { data: itemBefore } = await manager
      .from("objective_items")
      .select("id, current, target, objectives!inner(owner_id)")
      .eq("metric_key", "lead")
      .eq("objectives.owner_id", managerId)
      .single();
    expect(itemBefore).toBeTruthy();
    const baseline = itemBefore!.current;

    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} kpi-rollup-${Date.now()}`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 10,
      p_unit: "lead",
      p_exp: 40,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));
    await soldier.rpc("accept_mission", { p_mission_id: asId(missionId) });
    const { data: subId } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionId),
      p_content: { lead: 10 },
    });

    const { error: approveErr } = await manager.rpc("approve_submission", { p_submission_id: asId(subId) });
    expect(approveErr).toBeNull();

    const { data: itemAfter } = await manager
      .from("objective_items")
      .select("current")
      .eq("id", itemBefore!.id)
      .single();
    expect(itemAfter?.current).toBe(baseline + 10);

    // Thu hồi duyệt — KPI phải hoàn tác đúng phần đã cộng (KPI-05 AC3 / business-rules.md).
    const { error: revertErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA cleanup — hoàn tác dữ liệu test",
    });
    expect(revertErr).toBeNull();

    const { data: itemRestored } = await manager
      .from("objective_items")
      .select("current")
      .eq("id", itemBefore!.id)
      .single();
    expect(itemRestored?.current).toBe(baseline);
  });

  test("KPI-05: thu hồi duyệt đảo ĐÚNG phần đã cộng (đã bị ghim ở target), không đảo theo số nộp thô", async () => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const manager = await signIn(ACCOUNTS.tuLenhDev.phone);
    const soldier = await signIn(ACCOUNTS.chienSyVanKhoa.phone);
    const managerId = await meId(manager);
    const soldierId = await meId(soldier);

    // Chỉ tiêu test cô lập, target nhỏ để dễ ép trần (clamp). objective_items
    // chỉ có RPC để tạo (không có API xoá — bảng chỉ cho phép SELECT qua RLS,
    // ghi/xoá đều phải qua RPC theo thiết kế "không xoá cứng KPI"), nên nếu
    // lần chạy trước để lại chỉ tiêu 'lead' khác cho Quốc Bảo, p_confirm=true
    // để không bị KPI-06 dup-guard chặn — chỉ tiêu MỚI vẫn độc lập current/
    // target với mọi chỉ tiêu cũ nên phép tính clamp dưới đây không bị ảnh
    // hưởng bởi rác còn sót từ lần chạy trước.
    const { data: itemId, error: assignErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} clamp test ${Date.now()}`,
      p_metric_key: "lead",
      p_target: 5,
      p_unit: "lead",
      p_weight: 10,
      p_confirm: true,
    } as never);
    expect(assignErr).toBeNull();
    createdObjectiveItemIds.push(asId(itemId));
    const { data: itemRow } = await ceo
      .from("objective_items")
      .select("objective_id")
      .eq("id", asId(itemId))
      .single();
    createdObjectiveIds.add(itemRow!.objective_id!);

    // Mission A: nộp lead=3 (dưới target) -> current 0 -> 3
    const { data: missionA } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} clamp-A-${Date.now()}`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 3,
      p_unit: "lead",
      p_exp: 30,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionA));
    await soldier.rpc("accept_mission", { p_mission_id: asId(missionA) });
    const { data: subA } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionA),
      p_content: { lead: 3 },
    });
    await manager.rpc("approve_submission", { p_submission_id: asId(subA) });

    let { data: item } = await ceo.from("objective_items").select("current").eq("id", asId(itemId)).single();
    expect(item?.current).toBe(3);

    // Mission B: nộp lead=10 (vượt target còn lại) -> chỉ được cộng thêm 2 (ghim ở 5)
    const { data: missionB } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} clamp-B-${Date.now()}`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 10,
      p_unit: "lead",
      p_exp: 60,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionB));
    await soldier.rpc("accept_mission", { p_mission_id: asId(missionB) });
    const { data: subB } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionB),
      p_content: { lead: 10 },
    });
    await manager.rpc("approve_submission", { p_submission_id: asId(subB) });

    ({ data: item } = await ceo.from("objective_items").select("current").eq("id", asId(itemId)).single());
    expect(item?.current).toBe(5); // ghim ở target, không phải 3+10=13

    // Thu hồi duyệt Mission B — phải trả về ĐÚNG 3 (đảo lại phần đã cộng thực
    // sự là 2, không phải đảo nguyên 10 như nếu tính lại từ nội dung nộp thô).
    const { error: revertBErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subB),
      p_reason: "QA cleanup — hoàn tác clamp test B",
    });
    expect(revertBErr).toBeNull();
    ({ data: item } = await ceo.from("objective_items").select("current").eq("id", asId(itemId)).single());
    expect(item?.current).toBe(3);

    // Thu hồi duyệt Mission A luôn — về lại 0, dọn sạch dữ liệu test.
    const { error: revertAErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subA),
      p_reason: "QA cleanup — hoàn tác clamp test A",
    });
    expect(revertAErr).toBeNull();
    ({ data: item } = await ceo.from("objective_items").select("current").eq("id", asId(itemId)).single());
    expect(item?.current).toBe(0);
  });

  test("KPI-06: tạo chỉ tiêu trùng khóa đo lường trong cùng kỳ bị cảnh báo thay vì tạo âm thầm; xác nhận thì cho phép", async () => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const managerId = await meId(await signIn(ACCOUNTS.tuLenhCSKH.phone));
    const uniqueKey = `qa_dup_${Date.now()}`;

    const { data: firstId, error: firstErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} dup metric`,
      p_metric_key: uniqueKey,
      p_target: 50,
      p_unit: "đv",
      p_weight: 10,
    } as never);
    expect(firstErr).toBeNull();
    createdObjectiveItemIds.push(asId(firstId));

    const { data: itemRow } = await ceo
      .from("objective_items")
      .select("objective_id")
      .eq("id", asId(firstId))
      .single();
    createdObjectiveIds.add(itemRow!.objective_id!);

    // Gửi lại y hệt, không xác nhận — phải bị chặn (KPI-06 AC1), không âm thầm tạo mới
    const { data: dupId, error: dupErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} dup metric`,
      p_metric_key: uniqueKey,
      p_target: 50,
      p_unit: "đv",
      p_weight: 10,
    } as never);
    expect(dupId).toBeNull();
    expect(dupErr?.message).toContain("DUPLICATE_KPI");

    const { data: countCheck } = await ceo
      .from("objective_items")
      .select("id")
      .eq("metric_key", uniqueKey);
    expect(countCheck?.length).toBe(1); // không có bản ghi trùng nào được tạo

    // Xác nhận (p_confirm=true) — cho phép tạo thêm (KPI-06 AC3, người có quyền xác nhận)
    const { data: confirmedId, error: confirmedErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} dup metric`,
      p_metric_key: uniqueKey,
      p_target: 50,
      p_unit: "đv",
      p_weight: 10,
      p_confirm: true,
    } as never);
    expect(confirmedErr).toBeNull();
    expect(confirmedId).toBeTruthy();
    createdObjectiveItemIds.push(asId(confirmedId));

    const { data: countAfterConfirm } = await ceo
      .from("objective_items")
      .select("id")
      .eq("metric_key", uniqueKey);
    expect(countAfterConfirm?.length).toBe(2);
  });

  test("KPI-06/KPI-02: giao KPI từ chối mục tiêu <= 0 và trọng số ngoài [1,100], không tạo bản ghi rác", async () => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const managerId = await meId(await signIn(ACCOUNTS.tuLenhKeToan.phone));

    const { data: zeroTargetId, error: zeroTargetErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} should-not-exist target0`,
      p_metric_key: null,
      p_target: 0,
      p_unit: "đv",
      p_weight: 10,
    } as never);
    expect(zeroTargetId).toBeNull();
    expect(zeroTargetErr?.message).toContain("mục tiêu");

    const { data: badWeightId, error: badWeightErr } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} should-not-exist weight150`,
      p_metric_key: null,
      p_target: 10,
      p_unit: "đv",
      p_weight: 150,
    } as never);
    expect(badWeightId).toBeNull();
    expect(badWeightErr?.message).toContain("Trọng số");

    const { data: leaked } = await ceo
      .from("objective_items")
      .select("id")
      .like("metric", `${TEST_PREFIX} should-not-exist%`);
    expect(leaked?.length ?? 0).toBe(0);
  });

  test("KPI-02: trang Mục tiêu của CEO chỉ hiển thị đúng 1 thẻ KPI cho mỗi chủ sở hữu, dù có nhiều kỳ (objectives) khác nhau", async ({
    page,
  }) => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const managerId = await meId(await signIn(ACCOUNTS.tuLenhSale.phone));

    // Trước khi sửa: assign_objective_item khớp kỳ theo now() thật (khác kỳ
    // seed) sẽ tạo một hàng "objectives" MỚI riêng cho Minh Đức — vỡ giao diện
    // CEO thành 2 thẻ cho cùng một người. Tạo lại đúng kịch bản đó để xác
    // nhận trang CEO đã gộp về đúng 1 thẻ/chủ sở hữu.
    const { data: itemId, error } = await ceo.rpc("assign_objective_item", {
      p_owner_id: managerId,
      p_metric: `${TEST_PREFIX} fragmentation probe ${Date.now()}`,
      p_metric_key: null,
      p_target: 10,
      p_unit: "đv",
      p_weight: 5,
    } as never);
    expect(error).toBeNull();
    createdObjectiveItemIds.push(asId(itemId));
    const { data: itemRow } = await ceo
      .from("objective_items")
      .select("objective_id")
      .eq("id", asId(itemId))
      .single();
    createdObjectiveIds.add(itemRow!.objective_id!);

    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/objectives");
    // Đếm theo tiêu đề thẻ (TieuDeMuc hiển thị "Minh Đức · Sale" trong 1 span
    // duy nhất) — nếu trang chưa gộp theo owner, sẽ có 2 thẻ trùng tên này.
    const cardTitles = page.getByText("Minh Đức · Sale", { exact: true });
    await expect(cardTitles).toHaveCount(1);
  });

  test("KPI-04: weightedProgress/weightedRaw không cho ra NaN/Infinity khi một chỉ tiêu có target <= 0", () => {
    const items = [
      { current: 5, target: 0, weight: 50 }, // dữ liệu thiếu/sai cấu hình
      { current: 5, target: 10, weight: 50 },
    ];
    const progress = weightedProgress(items);
    const raw = weightedRaw(items);
    expect(Number.isFinite(progress)).toBe(true);
    expect(Number.isFinite(raw)).toBe(true);
    expect(Number.isNaN(progress)).toBe(false);
    // Chỉ tiêu target=0 đóng góp 0%, chỉ tiêu còn lại 50% × 50 trọng số = đúng 25% tổng
    expect(progress).toBe(25);
  });
});

test.describe("Epic 08 — EXP, quân hàm và bảng xếp hạng (gap-fix verification)", () => {
  test("EXP-05: gửi duyệt trùng lặp không cộng EXP lần hai, ledger chỉ có đúng 1 bút toán nguồn", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhMarketing.phone);
    const soldier = await signIn(ACCOUNTS.chienSyMyLinh.phone);
    const soldierId = await meId(soldier);

    const MISSION_EXP = 53;
    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} exp05-dup-approve-${Date.now()}`,
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
      p_content: { note: "exp-05" },
    });

    const { error: firstErr } = await manager.rpc("approve_submission", { p_submission_id: asId(subId) });
    expect(firstErr).toBeNull();

    // Gửi lại y hệt request duyệt (giả lập double-submit do mất kết nối/F5)
    const { error: secondErr } = await manager.rpc("approve_submission", { p_submission_id: asId(subId) });
    expect(secondErr).not.toBeNull();
    expect(secondErr?.message).toContain("đã được xử lý");

    const { data: expRows } = await manager.from("exp_log").select("id, delta").eq("ref_id", asId(subId));
    expect(expRows?.length).toBe(1);
    expect(expRows?.[0]?.delta).toBe(MISSION_EXP);

    await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA cleanup — EXP-05",
    });
  });

  test("EXP-09: thu hồi duyệt lần hai trên cùng bút toán bị chặn, không đảo trùng", async () => {
    const manager = await signIn(ACCOUNTS.tuLenhMarketing.phone);
    const soldier = await signIn(ACCOUNTS.chienSyTienDung.phone);
    const soldierId = await meId(soldier);

    const { data: missionId } = await manager.rpc("create_mission", {
      p_title: `${TEST_PREFIX} exp09-dup-revert-${Date.now()}`,
      p_type: "ngay",
      p_parent_id: null,
      p_assignee_id: soldierId,
      p_target: 1,
      p_unit: "việc",
      p_exp: 22,
      p_badge_reward: null,
      p_deadline: "Hôm nay",
      p_fixed: false,
      p_icon: null,
    } as never);
    createdMissionIds.push(asId(missionId));
    await soldier.rpc("accept_mission", { p_mission_id: asId(missionId) });
    const { data: subId } = await soldier.rpc("submit_mission_result", {
      p_mission_id: asId(missionId),
      p_content: { note: "exp-09" },
    });
    await manager.rpc("approve_submission", { p_submission_id: asId(subId) });

    const { error: firstRevertErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA revert 1",
    });
    expect(firstRevertErr).toBeNull();

    const { error: secondRevertErr } = await manager.rpc("revert_submission_to_rejected", {
      p_submission_id: asId(subId),
      p_reason: "QA revert 2 — phải bị chặn",
    });
    expect(secondRevertErr).not.toBeNull();
    expect(secondRevertErr?.message).toContain("Chỉ thu hồi được kết quả đã duyệt");

    const { data: expRows } = await manager.from("exp_log").select("delta").eq("ref_id", asId(subId));
    expect(expRows?.length).toBe(2); // đúng 1 dòng cộng + 1 dòng đảo, không đảo trùng lần nữa
    const sum = (expRows ?? []).reduce((s, r) => s + (r.delta ?? 0), 0);
    expect(sum).toBe(0);
  });

  test("EXP-06: bảng xếp hạng mùa (nhúng trong Bảng nhiệm vụ) dùng season_points, không dùng EXP trọn đời", async ({
    page,
  }) => {
    const ceo = await signIn(ACCOUNTS.ceo.phone);
    const { data: bySeasonPoints } = await ceo
      .from("profiles")
      .select("id, name, season_points")
      .neq("role", "tong_tu_lenh")
      .order("season_points", { ascending: false })
      .limit(10);
    const { data: byExp } = await ceo
      .from("profiles")
      .select("id, name, exp")
      .neq("role", "tong_tu_lenh")
      .order("exp", { ascending: false })
      .limit(10);
    const seasonOrder = (bySeasonPoints ?? []).map((p) => p.name);
    const expOrder = (byExp ?? []).map((p) => p.name);
    // Dữ liệu demo thật: hai cách sắp xếp phải KHÁC nhau — nếu không thì test
    // này không chứng minh được gì (không phân biệt được season vs exp).
    expect(seasonOrder).not.toEqual(expOrder);

    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await page.goto("/missions");
    await expect(page.getByText("Bảng xếp hạng mùa")).toBeVisible();
    // data-slot="card-content" là div CardContent chứa cả tiêu đề lẫn các
    // hàng xếp hạng (xem components/missions/quest-board.tsx) — nhắm trực
    // tiếp thay vì dò theo cấu trúc div lồng nhau chung chung.
    const panel = page.locator('div[data-slot="card-content"]', { has: page.getByText("Bảng xếp hạng mùa") });
    const namesOnPage = await panel.locator("span.flex-1.truncate").allTextContents();
    const cleanedNames = namesOnPage.map((n) => n.replace(" (Bạn)", "").trim());
    expect(cleanedNames).toEqual(seasonOrder.slice(0, cleanedNames.length));
  });

  test("EXP-06: trang /ranks (cấp 1 · cá nhân) cũng dùng season_points, nhãn ghi rõ ĐIỂM MÙA", async ({ page }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/ranks?scope=ca_nhan");
    await expect(page.getByText("ĐIỂM MÙA").first()).toBeVisible();
    await expect(page.getByText("EXP/Quân hàm", { exact: false })).toBeVisible();
  });

  test("EXP-02: cấu hình quân hàm hợp lệ hiện tại không bị đánh dấu lỗi; ngưỡng trùng/sai thứ tự thì bị đánh dấu", () => {
    const validRanks = [
      { id: 1, name: "A", min_exp: 0, ord: 0, insignia: "○", tier: null },
      { id: 2, name: "B", min_exp: 100, ord: 1, insignia: "▪", tier: null },
      { id: 3, name: "C", min_exp: 200, ord: 2, insignia: "★", tier: null },
    ];
    expect(ranksConfigIssue(validRanks)).toBeNull();
    expect(expProgress(50, validRanks).configIssue).toBeNull();

    const overlappingRanks = [
      { id: 1, name: "A", min_exp: 0, ord: 0, insignia: "○", tier: null },
      { id: 2, name: "B", min_exp: 100, ord: 1, insignia: "▪", tier: null },
      { id: 3, name: "C (sai)", min_exp: 50, ord: 2, insignia: "★", tier: null }, // min_exp lùi lại — sai thứ tự
    ];
    expect(ranksConfigIssue(overlappingRanks)).not.toBeNull();
    expect(expProgress(150, overlappingRanks).configIssue).not.toBeNull();

    const duplicateOrdRanks = [
      { id: 1, name: "A", min_exp: 0, ord: 0, insignia: "○", tier: null },
      { id: 2, name: "B", min_exp: 100, ord: 1, insignia: "▪", tier: null },
      { id: 3, name: "B trùng", min_exp: 200, ord: 1, insignia: "▪", tier: null }, // ord trùng
    ];
    expect(ranksConfigIssue(duplicateOrdRanks)).not.toBeNull();
  });
});

test.afterAll(async () => {
  const ceo = await signIn(ACCOUNTS.ceo.phone);

  // Best-effort: objectives/objective_items chỉ có policy SELECT qua RLS —
  // ghi/xoá đều bắt buộc đi qua RPC theo thiết kế (không có API xoá trực
  // tiếp, khớp "không xoá cứng KPI"/KPI-08, KPI-09). Các lệnh xoá dưới đây vì
  // vậy sẽ là no-op im lặng đối với 2 bảng này — chỉ tiêu test tạo qua
  // assign_objective_item sẽ còn lại vĩnh viễn với tiền tố ${TEST_PREFIX} dễ
  // nhận diện, cần dọn bằng SQL có quyền cao hơn (vd Supabase dashboard/MCP)
  // nếu muốn xoá hẳn. Vẫn thử ở đây phòng trường hợp policy đổi sau này.
  for (const id of createdObjectiveItemIds) {
    await ceo.from("objective_items").delete().eq("id", id);
  }
  for (const objId of createdObjectiveIds) {
    const { data: remaining } = await ceo.from("objective_items").select("id").eq("objective_id", objId);
    if (!remaining || remaining.length === 0) {
      await ceo.from("objectives").delete().eq("id", objId);
    }
  }

  if (createdMissionIds.length) {
    const { data: subs } = await ceo.from("submissions").select("id").in("mission_ref", createdMissionIds);
    for (const s of subs ?? []) {
      await ceo.from("exp_log").delete().eq("ref_id", s.id);
      await ceo.from("submissions").delete().eq("id", s.id);
    }
    for (const missionId of createdMissionIds) {
      await ceo.from("missions").delete().eq("id", missionId);
    }
  }
  await ceo.from("feed").delete().ilike("text", `%${TEST_PREFIX}%`);

  // Đồng bộ lại cache exp/season_points từ sổ cái cho MỌI tài khoản demo dùng
  // trong file test này — đảm bảo không lệch sau khi xoá exp_log của test.
  const phones = [
    ACCOUNTS.tuLenhSale.phone,
    ACCOUNTS.tuLenhMarketing.phone,
    ACCOUNTS.tuLenhDev.phone,
    ACCOUNTS.tuLenhCSKH.phone,
    ACCOUNTS.tuLenhKeToan.phone,
    ACCOUNTS.chienSyLanChi.phone,
    ACCOUNTS.chienSyMyLinh.phone,
    ACCOUNTS.chienSyTienDung.phone,
    ACCOUNTS.chienSyVanKhoa.phone,
  ];
  for (const phone of phones) {
    const { data: prof } = await ceo.from("profiles").select("id").eq("phone", phone).single();
    if (!prof) continue;
    const { data: rows } = await ceo.from("exp_log").select("delta, season_delta").eq("warrior_id", prof.id);
    const sumExp = (rows ?? []).reduce((s, r) => s + (r.delta ?? 0), 0);
    const sumSeason = (rows ?? []).reduce((s, r) => s + (r.season_delta ?? 0), 0);
    await ceo
      .from("profiles")
      .update({ exp: Math.max(0, sumExp), season_points: Math.max(0, sumSeason) })
      .eq("id", prof.id);
  }
});
