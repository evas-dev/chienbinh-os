"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMissionAction } from "@/lib/actions/missions";

/**
 * Xoá một nhiệm vụ đã giao. Luôn hỏi lại trước khi xoá — thao tác không hoàn
 * tác được và nhiệm vụ có thể đã hiện trên máy người nhận.
 */
export function XoaNhiemVuButton({
  missionId,
  tenNhiemVu,
  tenNguoiNhan,
}: {
  missionId: string;
  tenNhiemVu: string;
  tenNguoiNhan?: string;
}) {
  const [mo, setMo] = useState(false);
  const [dangXoa, startTransition] = useTransition();

  function xoa() {
    startTransition(async () => {
      const res = await deleteMissionAction(missionId);
      if (!res.ok) {
        toast.error("Không xoá được", { description: res.error });
        return;
      }
      toast.success("Đã xoá nhiệm vụ", { description: tenNhiemVu });
      setMo(false);
    });
  }

  return (
    <>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => setMo(true)}
        aria-label={`Xoá nhiệm vụ ${tenNhiemVu}`}
        title="Xoá nhiệm vụ"
      >
        <Trash2 />
      </Button>

      <Dialog open={mo} onOpenChange={setMo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá nhiệm vụ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed">
            Xoá <b>«{tenNhiemVu}»</b>
            {tenNguoiNhan ? (
              <>
                {" "}
                đã giao cho <b>{tenNguoiNhan}</b>
              </>
            ) : null}
            . Không khôi phục lại được.
          </p>
          <p className="text-cb-ink-dim text-sm leading-relaxed">
            Chỉ xoá được khi người nhận <b>chưa bấm Nhận</b>. Nếu họ đã bắt đầu làm, hãy trao đổi
            trực tiếp thay vì xoá.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMo(false)} disabled={dangXoa}>
              Giữ lại
            </Button>
            <Button variant="destructive" onClick={xoa} disabled={dangXoa}>
              {dangXoa ? "Đang xoá…" : "Xoá nhiệm vụ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
