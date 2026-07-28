import { test, expect } from "@playwright/test";
import { loginAs } from "./support/login";
import { ACCOUNTS } from "./support/accounts";

/**
 * Epic 09 (Khen thưởng) + Epic 10 (Kỷ luật) — chứng minh các gap đã đóng.
 *
 * Bối cảnh phạm vi dùng trong test (xem tests/support/accounts.ts):
 *  - tuLenhSale: front tien_tuyen — quản lý mọi Chiến Sỹ front tien_tuyen
 *    (Lan Chi, Hoàng Long, Mỹ Linh, Tiến Dũng), KHÔNG quản lý front hau_phuong.
 *  - tuLenhDev: front hau_phuong — quản lý Văn Khoa (Dev, hau_phuong).
 *
 * Mỗi test dùng một cặp (nhân sự, huy hiệu/lý do) riêng để không đụng dữ liệu
 * của test khác trong cùng lần chạy (config chạy tuần tự, workers: 1).
 *
 * Dữ liệu do các test này tạo ra (đề xuất/án phạt gắn nhãn "QA Playwright")
 * được dọn dẹp bằng SQL sau khi chạy — xem báo cáo cuối phiên làm việc.
 */

test.describe("REW-01: Đề xuất khen thưởng trong phạm vi", () => {
  test("Tư Lệnh không thấy chính mình trong danh sách đề xuất khen (chặn tự đề xuất)", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/commend");
    await page.getByRole("button", { name: "Đề xuất khen" }).click();
    await page.getByRole("combobox").first().click();
    await expect(page.getByRole("option", { name: ACCOUNTS.tuLenhSale.name })).toHaveCount(0);
    await expect(
      page.getByRole("option", { name: ACCOUNTS.chienSyLanChi.name, exact: false }),
    ).toBeVisible();
  });

  test("Đề xuất khen cho nhân sự cùng mặt trận vẫn hoạt động bình thường", async ({ page }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/commend");
    await page.getByRole("button", { name: "Đề xuất khen" }).click();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: ACCOUNTS.chienSyHoangLong.name, exact: false }).click();
    await page
      .getByPlaceholder("Vì sao xứng đáng được khen")
      .fill("QA Playwright REW-01: đề xuất hợp lệ trong phạm vi");
    await page.getByRole("button", { name: "Gửi đề xuất" }).click();
    await expect(page.getByText("Đã gửi đề xuất")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("QA Playwright REW-01: đề xuất hợp lệ trong phạm vi")).toBeVisible();
  });
});

test.describe("REW-02: Duyệt đề xuất khen thưởng và ngăn xử lý trùng", () => {
  test("CEO duyệt một đề xuất -> chuyển trạng thái Đã trao, nút Trao/Từ chối biến mất (không thể duyệt lại)", async ({
    page,
  }) => {
    // Bước 1: Tư Lệnh tạo đề xuất mới cho Tiến Dũng, huy hiệu Dao Găm (chưa sở hữu).
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/commend");
    await page.getByRole("button", { name: "Đề xuất khen" }).click();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: ACCOUNTS.chienSyTienDung.name, exact: false }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "Dao Găm", exact: false }).click();
    await page
      .getByPlaceholder("Vì sao xứng đáng được khen")
      .fill("QA Playwright REW-02: chờ CEO duyệt");
    await page.getByRole("button", { name: "Gửi đề xuất" }).click();
    await expect(page.getByText("Đã gửi đề xuất")).toBeVisible({ timeout: 10000 });

    // Bước 2: CEO duyệt đề xuất đó. Scope theo class gốc của CommendRow (chứ
    // không phải bất kỳ <div> tổ tiên nào) để chắc chắn lấy đúng cả hàng gồm
    // nút Trao/Từ chối, không phải div lá chỉ chứa dòng lý do.
    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/commend");
    const row = page.locator(".border-cb-line-soft", {
      hasText: "QA Playwright REW-02: chờ CEO duyệt",
    });
    await row.getByRole("button", { name: "Trao" }).click();
    await expect(page.getByText("Đã trao huân chương")).toBeVisible({ timeout: 10000 });

    // Bước 3: sau khi duyệt, hàng chuyển "Đã trao" và không còn nút Trao/Từ
    // chối nữa -> không thể tự ý duyệt/ từ chối lần hai qua UI; RPC cũng chặn
    // ở tầng server (status != 'cho_duyet' thì raise exception).
    await page.reload();
    const approvedRow = page.locator(".border-cb-line-soft", {
      hasText: "QA Playwright REW-02: chờ CEO duyệt",
    });
    await expect(approvedRow.getByText("Đã trao")).toBeVisible();
    await expect(approvedRow.getByRole("button", { name: "Trao" })).toHaveCount(0);
  });
});

test.describe("REW-04: Ngăn đề xuất khen trùng cho cùng người + huy hiệu", () => {
  test("Đề xuất lại đúng người + huy hiệu đang chờ duyệt -> dẫn tới đề xuất hiện có, không tạo bản ghi mới", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/commend");

    async function propose(reason: string) {
      await page.getByRole("button", { name: "Đề xuất khen" }).click();
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: ACCOUNTS.chienSyMyLinh.name, exact: false }).click();
      // Giữ nguyên huy hiệu mặc định (option đầu) ở cả hai lần gửi.
      await page.getByPlaceholder("Vì sao xứng đáng được khen").fill(reason);
      await page.getByRole("button", { name: "Gửi đề xuất" }).click();
    }

    await propose("QA Playwright REW-04: lần gửi đầu tiên");
    await expect(page.getByText("Đã gửi đề xuất")).toBeVisible({ timeout: 10000 });
    // expect(...).toHaveCount() tự động chờ Server Component render lại sau
    // revalidatePath — không dùng .count() snapshot tức thời (dễ đọc trước
    // khi DOM cập nhật xong và gây false negative).
    await expect(page.locator("text=QA Playwright REW-04")).toHaveCount(1);

    // Gửi lại y hệt người + huy hiệu khi đề xuất trước vẫn "cho_duyet" -> RPC
    // trả về id đề xuất hiện có (không lỗi) nhưng KHÔNG tạo thêm hàng mới.
    await propose("QA Playwright REW-04: lần gửi thứ hai — phải trỏ về đề xuất cũ");
    await expect(page.getByText("Đã gửi đề xuất").last()).toBeVisible({ timeout: 10000 });
    // Đợi ổn định rồi xác nhận vẫn chỉ có đúng 1 hàng (không tăng lên 2).
    await page.waitForTimeout(800);
    await expect(page.locator("text=QA Playwright REW-04")).toHaveCount(1);
  });
});

test.describe("PEN-02: Áp dụng xử phạt đúng phạm vi", () => {
  test("Danh sách chọn xử phạt của Tư Lệnh không có chính mình và không có người khác mặt trận", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/penalty");
    await page.getByRole("combobox").first().click();
    await expect(page.getByRole("option", { name: ACCOUNTS.tuLenhSale.name })).toHaveCount(0);
    await expect(page.getByRole("option", { name: ACCOUNTS.chienSyVanKhoa.name })).toHaveCount(0);
    await expect(
      page.getByRole("option", { name: ACCOUNTS.chienSyLanChi.name, exact: false }),
    ).toBeVisible();
  });

  test("CEO thấy đầy đủ nhân sự mọi mặt trận trong danh sách chọn xử phạt", async ({ page }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/penalty");
    await page.getByRole("combobox").first().click();
    await expect(
      page.getByRole("option", { name: ACCOUNTS.chienSyLanChi.name, exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("option", { name: ACCOUNTS.chienSyVanKhoa.name, exact: false }),
    ).toBeVisible();
  });
});

test.describe("PEN-05: Ngăn xử phạt trùng", () => {
  test("Gửi hai lần y hệt liên tiếp (giống double-submit do mất kết nối) chỉ tạo một án phạt", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/penalty");

    const reason = `QA Playwright PEN-05 dup ${Date.now()}`;

    async function submitPenalty() {
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: ACCOUNTS.chienSyLanChi.name, exact: false }).click();
      await page.getByPlaceholder("Mô tả ngắn gọn vi phạm").fill(reason);
      await page.getByRole("button", { name: "Ra quyết định phạt" }).click();
    }

    await submitPenalty();
    await expect(page.getByText("Đã xử phạt")).toBeVisible({ timeout: 10000 });

    // Gửi lại NGAY với y hệt tham số (giả lập double-submit). RPC coi đây là
    // idempotent no-op (return sớm, không raise) -> action vẫn trả ok:true,
    // toast vẫn "Đã xử phạt" (không phải toast lỗi trùng).
    await submitPenalty();
    await expect(page.getByText("Đã xử phạt").last()).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500);
    const rowCount = await page.locator(`text=${reason}`).count();
    expect(rowCount).toBe(1);
  });

  test("Tái phạm với lý do khác (bằng chứng vụ việc mới) vẫn được ghi nhận như một án phạt riêng", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhDev.phone);
    await page.goto("/penalty");

    const reason1 = `QA Playwright PEN-05 recidivism v1 ${Date.now()}`;
    const reason2 = `QA Playwright PEN-05 recidivism v2 — vụ việc mới ${Date.now()}`;

    async function submitPenalty(reason: string) {
      await page.getByRole("combobox").first().click();
      await page.getByRole("option", { name: ACCOUNTS.chienSyVanKhoa.name, exact: false }).click();
      await page.getByPlaceholder("Mô tả ngắn gọn vi phạm").fill(reason);
      await page.getByRole("button", { name: "Ra quyết định phạt" }).click();
    }

    await submitPenalty(reason1);
    await expect(page.getByText("Đã xử phạt")).toBeVisible({ timeout: 10000 });

    await submitPenalty(reason2);
    await expect(page.getByText("Đã xử phạt").last()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(reason2, { exact: false })).toBeVisible();
  });
});

test.describe("PEN-08 / REW-09: Phạm vi xem lịch sử theo mặt trận (RLS)", () => {
  test("Tư Lệnh mặt trận tiền tuyến không thấy án phạt của mặt trận hậu phương trong sổ ghi án", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await page.goto("/penalty");
    // Văn Khoa thuộc mặt trận hậu phương (quản lý bởi tuLenhDev) — tuLenhSale
    // (tiền tuyến) không được thấy tên anh ấy trong sổ ghi án dù vừa bị phạt
    // ở test PEN-05 phía trên.
    await expect(page.getByText(ACCOUNTS.chienSyVanKhoa.name)).toHaveCount(0);
  });

  test("CEO thấy toàn bộ sổ ghi án không giới hạn mặt trận", async ({ page }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/penalty");
    await expect(page.getByText("Sổ ghi án phạt")).toBeVisible();
    await expect(page.getByText(ACCOUNTS.chienSyVanKhoa.name).first()).toBeVisible();
  });
});

test.describe("REW-11 / PEN-11: Trạng thái trống và lỗi tải dữ liệu", () => {
  test("Trang khen thưởng tải thành công, không hiển thị lỗi giả", async ({ page }) => {
    await loginAs(page, ACCOUNTS.tuLenhCSKH.phone);
    await page.goto("/commend");
    await expect(page.getByText("Đề xuất của tôi")).toBeVisible();
    await expect(page.getByText("Không tải được dữ liệu khen thưởng")).toHaveCount(0);
  });

  test("Trang xử phạt tải thành công, không hiển thị lỗi giả", async ({ page }) => {
    await loginAs(page, ACCOUNTS.tuLenhKeToan.phone);
    await page.goto("/penalty");
    await expect(page.getByText("Danh mục xử phạt")).toBeVisible();
    await expect(page.getByText("Không tải được dữ liệu xử phạt")).toHaveCount(0);
  });
});
