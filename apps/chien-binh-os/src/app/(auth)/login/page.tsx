import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string }>;
}) {
  // Đã có phiên hợp lệ + tài khoản còn hoạt động -> vào thẳng Sở chỉ huy,
  // không hiển thị lại form đăng nhập (AUTH-06.1). Dùng getCurrentProfile()
  // (round-trip DB, biết cả profiles.active) thay vì chỉ dựa vào phiên
  // Supabase Auth như middleware cũ — tránh vòng lặp redirect cho tài khoản
  // đã bị ngưng (AUTH-04).
  const profile = await getCurrentProfile();
  if (profile) redirect("/");

  const { blocked } = await searchParams;

  return (
    <Card className="bg-cb-panel border-cb-line w-full max-w-sm">
      <CardContent>
        {blocked ? (
          <p className="border-cb-crimson/40 bg-cb-crimson/10 text-cb-crimson mb-4 rounded-lg border p-3 text-sm leading-relaxed">
            Tài khoản của bạn không còn quyền truy cập. Vui lòng liên hệ Tổng Tư Lệnh để được hỗ
            trợ.
          </p>
        ) : null}
        <LoginForm />
      </CardContent>
    </Card>
  );
}
