import { createClient as createRawClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client dùng service_role key — CHỈ được import trong Route Handler/Server
 * Action chạy trên server, KHÔNG BAO GIỜ export ra client component. Bỏ qua
 * RLS hoàn toàn, chỉ dùng cho thao tác auth.admin.* (tạo user) mà RPC thường
 * không làm được.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local — lấy key này ở Supabase Dashboard → Project Settings → API, cần cho việc tạo tài khoản nhân sự mới.",
    );
  }
  return createRawClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
