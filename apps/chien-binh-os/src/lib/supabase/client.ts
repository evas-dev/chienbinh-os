import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase phía trình duyệt — chỉ dùng cho các đoạn "use client" cần
 * tương tác trực tiếp (vd. auth session listener). Mọi đọc/ghi dữ liệu chính
 * đi qua Server Component / Server Action (lib/supabase/server.ts).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
