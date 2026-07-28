import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) {
    // Phân biệt "chưa đăng nhập" (không có phiên) với "có phiên Supabase Auth
    // nhưng tài khoản đã bị ngưng/không còn hồ sơ hợp lệ" (AUTH-04.2: tài
    // khoản bị ngưng giữa chừng vẫn phải mất quyền ở lần truy cập tiếp theo,
    // dù phiên cũ chưa hết hạn) — để login/page.tsx hiển thị đúng thông báo,
    // không lộ chi tiết nội bộ.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    redirect(user ? "/login?blocked=1" : "/login");
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
