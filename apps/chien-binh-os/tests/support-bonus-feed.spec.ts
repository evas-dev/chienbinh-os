import { test, expect } from "@playwright/test";
import { loginAs } from "./support/login";
import { ACCOUNTS } from "./support/accounts";
import { getAccessToken, restSelect, rpcCall } from "./support/supabase-rest";

/**
 * Gap-analysis Epic 11 (Yêu Cầu Hỗ Trợ) / Epic 12 (Quỹ Thưởng) / Epic 13
 * (Feed, Cẩm Nang). Các test này gọi thẳng PostgREST/RPC (bỏ qua UI) ở
 * những chỗ chính acceptance criteria yêu cầu enforcement "tại server/
 * database" — một nút bị disable trên UI không chứng minh được điều đó.
 */

// profiles cố định trong seed demo — xem tests/support/accounts.ts
const MINH_DUC_MANAGER_ID = "f1dc3b66-cc4b-41a2-82ac-468adf966ebd"; // 0901000002, tu_lenh
const DINH_PHUC_MANAGER_ID = "599cabe3-138f-4b63-a508-de40b600472e"; // 0901000012, tu_lenh
const HOANG_LONG_STAFF_ID = "58437db2-4a71-4dec-a0c8-b679dc5077de"; // 0901000006, chien_sy

// FEE-02 fixture: bảng `feed` không có policy INSERT nào (chỉ SELECT) và
// không có RPC nào cho phép ghi text tuỳ ý — đúng thiết kế, người dùng
// thường/anon-key không tự chèn được feed. Vì vậy fixture dưới đây (1 dòng
// feed chứa payload nguy hiểm, đúng hình dạng mà reject_submission/
// revert_submission_to_rejected tạo ra khi p_reason chứa HTML) phải được
// seed trước bằng quyền service-role/SQL trực tiếp qua mcp__supabase__execute_sql
// — ngoài phạm vi mà tiến trình `playwright test` (chỉ có anon key) có thể tự
// làm. Trước khi chạy riêng lẻ describe block này, seed:
//   insert into feed (icon, text, actor_id) values ('❌',
//     'Kết quả «E2E-XSS-TEST» bị từ chối: <img src=x onerror="window.__e2eXssFired=true"><script>window.__e2eXssFired=true</script>',
//     (select id from profiles where phone = '0901000001'));
// và BẮT BUỘC xoá lại dòng đó ngay sau khi test xong (cùng câu lệnh nhưng
// delete from feed where text like '%E2E-XSS-TEST%') — nếu không sẽ để lại
// một dòng nhật ký giả trên feed thật.
test.describe("FEE-02 — feed hiển thị nội dung nguy hiểm dạng text an toàn", () => {
  test("FEE-02: dòng feed chứa <img onerror> / <script> không thực thi mã, hiển thị dạng text", async ({
    page,
  }) => {
    // Fixture: một dòng feed đã được seed sẵn trong DB (mô phỏng đúng payload
    // mà reject_submission/revert_submission_to_rejected tạo ra khi nối
    // p_reason — lý do từ chối do một Tư Lệnh nhập tay — trực tiếp vào
    // feed.text: `'❌', 'Kết quả «...» bị từ chối: ' || p_reason`). Nếu
    // p_reason chứa HTML/script, trước khi sửa nó sẽ được render qua
    // dangerouslySetInnerHTML và thực thi ngay cho mọi người xem feed.
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await page.goto("/feed");

    // Không có mã nào từ nội dung feed được thực thi.
    const fired = await page.evaluate(() => (window as unknown as Record<string, unknown>).__e2eXssFired);
    expect(fired).toBeUndefined();

    // Không có phần tử <img>/<script> thật sự được trình duyệt parse ra từ
    // nội dung feed (nếu bị dangerouslySetInnerHTML thì các phần tử này có
    // thật trong DOM; sau khi sửa chỉ còn lại text node chứa ký tự "<img").
    await expect(page.locator("img[onerror]")).toHaveCount(0);
    await expect(page.locator("script:has-text('__e2eXssFired')")).toHaveCount(0);

    // Nội dung vẫn hiển thị cho người xem — dạng text thuần, không bị âm
    // thầm xoá mất (đúng yêu cầu "escape... theo danh sách định dạng cho
    // phép", không phải "ẩn luôn cả dòng").
    await expect(page.getByText(/E2E-XSS-TEST.*bị từ chối/)).toBeVisible();
  });
});

test.describe("SUP-04 / SUP-05 / SUP-09 — phạm vi riêng tư yêu cầu hỗ trợ", () => {
  test("SUP-09: người không liên quan không đọc được support_requests của người khác qua truy vấn trực tiếp", async ({
    page,
  }) => {
    // 3 lượt đăng nhập nối tiếp trong 1 test — nới timeout để không bị báo
    // sai do dev server phản hồi chậm khi có nhiều tiến trình test khác
    // chạy song song trong cùng máy (không liên quan tới đúng/sai logic).
    test.setTimeout(90000);
    // Lan Chi tạo 1 yêu cầu gửi tới quản lý Minh Đức (gọi RPC trực tiếp,
    // không qua UI, để tách biệt khỏi việc form có ẩn đúng hay không).
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    const lanChiToken = await getAccessToken(page);
    const marker = `E2E-PRIVACY-${Date.now()}`;
    const created = await rpcCall(lanChiToken, "create_support_request", {
      p_type: "ho_tro_quan_ly",
      p_target_id: MINH_DUC_MANAGER_ID,
      p_content: marker,
    });
    expect(created.status).toBe(200);
    const requestId = created.body as string;
    expect(typeof requestId).toBe("string");

    try {
      // Chính người tạo đọc được yêu cầu của mình.
      const ownView = await restSelect(lanChiToken, "support_requests", `id=eq.${requestId}&select=id,content`);
      expect(ownView.body).toHaveLength(1);

      // Một Chiến Sỹ khác — không phải người gửi, không phải người nhận,
      // không phải CEO — truy vấn thẳng bảng support_requests theo cùng id:
      // RLS phải trả về rỗng (SUP-09 AC1: "không trả về dữ liệu").
      await loginAs(page, ACCOUNTS.chienSyHoangLong.phone);
      const strangerToken = await getAccessToken(page);
      const strangerView = await restSelect(
        strangerToken,
        "support_requests",
        `id=eq.${requestId}&select=id,content`,
      );
      expect(strangerView.body).toHaveLength(0);

      // CEO (quyền giám sát) vẫn đọc được — SUP-05 AC3.
      await loginAs(page, ACCOUNTS.ceo.phone);
      const ceoToken = await getAccessToken(page);
      const ceoView = await restSelect(ceoToken, "support_requests", `id=eq.${requestId}&select=id,content`);
      expect(ceoView.body).toHaveLength(1);
    } finally {
      // Dọn dẹp dữ liệu test — huỷ yêu cầu vừa tạo (soft-cancel, không xoá
      // hẳn để không phá vỡ SUP-07: huỷ vẫn tính vào hạn mức tháng).
      await rpcCall(lanChiToken, "cancel_support_request", { p_request_id: requestId });
    }
  });
});

test.describe("BON-01 — cấu hình quỹ thưởng chỉ dành cho CEO", () => {
  test("BON-01: người không phải CEO không đọc được app_config bonus_pool qua truy vấn trực tiếp", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    const staffToken = await getAccessToken(page);
    const staffView = await restSelect(staffToken, "app_config", "key=eq.bonus_pool&select=key,value");
    expect(staffView.body).toHaveLength(0);

    await loginAs(page, ACCOUNTS.ceo.phone);
    const ceoToken = await getAccessToken(page);
    const ceoView = await restSelect(ceoToken, "app_config", "key=eq.bonus_pool&select=key,value");
    expect(ceoView.body).toHaveLength(1);
  });

  test("BON-02: set_bonus_config từ chối chu kỳ không hợp lệ và quỹ âm tại server", async ({ page }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    const ceoToken = await getAccessToken(page);

    const badMonths = await rpcCall(ceoToken, "set_bonus_config", { p_pool: 100, p_months: 4 });
    expect(badMonths.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(badMonths.body)).toContain("3 hoặc 6 tháng");

    const badPool = await rpcCall(ceoToken, "set_bonus_config", { p_pool: -1, p_months: 6 });
    expect(badPool.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(badPool.body)).toContain("không âm");
  });
});

test.describe("SUP-01 / SUP-02 / SUP-03 — kiểm soát tạo yêu cầu tại server", () => {
  test("SUP-02: không thể gửi yêu cầu hỗ trợ-quản-lý tới một Chiến Sỹ (sai loại vai trò người nhận)", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    const token = await getAccessToken(page);
    const res = await rpcCall(token, "create_support_request", {
      p_type: "ho_tro_quan_ly",
      p_target_id: HOANG_LONG_STAFF_ID, // Chiến Sỹ, không phải quản lý — phải bị RPC từ chối
      p_content: "E2E-SUP02-invalid-target",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(res.body)).toContain("quản lý");
  });

  test("SUP-03: RPC từ chối tạo yêu cầu khi vượt hạn mức 4 yêu cầu/tháng", async ({ page }) => {
    // Môi trường demo dùng chung — tài khoản này có thể đã có sẵn vài yêu
    // cầu trong tháng (từ dữ liệu demo hoặc test khác chạy song song), nên
    // test không giả định hạn mức bắt đầu từ 0. Thay vào đó cứ tạo liên tiếp
    // tới khi server từ chối, rồi kiểm tra đúng ĐÓ là từ chối do hạn mức
    // (không phải lỗi khác), và việc từ chối xảy ra trong vòng tối đa 4 lần
    // tạo thành công kể từ baseline — đúng tinh thần AC2 mà không phụ thuộc
    // trạng thái tuyệt đối của dữ liệu demo dùng chung.
    await loginAs(page, ACCOUNTS.chienSyThanhVan.phone);
    const token = await getAccessToken(page);
    const createdIds: string[] = [];
    try {
      let rejected: { status: number; body: unknown } | null = null;
      for (let i = 0; i < 6 && !rejected; i++) {
        const res = await rpcCall(token, "create_support_request", {
          p_type: "ho_tro_quan_ly",
          p_target_id: DINH_PHUC_MANAGER_ID,
          p_content: `E2E-QUOTA-TEST-${i}`,
        });
        if (res.status === 200) {
          createdIds.push(res.body as string);
        } else {
          rejected = res;
        }
      }

      expect(rejected, "server phải từ chối trước khi tạo tới lần thứ 6 trong tháng").not.toBeNull();
      expect(rejected!.status).toBeGreaterThanOrEqual(400);
      expect(JSON.stringify(rejected!.body)).toContain("giới hạn 4 yêu cầu");
      // Không được tạo thành công quá 4 yêu cầu kể từ baseline trước khi bị chặn.
      expect(createdIds.length).toBeLessThanOrEqual(4);
    } finally {
      for (const id of createdIds) {
        await rpcCall(token, "cancel_support_request", { p_request_id: id });
      }
    }
  });
});

test.describe("FEE-06 — cẩm nang đọc được cho mọi vai trò", () => {
  test("FEE-06: Tư Lệnh đọc được cẩm nang (không còn giới hạn CEO_ONLY)", async ({ page }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/guide");
    await expect(page).toHaveURL(/\/guide$/);
    await expect(page.getByText("Đơn vị đo & ý nghĩa")).toBeVisible();
  });

  test("FEE-06: Chiến Sỹ đọc được cẩm nang (không còn giới hạn CEO_ONLY)", async ({ page }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await page.goto("/guide");
    await expect(page).toHaveURL(/\/guide$/);
    await expect(page.getByText("Đơn vị đo & ý nghĩa")).toBeVisible();
  });
});

test.describe("BON-03 — công thức phân bổ không chia cho 0", () => {
  test("BON-03: trang Quỹ thưởng tải được và không hiển thị NaN/Infinity khi có dữ liệu", async ({ page }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/bonus");
    await expect(page.getByText("Bảng chia thưởng cuối kỳ")).toBeVisible();
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("NaN");
    expect(bodyText).not.toContain("Infinity");
  });
});
