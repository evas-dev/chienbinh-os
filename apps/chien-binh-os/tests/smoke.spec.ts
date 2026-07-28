import { test, expect } from "@playwright/test";
import { loginAs } from "./support/login";
import { ACCOUNTS } from "./support/accounts";

test("đăng nhập CEO thấy Sở chỉ huy toàn công ty", async ({ page }) => {
  await loginAs(page, ACCOUNTS.ceo.phone);
  await expect(page.getByText("BÁO CÁO TỔNG QUAN CÔNG TY")).toBeVisible();
});

test("đăng nhập Chiến Sỹ thấy Sở chỉ huy cá nhân", async ({ page }) => {
  await loginAs(page, ACCOUNTS.chienSyLanChi.phone);
  await expect(page.getByText(ACCOUNTS.chienSyLanChi.name).first()).toBeVisible();
});
