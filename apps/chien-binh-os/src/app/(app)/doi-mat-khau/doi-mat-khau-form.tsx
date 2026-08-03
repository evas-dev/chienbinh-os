"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import { doiMatKhauAction } from "@/lib/actions/auth";
import { DO_DAI_MAT_KHAU_TOI_THIEU } from "@/lib/auth/mat-khau";

export function DoiMatKhauForm() {
  const [cu, setCu] = useState("");
  const [moi, setMoi] = useState("");
  const [nhapLai, setNhapLai] = useState("");
  const [dangGui, startTransition] = useTransition();

  function gui() {
    if (!cu || !moi) {
      toast.error("Điền đủ mật khẩu hiện tại và mật khẩu mới");
      return;
    }
    // Chặn ngay tại trình duyệt: gõ lệch mà phải chờ máy chủ trả lời thì vô ích.
    if (moi !== nhapLai) {
      toast.error("Hai ô mật khẩu mới không khớp");
      return;
    }
    startTransition(async () => {
      const res = await doiMatKhauAction(cu, moi);
      if (!res.ok) {
        toast.error("Không đổi được", { description: res.error });
        return;
      }
      toast.success("Đã đổi mật khẩu", {
        description: "Lần đăng nhập sau hãy dùng mật khẩu mới.",
      });
      setCu("");
      setMoi("");
      setNhapLai("");
    });
  }

  return (
    <NhomTruong>
      <TruongNhap nhan="Mật khẩu hiện tại">
        <Input
          type="password"
          autoComplete="current-password"
          value={cu}
          onChange={(e) => setCu(e.target.value)}
        />
      </TruongNhap>
      <TruongNhap nhan={`Mật khẩu mới (ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự)`}>
        <Input
          type="password"
          autoComplete="new-password"
          value={moi}
          onChange={(e) => setMoi(e.target.value)}
        />
      </TruongNhap>
      <TruongNhap nhan="Nhập lại mật khẩu mới">
        <Input
          type="password"
          autoComplete="new-password"
          value={nhapLai}
          onChange={(e) => setNhapLai(e.target.value)}
        />
      </TruongNhap>
      <div>
        <Button onClick={gui} disabled={dangGui}>
          {dangGui ? "Đang đổi…" : "Đổi mật khẩu"}
        </Button>
      </div>
    </NhomTruong>
  );
}
