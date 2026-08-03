"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/chung/chip";
import { moTaLich } from "@/lib/lich-tuan";
import { deleteRecurringAction, setRecurringActiveAction } from "@/lib/actions/recurring";

/** Một dòng lịch lặp: tạm dừng / bật lại / xoá hẳn. */
export function DongLichLap({
  id,
  title,
  target,
  unit,
  exp,
  weekdays,
  active,
  tenNguoiNhan,
}: {
  id: string;
  title: string;
  target: number;
  unit: string;
  exp: number;
  weekdays: number[];
  active: boolean;
  tenNguoiNhan: string;
}) {
  const [dangChay, startTransition] = useTransition();

  function chay(viec: () => Promise<{ ok: boolean; error?: string }>, thanhCong: string) {
    startTransition(async () => {
      const res = await viec();
      if (!res.ok) {
        toast.error("Không thực hiện được", { description: res.error });
        return;
      }
      toast.success(thanhCong);
    });
  }

  return (
    <div className="bg-cb-bg-2 border-cb-line mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border p-3.5 last:mb-0">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Chip mau={active ? "xanh" : "xam"}>{active ? moTaLich(weekdays) : "Tạm dừng"}</Chip>
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="text-cb-ink-faint text-xs">
          Người nhận: <b>{tenNguoiNhan}</b> · {target} {unit} · +{exp} EXP
          {active ? null : ` · lịch ${moTaLich(weekdays)}`}
        </div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="xs"
          variant="outline"
          disabled={dangChay}
          onClick={() =>
            chay(
              () => setRecurringActiveAction(id, !active),
              active ? "Đã tạm dừng lịch" : "Đã bật lại lịch",
            )
          }
        >
          {active ? "Tạm dừng" : "Bật lại"}
        </Button>
        <Button
          size="icon-sm"
          variant="destructive"
          disabled={dangChay}
          aria-label={`Xoá lịch ${title}`}
          title="Xoá lịch (nhiệm vụ đã giao vẫn giữ)"
          onClick={() => chay(() => deleteRecurringAction(id), "Đã xoá lịch lặp")}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
