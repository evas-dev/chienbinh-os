import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

/**
 * Refresh session cookie + chặn route (app) khi chưa đăng nhập.
 * Gọi từ proxy.ts (Next.js 16 đổi tên middleware -> proxy, runtime cố định nodejs).
 * Không kiểm tra role/active ở đây — việc đó cần round-trip DB, để layout lo.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Cố tình KHÔNG bounce "user (có phiên) mở /login" về "/" ở đây: việc đó
  // cần biết profiles.active (round-trip DB), để login/page.tsx (Server
  // Component, đọc được getCurrentProfile()) lo. Nếu làm ở middleware chỉ
  // dựa vào auth.getUser() (không biết active=false), tài khoản bị ngưng vẫn
  // còn phiên Supabase Auth hợp lệ sẽ bị đẩy "/" -> layout redirect "/login"
  // -> middleware đẩy lại "/" -> vòng lặp vô hạn (đã tái hiện được — AUTH-04).

  return supabaseResponse;
}
