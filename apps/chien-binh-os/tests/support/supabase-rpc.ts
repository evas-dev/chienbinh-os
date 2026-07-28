import fs from "node:fs";
import path from "node:path";

/**
 * Gọi RPC/REST của Supabase trực tiếp (không qua UI Next.js) — dùng để kiểm
 * tra hành vi ở tầng "Hệ Thống" (DB/RPC) cho các RPC chưa có UI (vd
 * assign_squad_member) hoặc để kiểm chứng rollback/transaction mà UI không
 * lộ ra (vd admin_create_warrior khi tiểu đội đã đầy).
 *
 * Đọc URL + anon key trực tiếp từ .env.local — cùng giá trị public mà
 * client-side bundle của app đã dùng (NEXT_PUBLIC_*), không phải bí mật.
 */
function readEnvLocal(): Record<string, string> {
  const p = path.join(__dirname, "..", "..", ".env.local");
  const content = fs.readFileSync(p, "utf-8");
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const env = readEnvLocal();
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getAccessTokenForPhone(phone: string, password = "123456"): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({ email: `${phone}@chienbinh.local`, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Đăng nhập thất bại cho ${phone}: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

export async function callRpc(
  accessToken: string,
  fn: string,
  args: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { ok: res.ok, status: res.status, body };
}

export function rpcErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    return String((body as { message: unknown }).message ?? "");
  }
  return String(body);
}

/** SELECT trực tiếp qua PostgREST — dùng để xác minh trạng thái DB sau RPC. */
export async function restSelect(
  accessToken: string,
  table: string,
  query: string,
): Promise<unknown[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`restSelect ${table} thất bại: ${JSON.stringify(json)}`);
  return json as unknown[];
}

/** PATCH trực tiếp qua PostgREST — dùng để kiểm tra RLS có thực sự chặn ghi. */
export async function restPatch(
  accessToken: string,
  table: string,
  query: string,
  patch: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: res.status, body };
}
