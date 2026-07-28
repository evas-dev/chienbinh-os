"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";
import { EmojiIcon } from "@/components/chung/emoji-icon";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <div className="mb-2 text-center">
        <div className="bg-cb-crimson text-cb-ink mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
          <EmojiIcon glyph="⚔" className="size-8" />
        </div>
        <h1 className="font-heading text-2xl tracking-wide">ĐĂNG NHẬP CHIẾN TRƯỜNG</h1>
        <p className="text-cb-ink-dim text-sm">Nhập số điện thoại &amp; mật khẩu để vào trận</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input id="phone" name="phone" inputMode="tel" placeholder="VD: 0901000001" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" name="password" type="password" placeholder="Mật khẩu" required />
      </div>

      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}

      <Button
        type="submit"
        disabled={isPending}
        className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft flex w-full items-center justify-center gap-1.5 font-semibold"
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
