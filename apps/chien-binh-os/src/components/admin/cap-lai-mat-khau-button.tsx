"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TruongNhap } from "@/components/chung/truong-nhap";
import { DO_DAI_MAT_KHAU_TOI_THIEU } from "@/lib/auth/mat-khau";

/**
 * Tổng Tư Lệnh cấp lại mật khẩu cho nhân sự quên mật khẩu.
 *
 * Gọi Route Handler chứ không phải Server Action: đổi mật khẩu là thao tác
 * trên bảng auth của Supabase, chỉ khoá service_role mới với tới được.
 */
export function CapLaiMatKhauButton({
  warriorId,
  tenNhanSu,
}: {
  warriorId: string;
  tenNhanSu: string;
}) {
  const [mo, setMo] = useState(false);
  const [matKhau, setMatKhau] = useState("");
  const [dangGui, startTransition] = useTransition();

  function gui() {
    if (matKhau.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
      toast.error(`Mật khẩu phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự`);
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warriorId, password: matKhau }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Không cấp lại được", { description: data.error ?? "Có lỗi xảy ra" });
        return;
      }
      toast.success(`Đã cấp mật khẩu mới cho ${tenNhanSu}`, {
        description: "Nhắn mật khẩu này cho họ và dặn đổi lại sau khi đăng nhập.",
      });
      setMo(false);
      setMatKhau("");
    });
  }

  return (
    <>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => setMo(true)}
        aria-label={`Cấp lại mật khẩu cho ${tenNhanSu}`}
        title="Cấp lại mật khẩu"
      >
        <KeyRound />
      </Button>

      <Dialog open={mo} onOpenChange={setMo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cấp lại mật khẩu</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed">
            Đặt mật khẩu mới cho <b>{tenNhanSu}</b>. Mật khẩu cũ mất hiệu lực ngay.
          </p>
          <TruongNhap nhan={`Mật khẩu mới (ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự)`}>
            {/* Để hiện rõ chứ không che: CEO cần đọc được để nhắn lại cho nhân
                sự, che đi thì lại phải gõ mò rồi đọc nhầm. */}
            <Input
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="VD: chienbinh2026"
              autoComplete="off"
            />
          </TruongNhap>
          <p className="text-cb-ink-faint text-xs leading-relaxed">
            Hệ thống không gửi mật khẩu đi đâu cả — bạn tự nhắn cho nhân sự.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMo(false)} disabled={dangGui}>
              Hủy
            </Button>
            <Button onClick={gui} disabled={dangGui}>
              {dangGui ? "Đang đặt…" : "Đặt mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
