import type { Page } from "@playwright/test";
import { PASSWORD } from "./accounts";

/** Đăng nhập bằng SĐT demo — dùng ở đầu mỗi test cần một vai trò cụ thể. */
export async function loginAs(page: Page, phone: string, password: string = PASSWORD) {
  await page.goto("/login");
  // Nếu đã có phiên (redirect về "/"), đăng xuất trước để test độc lập với thứ tự chạy.
  if (page.url().endsWith("/") && !page.url().includes("/login")) {
    await logout(page);
    await page.goto("/login");
  }
  await page.getByRole("textbox", { name: "Số điện thoại" }).fill(phone);
  await page.getByRole("textbox", { name: "Mật khẩu" }).fill(password);
  await page.getByRole("button", { name: "Vào trận" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function logout(page: Page) {
  const btn = page.getByRole("button", { name: "Đăng xuất" });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForURL((url) => url.pathname.startsWith("/login"));
  }
}
