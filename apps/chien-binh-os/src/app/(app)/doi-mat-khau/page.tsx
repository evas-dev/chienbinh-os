import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Card, CardContent } from "@/components/ui/card";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { DoiMatKhauForm } from "./doi-mat-khau-form";

export default async function DoiMatKhauPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="max-w-md">
      <Card>
        <CardContent>
          <TieuDeMuc icon="🔑" hint={`Tài khoản: ${profile.name} · ${profile.phone}`}>
            Đổi mật khẩu
          </TieuDeMuc>
          <DoiMatKhauForm />
          <p className="text-cb-ink-faint mt-4 flex items-start gap-1.5 text-xs leading-relaxed">
            <EmojiIcon glyph="⚠️" className="mt-0.5 shrink-0" />
            <span>
              Quên mật khẩu thì không tự lấy lại được — báo Tổng Tư Lệnh cấp lại giúp.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
