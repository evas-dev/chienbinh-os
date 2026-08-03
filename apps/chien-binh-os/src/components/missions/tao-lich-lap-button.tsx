"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NhomTruong, TruongNhap } from "@/components/chung/truong-nhap";
import { ChonNhieuNguoi, type NguoiNhan } from "@/components/chung/chon-nhieu-nguoi";
import { CAC_THU, MAC_DINH_T2_T7 } from "@/lib/lich-tuan";
import { cn } from "@/lib/utils";
import { createRecurringMissionAction } from "@/lib/actions/recurring";

/**
 * Đặt lịch cho một nhiệm vụ tự giao lại vào những thứ đã chọn trong tuần.
 *
 * Mặc định tích sẵn T2–T7 vì đó là lịch làm việc thường, nhưng để người dùng
 * bỏ tích được — có đội chỉ chạy T2/T4/T6.
 */
export function TaoLichLapButton({ nguoiNhan }: { nguoiNhan: NguoiNhan[] }) {
  const [mo, setMo] = useState(false);
  const [ten, setTen] = useState("");
  const [chiTieu, setChiTieu] = useState("1");
  const [donVi, setDonVi] = useState("việc");
  const [exp, setExp] = useState("40");
  const [ai, setAi] = useState<string[]>([]);
  const [thu, setThu] = useState<number[]>(MAC_DINH_T2_T7);
  const [dangGui, startTransition] = useTransition();

  function doiThu(so: number) {
    setThu((cu) => (cu.includes(so) ? cu.filter((x) => x !== so) : [...cu, so].sort()));
  }

  function xoaForm() {
    setTen("");
    setChiTieu("1");
    setDonVi("việc");
    setExp("40");
    setAi([]);
    setThu(MAC_DINH_T2_T7);
  }

  function gui() {
    if (!ten.trim()) {
      toast.error("Thiếu tên nhiệm vụ");
      return;
    }
    if (ai.length === 0) {
      toast.error("Chưa chọn người nhận");
      return;
    }
    if (thu.length === 0) {
      toast.error("Chọn ít nhất một ngày trong tuần");
      return;
    }
    startTransition(async () => {
      const res = await createRecurringMissionAction({
        title: ten.trim(),
        target: Number(chiTieu) || 1,
        unit: donVi.trim() || "việc",
        exp: Number(exp) || 40,
        assigneeIds: ai,
        weekdays: thu,
      });
      if (!res.ok) {
        toast.error("Không đặt được lịch", { description: res.error });
        return;
      }
      toast.success(`Đã đặt lịch cho ${res.data} người`, {
        description: "Nhiệm vụ sẽ tự xuất hiện vào đầu mỗi ngày đã chọn.",
      });
      setMo(false);
      xoaForm();
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setMo(true)}>
        <CalendarClock /> Đặt lịch lặp
      </Button>

      <Dialog open={mo} onOpenChange={setMo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhiệm vụ lặp hằng tuần</DialogTitle>
          </DialogHeader>
          <NhomTruong>
            <TruongNhap nhan="Tên nhiệm vụ">
              <Input
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                placeholder="VD: Đăng 3 video TikTok"
              />
            </TruongNhap>

            <TruongNhap nhan="Lặp vào các ngày">
              <div className="flex flex-wrap gap-1.5">
                {CAC_THU.map((t) => {
                  const chon = thu.includes(t.so);
                  return (
                    <button
                      key={t.so}
                      type="button"
                      onClick={() => doiThu(t.so)}
                      aria-pressed={chon}
                      title={t.day}
                      className={cn(
                        "font-heading h-9 w-11 rounded-lg border-2 text-sm font-bold transition-colors",
                        chon
                          ? "bg-cb-gold text-cb-bg border-black/60"
                          : "border-cb-line bg-cb-bg-2 text-cb-ink-dim hover:text-cb-ink",
                      )}
                    >
                      {t.nhan}
                    </button>
                  );
                })}
              </div>
            </TruongNhap>

            <TruongNhap nhan={`Giao cho${ai.length > 0 ? ` (${ai.length} người)` : ""}`}>
              <ChonNhieuNguoi danhSach={nguoiNhan} daChon={ai} onDoiChon={setAi} />
            </TruongNhap>

            <div className="grid grid-cols-3 gap-4">
              <TruongNhap nhan="Chỉ tiêu">
                <Input type="number" value={chiTieu} onChange={(e) => setChiTieu(e.target.value)} />
              </TruongNhap>
              <TruongNhap nhan="Đơn vị">
                <Input value={donVi} onChange={(e) => setDonVi(e.target.value)} />
              </TruongNhap>
              <TruongNhap nhan="EXP">
                <Input type="number" value={exp} onChange={(e) => setExp(e.target.value)} />
              </TruongNhap>
            </div>
          </NhomTruong>

          <p className="text-cb-ink-faint text-xs leading-relaxed">
            Mỗi ngày đã chọn, hệ thống tự tạo nhiệm vụ mới với hạn là chính ngày đó. Hôm nay nếu nằm
            trong lịch thì có ngay, không phải đợi tới mai.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMo(false)} disabled={dangGui}>
              Hủy
            </Button>
            <Button onClick={gui} disabled={dangGui}>
              {dangGui ? "Đang đặt…" : "Đặt lịch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
