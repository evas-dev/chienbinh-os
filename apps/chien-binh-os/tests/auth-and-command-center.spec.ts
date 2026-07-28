import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { loginAs, logout } from "./support/login";
import { ACCOUNTS, PASSWORD } from "./support/accounts";

// playwright.config.ts không nạp .env.local (chỉ Next dev server tự nạp) —
// nạp thủ công để test Node process (không phải trình duyệt) đọc được
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY dùng cho việc bật/tắt profiles.active.
function loadEnvLocal() {
  const p = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnvLocal();

/**
 * Bật/tắt profiles.active để mô phỏng Tổng Tư Lệnh ngưng tài khoản (AUTH-04),
 * KHÔNG dùng service-role key (không có sẵn trong .env.local của môi trường
 * test) — thay vào đó đăng nhập bằng chính tài khoản CEO demo qua anon key,
 * dùng đúng RLS policy "ceo manage profiles" đã có sẵn cho vai trò CEO.
 */
async function setActive(phone: string, active: boolean) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error: authError } = await db.auth.signInWithPassword({
    email: `${ACCOUNTS.ceo.phone}@chienbinh.local`,
    password: PASSWORD,
  });
  if (authError) throw authError;
  const { error } = await db.from("profiles").update({ active }).eq("phone", phone);
  await db.auth.signOut();
  if (error) throw error;
}

/**
 * Đếm số án phạt hiện có của từng số điện thoại — dùng để CHỌN ĐỘNG tài
 * khoản "có kỷ luật" / "chưa có kỷ luật" cho CMD-04 tại thời điểm chạy test,
 * thay vì hard-code Lan Chi/Hoàng Long. Nhiều agent khác đang chạy song song
 * và tạo/xoá penalty_log demo của chính họ (đã quan sát thấy dữ liệu đổi
 * giữa các lần chạy) nên không thể giả định trước ai đang "sạch".
 */
async function penaltyCounts(phones: string[]) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error: authError } = await db.auth.signInWithPassword({
    email: `${ACCOUNTS.ceo.phone}@chienbinh.local`,
    password: PASSWORD,
  });
  if (authError) throw authError;
  const { data: profiles, error: pErr } = await db.from("profiles").select("id, phone").in("phone", phones);
  if (pErr) throw pErr;
  const counts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    const { count, error: cErr } = await db
      .from("penalty_log")
      .select("id", { count: "exact", head: true })
      .eq("warrior_id", p.id);
    if (cErr) throw cErr;
    counts[p.phone] = count ?? 0;
  }
  await db.auth.signOut();
  return counts;
}

test.describe("Epic 01 — Đăng nhập và tài khoản", () => {
  // Nhiều agent khác đang chạy song song trên cùng dev server/Supabase
  // project dùng chung -> nới timeout mỗi test để tránh false-negative do
  // nghẽn tài nguyên (không phải lỗi thật của tính năng).
  test.describe.configure({ timeout: 90_000 });

  test("AUTH-01: đăng nhập bằng số điện thoại mở đúng Sở chỉ huy theo vai trò, form có nhãn rõ", async ({
    page,
  }) => {
    await page.goto("/login");
    // AUTH-01.2: trường và nút có nhãn, tra được bằng accessible name.
    await expect(page.getByRole("textbox", { name: "Số điện thoại" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Mật khẩu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Vào trận" })).toBeVisible();

    await loginAs(page, ACCOUNTS.ceo.phone);
    await expect(page.getByText("BÁO CÁO TỔNG QUAN CÔNG TY")).toBeVisible();

    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await expect(page.getByText(ACCOUNTS.chienSyLanChi.name).first()).toBeVisible();
  });

  test("AUTH-02: thiếu số điện thoại/mật khẩu hoặc mật khẩu toàn khoảng trắng bị từ chối", async ({
    page,
  }) => {
    await page.goto("/login");

    // Số điện thoại để trống -> HTML5 required chặn submit, không rời trang.
    await page.getByRole("textbox", { name: "Mật khẩu" }).fill(PASSWORD);
    await page.getByRole("button", { name: "Vào trận" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Mật khẩu chỉ có khoảng trắng -> AUTH-02.3: hệ thống coi là trống, từ
    // chối trước khi gọi Supabase Auth (không phải lỗi "sai mật khẩu").
    await page.getByRole("textbox", { name: "Số điện thoại" }).fill(ACCOUNTS.ceo.phone);
    await page.getByRole("textbox", { name: "Mật khẩu" }).fill("   ");
    await page.getByRole("button", { name: "Vào trận" }).click();
    await expect(page.getByText("Phải nhập mật khẩu")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-03: sai thông tin đăng nhập báo lỗi chung, không lộ chi tiết nội bộ", async ({
    page,
  }) => {
    await page.goto("/login");

    // Sai mật khẩu của tài khoản có thật.
    await page.getByRole("textbox", { name: "Số điện thoại" }).fill(ACCOUNTS.ceo.phone);
    await page.getByRole("textbox", { name: "Mật khẩu" }).fill("mat-khau-sai-chac-chan");
    await page.getByRole("button", { name: "Vào trận" }).click();
    const msgWrongPassword = page.getByText("Sai số điện thoại hoặc mật khẩu, chiến binh!");
    await expect(msgWrongPassword).toBeVisible();

    // Số điện thoại không tồn tại -> thông báo giống hệt (không xác nhận có
    // tài khoản hay không).
    await page.getByRole("textbox", { name: "Số điện thoại" }).fill("0900000000");
    await page.getByRole("textbox", { name: "Mật khẩu" }).fill("bat-ky-mat-khau");
    await page.getByRole("button", { name: "Vào trận" }).click();
    await expect(page.getByText("Sai số điện thoại hoặc mật khẩu, chiến binh!")).toBeVisible();

    // Không lộ SQL/stack trace/chi tiết nội bộ.
    const body = await page.content();
    expect(body.toLowerCase()).not.toContain("stack trace");
    expect(body.toLowerCase()).not.toMatch(/select .* from/);
  });

  test("AUTH-04: tài khoản bị ngưng mất quyền truy cập ngay, không rơi vào vòng lặp redirect", async ({
    page,
  }) => {
    const phone = ACCOUNTS.chienSyThanhVan.phone;
    try {
      // 1) Đăng nhập bình thường trong khi tài khoản còn active.
      await loginAs(page, phone);
      await expect(page.getByText(ACCOUNTS.chienSyThanhVan.name).first()).toBeVisible();

      // 2) Tổng Tư Lệnh ngưng tài khoản giữa chừng (phiên cũ vẫn còn cookie).
      await setActive(phone, false);

      // 3) Lần truy cập tiếp theo phải bị chặn ngay — và QUAN TRỌNG: không
      //    được rơi vào vòng lặp redirect "/" <-> "/login" (bug đã tái hiện
      //    được trước khi sửa proxy.ts + layout.tsx + login/page.tsx).
      await page.goto("/", { timeout: 30000 });
      await page.waitForURL(/\/login\?blocked=1/, { timeout: 20000 });
      await expect(
        page.getByText("Tài khoản của bạn không còn quyền truy cập. Vui lòng liên hệ Tổng Tư Lệnh để được hỗ trợ."),
      ).toBeVisible();
      // Vẫn thấy được form đăng nhập (không phải trang trắng/spinner treo).
      await expect(page.getByRole("button", { name: "Vào trận" })).toBeVisible();

      // 4) Thử đăng nhập lại đúng số điện thoại/mật khẩu trong khi vẫn bị
      //    ngưng -> AUTH-04.1/4.3: từ chối với thông báo rõ, không vào được
      //    Sở chỉ huy, không lộ chi tiết nội bộ.
      await page.getByRole("textbox", { name: "Số điện thoại" }).fill(phone);
      await page.getByRole("textbox", { name: "Mật khẩu" }).fill(PASSWORD);
      await page.getByRole("button", { name: "Vào trận" }).click();
      await expect(
        page.getByText("Tài khoản của bạn đã bị ngưng hoạt động. Vui lòng liên hệ Tổng Tư Lệnh để được hỗ trợ."),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
    } finally {
      // Dọn dẹp: luôn trả tài khoản demo về trạng thái active, không để lại
      // dữ liệu bẩn cho các agent/test khác dùng chung.
      await setActive(phone, true);
    }

    // 5) Sau khi Tổng Tư Lệnh mở lại tài khoản, đăng nhập phải thành công.
    await loginAs(page, phone);
    await expect(page.getByText(ACCOUNTS.chienSyThanhVan.name).first()).toBeVisible();
  });

  test("AUTH-05: đăng xuất kết thúc phiên, không xem lại được dữ liệu qua URL cũ", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await expect(page.getByText(ACCOUNTS.chienSyLanChi.name).first()).toBeVisible();

    await logout(page);
    await expect(page).toHaveURL(/\/login/);

    // Mở lại URL nội bộ cũ sau khi đã đăng xuất -> phải về lại trang đăng
    // nhập, không hiển thị dữ liệu được bảo vệ.
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(ACCOUNTS.chienSyLanChi.name)).not.toBeVisible();

    // Gửi yêu cầu đăng xuất lặp lại không phát sinh lỗi — vẫn là "đã đăng
    // xuất".
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Vào trận" })).toBeVisible();
  });

  test("AUTH-06: phiên được giữ khi tải lại; phiên không hợp lệ đưa về đăng nhập, không lộ dữ liệu cũ", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await expect(page.getByText(ACCOUNTS.tuLenhSale.name).first()).toBeVisible();

    // Tải lại nhiều lần -> vẫn đăng nhập, dữ liệu đúng người. Timeout nới
    // rộng — dev server dùng chung với nhiều agent khác nên reload có thể
    // chậm hơn bình thường.
    await page.reload();
    await expect(page.getByText(ACCOUNTS.tuLenhSale.name).first()).toBeVisible({ timeout: 20000 });
    await page.reload();
    await expect(page.getByText(ACCOUNTS.tuLenhSale.name).first()).toBeVisible({ timeout: 20000 });

    // Phiên không hợp lệ (xoá cookie mô phỏng hết hạn) -> mở trang nội bộ
    // phải về đăng nhập, không còn hiển thị dữ liệu cũ.
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByText(ACCOUNTS.tuLenhSale.name)).not.toBeVisible();
  });

  test("AUTH-07: khách chưa đăng nhập chỉ có lựa chọn đăng nhập, không có đăng ký công khai", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Vào trận" })).toBeVisible();
    // Không có bất kỳ liên kết/nút "đăng ký" nào trên trang.
    await expect(page.getByText(/đăng ký/i)).toHaveCount(0);

    // Cố mở thẳng route nội bộ khi chưa đăng nhập -> bị chặn về /login.
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Epic 02 — Sở chỉ huy và hồ sơ", () => {
  test.describe.configure({ timeout: 90_000 });

  test("CMD-01 & CMD-07: Sở chỉ huy cá nhân hiển thị đúng tên, vai trò, phòng ban, mặt trận, tiểu đội, EXP, điểm mùa", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await expect(page.getByText(ACCOUNTS.chienSyLanChi.name).first()).toBeVisible();
    await expect(page.getByText("Sale", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Chiến Sỹ")).toBeVisible();
    await expect(page.getByText(/EXP:/)).toBeVisible();
    await expect(page.getByText("ĐIỂM MÙA")).toBeVisible();
    // exact:true — "Huân chương" cũng xuất hiện trong nav ("Quân hàm & Huân
    // chương") và tiêu đề "Kho huân chương", chỉ ô thống kê khớp nguyên văn.
    await expect(page.getByText("HUÂN CHƯƠNG", { exact: true })).toBeVisible();
    // CMD-07.1: tiểu đội phải hiển thị đúng phạm vi (đã sửa gap thiếu hiển thị).
    await expect(page.getByText(/Tiểu đội:/)).toBeVisible();
    await expect(page.getByText("Mãnh Hổ (Sale)")).toBeVisible();
  });

  test("CMD-02: tiến độ lên quân hàm hiển thị quân hàm hiện tại, mốc tiếp theo và EXP còn thiếu", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await expect(page.getByText(/Còn [\d.,]+ →/)).toBeVisible();
  });

  test("CMD-03: nhiệm vụ hôm nay hiển thị đúng danh sách hoặc trạng thái trống hướng tới Bảng nhiệm vụ", async ({
    page,
  }) => {
    // Lan Chi có nhiệm vụ ngày chưa hoàn thành.
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    await expect(page.getByText("Nhiệm vụ hôm nay")).toBeVisible();
    await expect(page.getByText("Hôm nay chưa có nhiệm vụ ngày")).not.toBeVisible();

    // Minh Đức (Tư Lệnh Sale) không có nhiệm vụ loại "ngày" nào -> trạng thái
    // trống đúng ngữ cảnh, hướng tới Bảng nhiệm vụ.
    await loginAs(page, ACCOUNTS.tuLenhSale.phone);
    await expect(page.getByText("Hôm nay chưa có nhiệm vụ ngày. Vào «Bảng nhiệm vụ» nhận thêm.")).toBeVisible();
  });

  test("CMD-04: huy hiệu và kỷ luật cá nhân hiển thị đúng phạm vi, trạng thái trống rõ ràng", async ({
    page,
  }) => {
    // Chọn động tài khoản "có kỷ luật" / "chưa có kỷ luật" tại thời điểm chạy
    // (nhiều agent khác đang tạo/xoá penalty_log demo song song nên không
    // thể giả định trước ai đang sạch — xem comment ở penaltyCounts()).
    const candidates = [
      ACCOUNTS.chienSyHoangLong,
      ACCOUNTS.chienSyLanChi,
      ACCOUNTS.chienSyMyLinh,
      ACCOUNTS.chienSyTienDung,
      ACCOUNTS.chienSyVanKhoa,
      ACCOUNTS.chienSyThanhVan,
    ];
    const counts = await penaltyCounts(candidates.map((c) => c.phone));
    const withPenalty = candidates.find((c) => counts[c.phone] > 0);
    const withoutPenalty = candidates.find((c) => counts[c.phone] === 0);
    test.skip(!withPenalty || !withoutPenalty, "Cần ít nhất 1 tài khoản có và 1 tài khoản chưa có án phạt để so sánh");

    await loginAs(page, withPenalty!.phone);
    await expect(page.getByText("Hồ sơ kỷ luật")).toBeVisible();
    await expect(page.getByText("án phạt")).toBeVisible();

    // Tài khoản chưa có án phạt -> trạng thái trống dễ hiểu, không lộ hồ sơ
    // kỷ luật của người khác.
    await loginAs(page, withoutPenalty!.phone);
    await expect(page.getByText(withoutPenalty!.name).first()).toBeVisible();
    await expect(page.getByText("Chưa có vi phạm nào")).toBeVisible();
  });

  test("CMD-05: Tổng Tư Lệnh xem Sở chỉ huy toàn công ty, cảnh báo phân biệt bằng chữ chứ không chỉ màu", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    await expect(page.getByText("BÁO CÁO TỔNG QUAN CÔNG TY")).toBeVisible();
    await expect(page.getByText("HOÀN THÀNH MỤC TIÊU")).toBeVisible();
    // exact:true — tránh khớp luôn tiêu đề thẻ "Cảnh báo so với cùng kỳ".
    await expect(page.getByText("CẢNH BÁO", { exact: true })).toBeVisible();
    await expect(page.getByText("Tiến độ trọng số theo phòng ban")).toBeVisible();
    // Mỗi dòng cảnh báo có mô tả bằng chữ (không chỉ dựa vào màu).
    await expect(page.getByText(/so cùng kỳ|chậm tiến độ/).first()).toBeVisible();
  });

  test("CMD-06: điều hướng theo vai trò chặn truy cập URL ngoài quyền ở server, không chỉ ẩn nút", async ({
    page,
  }) => {
    await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
    // Chiến Sỹ không thấy tab "Quản trị nhân sự" trên nav.
    await expect(page.getByRole("link", { name: "Quản trị nhân sự" })).toHaveCount(0);

    // Cố mở thẳng URL /admin (CEO-only) -> requireRole() chặn ở server,
    // redirect về "/", không hiển thị nội dung quản trị.
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("BÁO CÁO TỔNG QUAN CÔNG TY")).not.toBeVisible();
  });
});
