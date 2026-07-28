import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase dùng trong Server Component / Server Action / Route Handler.
 * cookies() là async trong Next.js 16 — luôn phải await.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Bỏ qua nếu gọi từ Server Component (không set cookie được) —
            // proxy.ts đã lo việc refresh session, chỗ này chỉ đọc.
          }
        },
      },
    },
  );
}
