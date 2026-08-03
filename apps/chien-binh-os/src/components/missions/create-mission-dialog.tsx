"use client";

import { useState, useTransition } from "react";
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
import { ChonNhieuNguoi } from "@/components/chung/chon-nhieu-nguoi";
import { ngayCuoiTuan, ngayHomNay } from "@/lib/tuan";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMissionAction } from "@/lib/actions/missions";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import type { Enums } from "@/types/database";

export interface MissionTarget {
  id: string;
  name: string;
  role: Enums<"role_type">;
  dept: string | null;
}

export function CreateMissionDialog({
  open,
  onOpenChange,
  title,
  isCampaign,
  targets,
  campaigns,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** true = Tổng Tư Lệnh mở chiến dịch lớn (chỉ có 1 loại: chien_dich) */
  isCampaign: boolean;
  targets: MissionTarget[];
  campaigns: { id: string; title: string }[];
}) {
  // Gom giá trị khởi tạo lại một chỗ để sau khi bàn giao xong dựng lại được
  // đúng form trắng. Trước đây chỉ xoá mỗi tên nhiệm vụ, nên chỉ tiêu / đơn vị
  // / EXP / hạn của lần trước còn nguyên ở lần mở sau — người dùng tưởng hệ
  // thống tự điền lung tung.
  // Loại nhiệm vụ gộp cả `type` lẫn cờ `fixed` vào MỘT lựa chọn.
  //
  // Trước đây hộp thoại này luôn gửi fixed:false nên mọi việc tạo ở đây đều ra
  // "Bonus", còn bấm nút mẫu ở trang Mục tiêu mới ra "Daily" — cùng một việc
  // quay video giao bằng hai đường lại thành hai loại khác nhau. Giờ người
  // giao chọn thẳng, nhãn phản ánh đúng ý định.
  const LOAI = {
    tuan: {
      nhan: "Nhiệm vụ tuần (KPI khối lượng)",
      type: "tuan" as const,
      fixed: false,
      exp: "300",
    },
    daily: {
      nhan: "Nhiệm vụ Daily (việc lặp hằng ngày)",
      type: "ngay" as const,
      fixed: true,
      exp: "40",
    },
    bonus: { nhan: "Nhiệm vụ Bonus (giao thêm)", type: "ngay" as const, fixed: false, exp: "80" },
  };
  type MaLoai = keyof typeof LOAI;

  const macDinh = {
    loai: "tuan" as MaLoai,
    target: "10",
    unit: isCampaign ? "khách hàng" : "đơn vị",
    // Chiến dịch là việc lớn cấp công ty nên thang điểm khác hẳn nhiệm vụ thường.
    exp: isCampaign ? "2000" : LOAI.tuan.exp,
    deadline: ngayCuoiTuan(),
  };

  const [missionTitle, setMissionTitle] = useState("");
  const [loai, setLoai] = useState<MaLoai>(macDinh.loai);
  const [parentId, setParentId] = useState<string>("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [target, setTarget] = useState(macDinh.target);
  const [unit, setUnit] = useState(macDinh.unit);
  const [exp, setExp] = useState(macDinh.exp);
  const [deadline, setDeadline] = useState(macDinh.deadline);
  const [isPending, startTransition] = useTransition();

  function xoaForm() {
    setMissionTitle("");
    setLoai(macDinh.loai);
    setParentId("");
    setAssigneeIds([]);
    setTarget(macDinh.target);
    setUnit(macDinh.unit);
    setExp(macDinh.exp);
    setDeadline(macDinh.deadline);
  }

  function submit() {
    if (!missionTitle.trim()) {
      toast.error("Thiếu tên", { description: "Nhập tên nhiệm vụ đã, chỉ huy." });
      return;
    }
    if (assigneeIds.length === 0) {
      toast.error("Chưa chọn người nhận", { description: "Tích ít nhất một người." });
      return;
    }
    if (!deadline) {
      toast.error("Chưa chọn hạn hoàn thành");
      return;
    }
    startTransition(async () => {
      const res = await createMissionAction({
        title: missionTitle.trim(),
        type: isCampaign ? "chien_dich" : LOAI[loai].type,
        parentId: parentId || null,
        assigneeIds,
        target: Number(target) || 1,
        unit: unit.trim() || "đơn vị",
        exp: Number(exp) || 100,
        deadline,
        fixed: isCampaign ? false : LOAI[loai].fixed,
      });
      if (!res.ok) {
        toast.error("Lỗi", { description: res.error });
        return;
      }
      const { soTao, loi } = res.data;
      if (loi.length > 0) {
        toast.warning(`Giao được ${soTao}/${assigneeIds.length} người`, {
          description: loi[0],
        });
      } else {
        toast.success(
          <span className="inline-flex items-center gap-1">
            Đã bàn giao cho {soTao} người <EmojiIcon glyph="⚔" />
          </span>,
        );
      }
      onOpenChange(false);
      xoaForm();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <EmojiIcon glyph="➕" /> {title}
          </DialogTitle>
        </DialogHeader>
        <NhomTruong>
          <TruongNhap nhan="Tên nhiệm vụ">
            <Input value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
          </TruongNhap>

          {!isCampaign ? (
            <TruongNhap nhan="Loại">
              <Select
                value={loai}
                onValueChange={(v) => {
                  const m = v as MaLoai;
                  setLoai(m);
                  // Kéo EXP về mức chuẩn của loại vừa chọn. Trước đây mọi loại
                  // đều mặc định 300 — cao hơn hẳn mẫu Daily (30–80), ai không
                  // để ý là phát điểm rộng tay gấp mấy lần.
                  setExp(LOAI[m].exp);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(LOAI) as MaLoai[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {LOAI[k].nhan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TruongNhap>
          ) : null}

          {!isCampaign && campaigns.length > 0 ? (
            <TruongNhap nhan="Thuộc chiến dịch (cha)">
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="— Không gắn —" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TruongNhap>
          ) : null}

          <TruongNhap
            nhan={`Giao cho${assigneeIds.length > 0 ? ` (${assigneeIds.length} người)` : ""}`}
          >
            <ChonNhieuNguoi danhSach={targets} daChon={assigneeIds} onDoiChon={setAssigneeIds} />
          </TruongNhap>

          <div className="grid grid-cols-3 gap-4">
            <TruongNhap nhan="Chỉ tiêu">
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
            </TruongNhap>
            <TruongNhap nhan="Đơn vị">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </TruongNhap>
            <TruongNhap nhan="EXP thưởng">
              <Input type="number" value={exp} onChange={(e) => setExp(e.target.value)} />
            </TruongNhap>
          </div>

          <TruongNhap nhan="Hạn hoàn thành">
            {/* Ô ngày của trình duyệt: gửi lên đúng dạng YYYY-MM-DD mà hàm SQL
                yêu cầu, và người dùng bấm lịch chọn thay vì gõ tay. */}
            <Input
              type="date"
              value={deadline}
              min={ngayHomNay()}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </TruongNhap>
        </NhomTruong>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? (
              "Đang gửi…"
            ) : (
              <>
                Bàn giao <EmojiIcon glyph="⚔" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
