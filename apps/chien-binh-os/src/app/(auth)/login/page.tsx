import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
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
    <div className="space-y-6">
      {/* Lockup thương hiệu đặt ngoài card, dựng giống header trong app
          (components/layout/app-shell.tsx) để màn đăng nhập nhận ra ngay là
          cùng một sản phẩm. */}
      <div className="flex flex-col items-center gap-2.5 text-center">
        <EmojiIcon glyph="⚔" className="text-cb-crimson size-9" />
        <div>
          <div className="font-heading text-2xl leading-none tracking-wide sm:text-3xl">
            CHIẾN BINH<span className="text-cb-gold"> OS</span>
          </div>
          <p className="text-cb-ink-faint mt-1.5 text-xs">Vận hành công ty như một cuộc chiến</p>
        </div>
      </div>

      <Card className="bg-cb-panel/90 border-cb-line shadow-2xl shadow-black/40 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-7">
          {blocked ? (
            <p
              role="alert"
              className="border-cb-crimson/40 bg-cb-crimson/10 text-cb-crimson mb-5 flex items-start gap-2 rounded-lg border p-3 text-sm leading-relaxed"
            >
              <EmojiIcon glyph="⚠️" className="mt-0.5 shrink-0" />
              <span>
                Tài khoản của bạn không còn quyền truy cập. Vui lòng liên hệ Tổng Tư Lệnh để được hỗ
                trợ.
              </span>
            </p>
          ) : null}
          <LoginForm />
        </CardContent>
      </Card>

      {/* Không có luồng tự đặt lại mật khẩu (xem docs/huong-dan-su-dung.md),
          nên nói rõ phải liên hệ ai. Cố tình KHÔNG in mật khẩu mặc định ra
          trang công khai. */}
      <p className="text-cb-ink-faint text-center text-xs">
        Quên mật khẩu? Liên hệ <span className="text-cb-ink-dim">Tổng Tư Lệnh</span> để được đặt
        lại.
      </p>
    </div>
  );
}
