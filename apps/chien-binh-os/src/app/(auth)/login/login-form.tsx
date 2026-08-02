"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";
import { EmojiIcon } from "@/components/chung/emoji-icon";

// Ô nhập mặc định của shadcn cao h-8 (32px) và nền trong suốt (biến thể
// `dark:` không áp dụng vì <html> không có class .dark) — quá thấp để chạm trên
// mobile, lại chìm vào card. Dùng nền cb-bg-2 (tối HƠN card) để ô đọc như rãnh
// lõm, viền rõ, focus viền vàng.
const O_NHAP =
  "h-11 rounded-lg bg-cb-bg-2 border-cb-line text-cb-ink placeholder:text-cb-ink-faint focus-visible:border-cb-gold focus-visible:ring-cb-gold/25 md:text-sm";

const NHAN = "text-cb-ink-faint text-[11px] font-semibold tracking-[0.12em] uppercase";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, null);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  // Ô số điện thoại là controlled: React reset form sau khi Server Action trả
  // về, nên nếu để uncontrolled thì đăng nhập sai một lần là mất trắng cả số
  // vừa nhập, phải gõ lại. Giữ giá trị trong state để nó sống sót qua reset.
  // Mật khẩu thì cố tình để uncontrolled — reset xoá luôn là đúng mong đợi.
  const [soDienThoai, setSoDienThoai] = useState("");

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-heading text-lg tracking-wide">ĐĂNG NHẬP CHIẾN TRƯỜNG</h1>
        <p className="text-cb-ink-dim text-sm">Nhập số điện thoại &amp; mật khẩu để vào trận</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className={NHAN}>
          Số điện thoại
        </Label>
        <Input
          id="phone"
          name="phone"
          inputMode="tel"
          autoComplete="username"
          placeholder="VD: 0901000001"
          required
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          className={O_NHAP}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className={NHAN}>
          Mật khẩu
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={hienMatKhau ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Mật khẩu"
            required
            // Chừa chỗ bên phải cho nút hiện/ẩn, tránh chữ chạy dưới icon.
            className={`${O_NHAP} pr-11`}
          />
          <button
            type="button"
            onClick={() => setHienMatKhau((v) => !v)}
            aria-label={hienMatKhau ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={hienMatKhau}
            className="text-cb-ink-faint hover:text-cb-ink focus-visible:outline-cb-gold absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
          >
            {hienMatKhau ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* role="alert" để trình đọc màn hình đọc lỗi ngay khi Server Action trả về. */}
      {state?.error ? (
        <p
          role="alert"
          className="border-cb-crimson/40 bg-cb-crimson/10 text-cb-crimson flex items-start gap-2 rounded-lg border p-3 text-sm"
        >
          <EmojiIcon glyph="⚠️" className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold disabled:opacity-70"
      >
        {isPending ? (
          "Đang xác thực…"
        ) : (
          <>
            Vào trận <EmojiIcon glyph="⚔" />
          </>
        )}
      </Button>
    </form>
  );
}
