import { test, expect, type Page } from "@playwright/test";
import { loginAs } from "./support/login";
import { ACCOUNTS } from "./support/accounts";
import { getAccessTokenForPhone, callRpc, rpcErrorMessage, restSelect, restPatch } from "./support/supabase-rpc";

/**
 * Fixture QA — chạy khối SETUP trong tests/support/qa-fixtures.sql qua
 * mcp__supabase__execute_sql TRƯỚC khi chạy nhóm test "ADM-08 & SQU-04/05/06"
 * bên dưới (test process chỉ có anon key, không tự tạo được auth.users).
 * Chạy khối TEARDOWN trong cùng file NGAY SAU khi suite chạy xong — không để
 * dept='QA' tồn tại lâu dài trong DB thật (sẽ hiện thành 1 tab phòng ban giả
 * trên /admin). Không đụng tới 12 tài khoản demo thật, ngoại trừ 1 test bắt
 * buộc phải dùng tài khoản thật để đăng nhập (kiểm tra phiên bị chặn sau khi
 * ngưng — xem test ADM-09 bên dưới), và test đó tự khôi phục trạng thái
 * active=true ngay sau khi kiểm tra xong.
 *
 * auth.users (chưa có profiles) — dùng làm p_user_id cho admin_create_warrior:
 *   u_admok = c7640c34-8824-49e2-9bbd-469cd593f7c6  (gán vào tiểu đội còn chỗ)
 *   u_full  = 825dd19a-3153-44b9-8a81-e8443374842e  (gán vào tiểu đội đã đầy)
 *
 * profiles hoàn chỉnh (front=tien_tuyen trừ p8), không thuộc tiểu đội nào:
 *   p4 = 58eb62a1-f569-44b7-9db7-f8dcdcc8bec8
 *   p5 = 6171eb91-f0fa-4a58-ad25-27afd1ec2484
 *   p6 = 115e7963-b328-426d-bed5-9f250b23e007
 *   p7 = 7d28a4f5-daa2-4dfa-8c2b-e0e8cf337cd2
 *   p8 = cd54b3c5-b674-4e46-888a-346421abb23a  (front=hau_phuong)
 *   raceA = e1f4ff6f-1fb0-4f61-b3b6-046af729b2eb
 *   raceB = 926472f1-931b-44b5-8496-63a2088bfbc7
 *
 * squads tạm:
 *   sq_qa_full  — đã đủ 3/3 thành viên phụ (p1,p2,p3)
 *   sq_qa_admok — rỗng
 *   sq_qa_cap   — rỗng (dùng để test tuần tự điền đầy + trùng + phạm vi)
 *   sq_qa_race  — đã có 2/3 (rf1,rf2), còn đúng 1 suất — dùng test race condition
 */
const FX = {
  uAdmOk: "c7640c34-8824-49e2-9bbd-469cd593f7c6",
  uFull: "825dd19a-3153-44b9-8a81-e8443374842e",
  p4: "58eb62a1-f569-44b7-9db7-f8dcdcc8bec8",
  p5: "6171eb91-f0fa-4a58-ad25-27afd1ec2484",
  p6: "115e7963-b328-426d-bed5-9f250b23e007",
  p7: "7d28a4f5-daa2-4dfa-8c2b-e0e8cf337cd2",
  p8: "cd54b3c5-b674-4e46-888a-346421abb23a",
  raceA: "e1f4ff6f-1fb0-4f61-b3b6-046af729b2eb",
  raceB: "926472f1-931b-44b5-8496-63a2088bfbc7",
  sqFull: "sq_qa_full",
  sqAdmOk: "sq_qa_admok",
  sqCap: "sq_qa_cap",
  sqRace: "sq_qa_race",
};

/**
 * Mỗi dòng nhân sự trong /admin là 1 div con trực tiếp của CardContent
 * (data-slot="card-content") — dùng combinator ">" để tránh khớp nhầm các
 * div lồng bên trong (vd div bọc tên) vốn KHÔNG chứa nút hành động cùng cấp.
 */
function staffRow(page: Page, name: string) {
  return page.locator('[data-slot="card-content"] > div').filter({ hasText: name });
}

// ============================================================================
// ADM-01 — Truy cập khu vực quản trị nhân sự
// ============================================================================

test("ADM-01: CEO mở khu vực quản trị nhân sự thấy danh sách và hành động", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto("/admin");
  await expect(page.getByRole("main").getByText("Quản trị nhân sự")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạo tài khoản" })).toBeVisible();
});

test("ADM-01: Tư Lệnh mở URL /admin trực tiếp bị từ chối tại server", async ({ page }) => {
  await loginAs(page, ACCOUNTS.tuLenhSale.phone);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);
});

test("ADM-01: Chiến Sỹ mở URL /admin trực tiếp bị từ chối tại server", async ({ page }) => {
  await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);
});

// ============================================================================
// ADM-02 — Xem danh sách nhân sự
// ============================================================================

test("ADM-02: danh sách hiển thị tên, vai trò, phòng ban, SĐT và trạng thái", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto(`/admin?dept=${encodeURIComponent(ACCOUNTS.tuLenhSale.dept)}`);
  await expect(page.getByText(ACCOUNTS.tuLenhSale.name)).toBeVisible();
  await expect(page.getByText(ACCOUNTS.tuLenhSale.phone)).toBeVisible();
  await expect(page.getByText("Đang hoạt động").first()).toBeVisible();
});

test("ADM-02: phòng ban không tồn tại hiển thị trạng thái trống, không phải lỗi", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto("/admin?dept=PhongBanKhongTonTai999");
  await expect(page.getByText("Chưa có nhân sự ở phòng này.")).toBeVisible();
});

// ============================================================================
// ADM-03 — Lọc nhân sự theo phòng ban
// ============================================================================

test("ADM-03: lọc theo phòng ban chỉ hiển thị đúng phòng đó", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto(`/admin?dept=${encodeURIComponent(ACCOUNTS.tuLenhDev.dept)}`);
  await expect(page.getByText(ACCOUNTS.tuLenhDev.name)).toBeVisible();
  await expect(page.getByText(ACCOUNTS.tuLenhSale.name)).not.toBeVisible();
});

test("ADM-03: tên phòng ban có dấu và khoảng trắng qua URL vẫn hoạt động đúng", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto(`/admin?dept=${encodeURIComponent(ACCOUNTS.tuLenhKeToan.dept)}`); // "Kế toán"
  await expect(page.getByRole("main").getByText("Quản trị nhân sự")).toBeVisible();
  await expect(page.getByText(ACCOUNTS.tuLenhKeToan.name)).toBeVisible();
});

// ============================================================================
// ADM-04/05/07 — Tạo tài khoản: từ chối trực tiếp API, validate, enum hợp lệ
// ============================================================================

const VALID_PAYLOAD = {
  name: "QA API Test",
  phone: "0909998888",
  password: "123456",
  dept: "Sale",
  front: "tien_tuyen",
  role: "chien_sy",
  squadId: null,
};

test("ADM-04.2: người không phải CEO gọi thẳng API tạo tài khoản bị từ chối", async ({ page }) => {
  await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
  const res = await page.request.post("/api/admin/create-staff", { data: VALID_PAYLOAD });
  expect(res.status()).toBe(403);
  const json = await res.json();
  expect(json.error).toContain("Tổng Tư Lệnh");
});

test("ADM-05.1: thiếu trường bắt buộc (phòng ban) bị từ chối", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  const payloadWithoutDept: Record<string, unknown> = { ...VALID_PAYLOAD };
  delete payloadWithoutDept.dept;
  const res = await page.request.post("/api/admin/create-staff", { data: payloadWithoutDept });
  expect(res.status()).toBe(400);
});

test("ADM-07.2: vai trò/mặt trận ngoài danh mục cho phép bị từ chối", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  const res = await page.request.post("/api/admin/create-staff", {
    data: { ...VALID_PAYLOAD, phone: "0909998889", role: "tong_tu_lenh" },
  });
  expect(res.status()).toBe(400);
});

test("ADM-05.3: dữ liệu khoảng trắng thừa được chuẩn hoá trước khi kiểm tra", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  // SĐT có khoảng trắng bao quanh nhưng đủ 8 ký tự sau khi trim — nếu hệ
  // thống trim TRƯỚC khi validate, sẽ đi qua được bước 400 và chỉ dừng lại ở
  // lỗi cấu hình service-role (500) — không phải lỗi "SĐT quá ngắn" (400).
  const res = await page.request.post("/api/admin/create-staff", {
    data: { ...VALID_PAYLOAD, name: "  Nguyễn QA  ", phone: "  09099999  " },
  });
  expect(res.status()).not.toBe(400);
});

test("ADM-04.3: CEO tạo tài khoản hợp lệ khi thiếu service-role key -> lỗi rõ ràng, không có dữ liệu nửa vời", async ({
  page,
}) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  const res = await page.request.post("/api/admin/create-staff", {
    data: { ...VALID_PAYLOAD, phone: "0909998890" },
  });
  // Môi trường test cố tình không cấu hình SUPABASE_SERVICE_ROLE_KEY — xác
  // nhận lỗi rõ ràng (không phải crash 500 không rõ nguyên nhân, và không
  // phải "thành công" giả).
  expect(res.status()).toBe(500);
  const json = await res.json();
  expect(json.error).toContain("SUPABASE_SERVICE_ROLE_KEY");
});

// ============================================================================
// ADM-08 — Gán tiểu đội khi tạo nhân sự (lỗi thật: trước đây chỉ ghi vào
// profiles.squad_id — cột không ai đọc để tính quân số/thành viên)
// ============================================================================

test.describe.serial("ADM-08 & SQU-04/05/06 — RPC trực tiếp (chưa có UI, hoặc cần bỏ qua service-role)", () => {
  let ceoToken: string;

  test.beforeAll(async () => {
    ceoToken = await getAccessTokenForPhone(ACCOUNTS.ceo.phone);
  });

  test("ADM-08.2: gán vào tiểu đội đã đầy quân số -> từ chối an toàn, không tạo dữ liệu nửa vời", async () => {
    const res = await callRpc(ceoToken, "admin_create_warrior", {
      p_user_id: FX.uFull,
      p_name: "QA Full Reject",
      p_phone: "0909990201",
      p_dept: "QA",
      p_front: "tien_tuyen",
      p_role: "chien_sy",
      p_squad_id: FX.sqFull,
    });
    expect(res.ok).toBeFalsy();
    expect(rpcErrorMessage(res.body)).toContain("đã đủ tối đa 3 thành viên phụ");

    // Toàn bộ giao dịch phải rollback — không được có profile "mồ côi" tạo ra
    // một nửa (có id nhưng sai/thiếu tiểu đội).
    const rows = await restSelect(ceoToken, "profiles", `id=eq.${FX.uFull}`);
    expect(rows.length).toBe(0);
  });

  test("ADM-08.1: gán vào tiểu đội còn chỗ -> ghi đúng vào squad_members (nguồn sự thật của quân số)", async () => {
    const res = await callRpc(ceoToken, "admin_create_warrior", {
      p_user_id: FX.uAdmOk,
      p_name: "QA AdmOk Success",
      p_phone: "0909990202",
      p_dept: "QA",
      p_front: "tien_tuyen",
      p_role: "chien_sy",
      p_squad_id: FX.sqAdmOk,
    });
    expect(res.ok).toBeTruthy();

    const profileRows = await restSelect(ceoToken, "profiles", `id=eq.${FX.uAdmOk}`);
    expect(profileRows.length).toBe(1);

    // Đây chính là điểm trước đây bị sai: phải THẤY dòng squad_members thật,
    // không chỉ cột profiles.squad_id (không ai đọc để tính quân số).
    const memberRows = await restSelect(
      ceoToken,
      "squad_members",
      `squad_id=eq.${FX.sqAdmOk}&warrior_id=eq.${FX.uAdmOk}`,
    );
    expect(memberRows.length).toBe(1);
  });

  test("ADM-09/ADM-10 (UI): CEO ngưng rồi kích hoạt lại tài khoản vừa tạo", async ({ page }) => {
    await loginAs(page, ACCOUNTS.ceo.phone);
    await page.goto("/admin?dept=QA");
    const row = staffRow(page, "QA AdmOk Success");
    await row.getByRole("button", { name: "Ngưng" }).click();
    await expect(page.getByText("Đã ngưng tài khoản")).toBeVisible();
    await expect(row.getByText("Đã ngưng")).toBeVisible();

    await row.getByRole("button", { name: "Kích hoạt" }).click();
    await expect(page.getByText("Đã kích hoạt lại")).toBeVisible();
    await expect(row.getByText("Đang hoạt động")).toBeVisible();
  });

  test("SQU-04.2: Tư Lệnh không được thao tác tiểu đội khác mặt trận của mình", async () => {
    const tuLenhDevToken = await getAccessTokenForPhone(ACCOUNTS.tuLenhDev.phone); // hau_phuong
    const res = await callRpc(tuLenhDevToken, "assign_squad_member", {
      p_squad_id: FX.sqCap, // tien_tuyen
      p_warrior_id: FX.p4,
      p_squad_role: "member",
    });
    expect(res.ok).toBeFalsy();
    expect(rpcErrorMessage(res.body)).toContain("mặt trận");
  });

  test("SQU-04.2: Tư Lệnh không được gán nhân sự khác mặt trận vào tiểu đội của mình", async () => {
    const tuLenhSaleToken = await getAccessTokenForPhone(ACCOUNTS.tuLenhSale.phone); // tien_tuyen
    const res = await callRpc(tuLenhSaleToken, "assign_squad_member", {
      p_squad_id: FX.sqCap, // tien_tuyen — cùng mặt trận người gọi
      p_warrior_id: FX.p8, // hau_phuong — khác mặt trận người gọi
      p_squad_role: "member",
    });
    expect(res.ok).toBeFalsy();
    expect(rpcErrorMessage(res.body)).toContain("mặt trận");
  });

  test("SQU-06.1: CEO điền đủ 3 thành viên phụ rồi bị từ chối ở người thứ 4", async () => {
    for (const warriorId of [FX.p4, FX.p5, FX.p6]) {
      const res = await callRpc(ceoToken, "assign_squad_member", {
        p_squad_id: FX.sqCap,
        p_warrior_id: warriorId,
        p_squad_role: "member",
      });
      expect(res.ok).toBeTruthy();
    }
    const rejected = await callRpc(ceoToken, "assign_squad_member", {
      p_squad_id: FX.sqCap,
      p_warrior_id: FX.p7,
      p_squad_role: "member",
    });
    expect(rejected.ok).toBeFalsy();
    expect(rpcErrorMessage(rejected.body)).toContain("đã đủ tối đa 3 thành viên phụ");
  });

  test("SQU-05.1: người đã thuộc một tiểu đội không được thêm vào tiểu đội khác", async () => {
    // p4 đã được gán vào sqCap ở test trước — thử gán tiếp vào sqAdmOk.
    const res = await callRpc(ceoToken, "assign_squad_member", {
      p_squad_id: FX.sqAdmOk,
      p_warrior_id: FX.p4,
      p_squad_role: "member",
    });
    expect(res.ok).toBeFalsy();
    expect(rpcErrorMessage(res.body)).toContain("đã thuộc một tiểu đội khác");
  });

  test("SQU-06.2: hai yêu cầu đồng thời vào suất cuối cùng — chỉ một được chấp nhận", async () => {
    // sqRace đã có sẵn 2/3 — đúng 1 suất còn lại. Gửi 2 yêu cầu song song.
    const [resA, resB] = await Promise.all([
      callRpc(ceoToken, "assign_squad_member", {
        p_squad_id: FX.sqRace,
        p_warrior_id: FX.raceA,
        p_squad_role: "member",
      }),
      callRpc(ceoToken, "assign_squad_member", {
        p_squad_id: FX.sqRace,
        p_warrior_id: FX.raceB,
        p_squad_role: "member",
      }),
    ]);
    const successCount = [resA, resB].filter((r) => r.ok).length;
    expect(successCount).toBe(1);

    const members = await restSelect(ceoToken, "squad_members", `squad_id=eq.${FX.sqRace}`);
    expect(members.length).toBe(3); // không được vượt trần 3 thành viên phụ
  });
});

// ============================================================================
// ADM-11 — Bảo vệ tài khoản cấp cao và tài khoản đang thao tác
// ============================================================================

test("ADM-11.1/11.2: CEO không thể tự ngưng chính mình (ẩn nút + chặn tại RPC)", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto("/admin?dept=__all__");
  const ceoRow = staffRow(page, ACCOUNTS.ceo.name);
  await expect(ceoRow.getByText("CEO")).toBeVisible();
  await expect(ceoRow.getByRole("button", { name: "Ngưng" })).toHaveCount(0);

  const ceoToken = await getAccessTokenForPhone(ACCOUNTS.ceo.phone);
  const ceoRows = await restSelect(ceoToken, "profiles", `phone=eq.${ACCOUNTS.ceo.phone}`);
  const ceoId = (ceoRows[0] as { id: string }).id;
  const res = await callRpc(ceoToken, "admin_set_active", {
    p_warrior_id: ceoId,
    p_active: false,
  });
  expect(res.ok).toBeFalsy();
  const msg = rpcErrorMessage(res.body);
  expect(msg === "Không thể tự khoá chính mình" || msg === "Không thể khoá tài khoản CEO").toBeTruthy();
});

test("ADM-11.3: người dùng thường không tự sửa role/active của chính mình qua REST trực tiếp", async () => {
  const token = await getAccessTokenForPhone(ACCOUNTS.chienSyLanChi.phone);
  const before = await restSelect(token, "profiles", `phone=eq.${ACCOUNTS.chienSyLanChi.phone}`);
  const selfId = (before[0] as { id: string; role: string }).id;

  await restPatch(token, "profiles", `id=eq.${selfId}`, { role: "tong_tu_lenh", active: true });

  const after = await restSelect(token, "profiles", `phone=eq.${ACCOUNTS.chienSyLanChi.phone}`);
  expect((after[0] as { role: string }).role).toBe("chien_sy"); // không đổi
});

test("ADM-09/ADM-11: tài khoản vừa bị ngưng mất quyền ngay cả khi còn phiên đăng nhập cũ", async ({ browser }) => {
  const staffCtx = await browser.newContext();
  const staffPage = await staffCtx.newPage();
  const ceoCtx = await browser.newContext();
  const cePage = await ceoCtx.newPage();

  try {
    await loginAs(staffPage, ACCOUNTS.chienSyVanKhoa.phone);
    await expect(staffPage.getByText(ACCOUNTS.chienSyVanKhoa.name).first()).toBeVisible();

    await loginAs(cePage, ACCOUNTS.ceo.phone);
    await cePage.goto(`/admin?dept=${encodeURIComponent(ACCOUNTS.chienSyVanKhoa.dept)}`);
    const row = staffRow(cePage, ACCOUNTS.chienSyVanKhoa.name);
    await row.getByRole("button", { name: "Ngưng" }).click();
    await expect(cePage.getByText("Đã ngưng tài khoản")).toBeVisible();

    // Phiên cũ của nhân viên bị ngưng thử thao tác tiếp -> phải bị đẩy về /login.
    await staffPage.goto("/");
    await expect(staffPage).toHaveURL(/\/login/);
  } finally {
    // Khôi phục trạng thái hoạt động ngay lập tức — đây là tài khoản demo thật.
    await cePage.goto(`/admin?dept=${encodeURIComponent(ACCOUNTS.chienSyVanKhoa.dept)}`);
    const row = staffRow(cePage, ACCOUNTS.chienSyVanKhoa.name);
    const reactivateBtn = row.getByRole("button", { name: "Kích hoạt" });
    if (await reactivateBtn.isVisible().catch(() => false)) {
      await reactivateBtn.click();
      await expect(cePage.getByText("Đã kích hoạt lại")).toBeVisible();
    }
    await staffCtx.close();
    await ceoCtx.close();
  }
});

// ============================================================================
// SQU-01 — Xem cơ cấu tổ chức và tiểu đội
// ============================================================================

test("SQU-01: CEO xem tiểu đội thấy đội trưởng, đội phó, thành viên và quân số", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto("/squad");
  await expect(page.getByText("Mãnh Hổ (Sale)")).toBeVisible();
  await expect(page.getByText("QUÂN SỐ").first()).toBeVisible();
  await expect(page.getByText("TỔNG EXP").first()).toBeVisible();
});

test("SQU-01: vị trí đội phó còn trống không bị gán nhầm thành viên", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await page.goto("/squad");
  const khoBac = page.locator('[data-slot="card"]').filter({ hasText: "Kho Bạc (Kế toán)" });
  await expect(khoBac.getByText("Đội phó")).toHaveCount(0);
});

test("SQU-01.3: người không phải CEO không truy cập được trang tổ đội toàn công ty", async ({ page }) => {
  await loginAs(page, ACCOUNTS.tuLenhSale.phone);
  await page.goto("/squad");
  await expect(page).not.toHaveURL(/\/squad/);
});
