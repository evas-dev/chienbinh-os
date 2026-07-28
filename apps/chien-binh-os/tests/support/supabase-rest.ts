import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

/**
 * Đọc trực tiếp NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY từ
 * .env.local — tiến trình `playwright test` là process Node riêng, không đi
 * qua Next.js nên không tự nạp .env.local như `next dev`.
 */
function readEnvLocal(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(file, "utf8");
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = readEnvLocal();
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Lấy access_token JWT của phiên đang đăng nhập trong `page` — đọc thẳng
 * cookie `sb-<ref>-auth-token` mà @supabase/ssr set (dạng `base64-<b64 JSON>`)
 * để gọi PostgREST/RPC trực tiếp bằng Node fetch, mô phỏng đúng một client
 * tấn công gọi thẳng API thay vì đi qua UI đã lọc sẵn.
 */
export async function getAccessToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((c) => /^sb-.*-auth-token$/.test(c.name));
  if (!authCookie) throw new Error("Không tìm thấy cookie phiên đăng nhập Supabase");
  const raw = decodeURIComponent(authCookie.value).replace(/^base64-/, "");
  const json = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  if (!json.access_token) throw new Error("Cookie phiên đăng nhập không có access_token");
  return json.access_token as string;
}

/** SELECT trực tiếp qua PostgREST — dùng để kiểm tra RLS độc lập với UI. */
export async function restSelect(token: string, table: string, query: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  return { status: res.status, body: body as unknown[] };
}

/** Gọi RPC trực tiếp — dùng để kiểm tra guard phía server độc lập với UI. */
export async function rpcCall(token: string, fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}
