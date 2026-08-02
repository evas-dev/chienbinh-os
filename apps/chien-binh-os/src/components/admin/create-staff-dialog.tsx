"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPTS = [
  { value: "Marketing", front: "tien_tuyen", label: "Marketing (Tiền tuyến)" },
  { value: "Sale", front: "tien_tuyen", label: "Sale (Tiền tuyến)" },
  { value: "Dev", front: "hau_phuong", label: "Dev (Hậu phương)" },
  { value: "CSKH", front: "hau_phuong", label: "CSKH (Hậu phương)" },
  { value: "Kế toán", front: "hau_phuong", label: "Kế toán (Hậu phương)" },
  { value: "HR", front: "hau_phuong", label: "HR (Hậu phương)" },
] as const;

export function CreateStaffDialog({
  open,
  onOpenChange,
  squads,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  squads: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("123456");
  const [dept, setDept] = useState<string>(DEPTS[0].value);
  const [role, setRole] = useState<"chien_sy" | "tu_lenh">("chien_sy");
  const [squadId, setSquadId] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Thiếu thông tin", { description: "Cần họ tên và số điện thoại." });
      return;
    }
    const front = DEPTS.find((d) => d.value === dept)?.front ?? "tien_tuyen";
    startTransition(async () => {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password: password || "123456",
          dept,
          front,
          role,
          squadId: squadId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Lỗi tạo tài khoản", { description: json.error });
        return;
      }
      toast.success(
        <span className="inline-flex items-center gap-1">
          Đã tạo tài khoản <EmojiIcon glyph="🆕" />
        </span>,
        { description: `${name} · SĐT ${phone} · MK ${password || "123456"}` },
      );
      onOpenChange(false);
      setName("");
      setPhone("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cb-panel border-cb-line">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <EmojiIcon glyph="➕" /> Tạo tài khoản nhân sự
          </DialogTitle>
        </DialogHeader>
        <NhomTruong>
          <TruongNhap nhan="Họ tên">
            <Input
              placeholder="VD: Trần Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </TruongNhap>
          <div className="grid grid-cols-2 gap-4">
            <TruongNhap nhan="Số điện thoại (đăng nhập)">
              <Input
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </TruongNhap>
            <TruongNhap nhan="Mật khẩu">
              <Input value={password} onChange={(e) => setPassword(e.target.value)} />
            </TruongNhap>
          </div>
          <TruongNhap nhan="Phòng ban">
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TruongNhap>
          <TruongNhap nhan="Cấp bậc hệ thống">
            <Select value={role} onValueChange={(v) => setRole(v as "chien_sy" | "tu_lenh")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chien_sy">Chiến sỹ (nhân viên)</SelectItem>
                <SelectItem value="tu_lenh">Tư lệnh (quản lý/trưởng phòng)</SelectItem>
              </SelectContent>
            </Select>
          </TruongNhap>
          <TruongNhap nhan="Tiểu đội (tùy chọn)">
            <Select value={squadId} onValueChange={setSquadId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— Chưa gán —" />
              </SelectTrigger>
              <SelectContent>
                {squads.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TruongNhap>
        </NhomTruong>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={isPending}
           
          >
            {isPending ? (
              "Đang tạo…"
            ) : (
              <>
                Tạo tài khoản <EmojiIcon glyph="⚔" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
