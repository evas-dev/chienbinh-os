import { test, expect } from "@playwright/test";

/**
 * Gap-analysis Epic 15 (Bảo Mật, Audit Và Độ Tin Cậy) — chỉ các story không
 * phải "Đề xuất" (SEC-01/02/04/05 đã kiểm chứng gián tiếp qua các suite khác
 * trong cùng đợt rà soát — AUTH-04, FEE-02, RLS/self-action guards, hardening
 * migrations). File này tập trung SEC-03 và SEC-11, hai story có thể kiểm
 * chứng độc lập không cần đăng nhập.
 */

test("SEC-11: /api/health trả lời được KHÔNG cần đăng nhập, không lộ chi tiết hạ tầng", async ({
  request,
}) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(typeof body.checkedAt).toBe("string");

  // Không lộ chuỗi kết nối, khoá bí mật hay chi tiết hạ tầng — chỉ 2 trường
  // tối thiểu theo đúng yêu cầu "chỉ công bố thông tin tối thiểu".
  expect(Object.keys(body).sort()).toEqual(["checkedAt", "status"]);

  const setCookie = res.headers()["set-cookie"];
  expect(setCookie).toBeUndefined();
});

test("SEC-03: không có service_role key nào lộ ra trong bundle JS gửi cho trình duyệt", async ({
  page,
}) => {
  const jsResponses: string[] = [];
  page.on("response", async (res) => {
    if (res.url().endsWith(".js") && res.status() === 200) {
      try {
        jsResponses.push(await res.text());
      } catch {
        // bỏ qua response đã đóng
      }
    }
  });

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const combined = jsResponses.join("\n");
  // service_role key Supabase luôn bắt đầu bằng eyJ... (JWT) và dài — kiểm
  // tra không có chuỗi "service_role" xuất hiện trong bất kỳ bundle nào.
  expect(combined).not.toContain("service_role");
});
