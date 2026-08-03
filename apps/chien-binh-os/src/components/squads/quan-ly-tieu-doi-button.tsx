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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chip } from "@/components/chung/chip";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { TruongNhap } from "@/components/chung/truong-nhap";
import {
  assignSquadMemberAction,
  removeSquadMemberAction,
  type ChucTrongDoi,
} from "@/lib/actions/squads";

export type NguoiTrongDoi = {
  id: string;
  name: string;
  dept: string | null;
  chuc: ChucTrongDoi;
};

/**
 * Bổ nhiệm / gỡ chức trong một tiểu đội.
 *
 * Trước đây chỉ gán được tiểu đội lúc TẠO tài khoản, và không có cách nào đặt
 * đội trưởng qua giao diện — cả 5 đội đều trống chức.
 */
export function QuanLyTieuDoiButton({
  squadId,
  tenDoi,
  thanhVien,
  nguoiChuaVaoDoi,
}: {
  squadId: string;
  tenDoi: string;
  thanhVien: NguoiTrongDoi[];
  /** Nhân sự cùng mặt trận chưa thuộc tiểu đội nào. */
  nguoiChuaVaoDoi: { id: string; name: string; dept: string | null }[];
}) {
  const [mo, setMo] = useState(false);
  const [themAi, setThemAi] = useState("");
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

  const NHAN_CHUC: Record<ChucTrongDoi, string> = {
    leader: "Đội trưởng",
    deputy: "Đội phó",
    member: "Thành viên",
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setMo(true)}>
        Quản lý
      </Button>

      <Dialog open={mo} onOpenChange={setMo}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tiểu đội {tenDoi}</DialogTitle>
          </DialogHeader>

          <div>
            <p className="text-cb-ink-dim mb-2 text-sm">Thành viên ({thanhVien.length})</p>
            {thanhVien.length === 0 ? (
              <p className="text-cb-ink-dim border-cb-line rounded-lg border px-3 py-2.5 text-sm">
                Tiểu đội chưa có ai.
              </p>
            ) : (
              <div className="border-cb-line divide-cb-line-soft divide-y rounded-lg border">
                {thanhVien.map((n) => (
                  <div key={n.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                    <AnhDaiDien id={n.id} ten={n.name} className="size-9" canhPx={36} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{n.name}</div>
                      <Chip mau={n.chuc === "member" ? "xam" : "vang"} className="mt-1">
                        {NHAN_CHUC[n.chuc]}
                      </Chip>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {n.chuc !== "leader" ? (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={dangChay}
                          onClick={() =>
                            chay(
                              () => assignSquadMemberAction(squadId, n.id, "leader"),
                              `${n.name} là đội trưởng`,
                            )
                          }
                        >
                          Đội trưởng
                        </Button>
                      ) : null}
                      {n.chuc !== "deputy" ? (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={dangChay}
                          onClick={() =>
                            chay(
                              () => assignSquadMemberAction(squadId, n.id, "deputy"),
                              `${n.name} là đội phó`,
                            )
                          }
                        >
                          Đội phó
                        </Button>
                      ) : null}
                      <Button
                        size="xs"
                        variant="destructive"
                        disabled={dangChay}
                        onClick={() =>
                          chay(
                            () => removeSquadMemberAction(squadId, n.id),
                            `Đã gỡ ${n.name} khỏi tiểu đội`,
                          )
                        }
                      >
                        Gỡ
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Người bị thay chức không bị đá khỏi đội mà lùi về thành viên
                thường — nói trước để không ai ngại bấm. */}
            <p className="text-cb-ink-faint mt-2 text-xs">
              Đặt đội trưởng mới thì người đang giữ chức lùi về thành viên, vẫn ở trong đội.
            </p>
          </div>

          <TruongNhap nhan="Thêm người vào tiểu đội">
            {nguoiChuaVaoDoi.length === 0 ? (
              <p className="text-cb-ink-dim border-cb-line rounded-lg border px-3 py-2.5 text-sm">
                Không còn ai cùng mặt trận đang rảnh. Mỗi người chỉ thuộc một tiểu đội.
              </p>
            ) : (
              <div className="flex gap-2">
                <Select value={themAi} onValueChange={setThemAi}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn nhân sự…" />
                  </SelectTrigger>
                  <SelectContent>
                    {nguoiChuaVaoDoi.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.name} ({n.dept})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={dangChay || !themAi}
                  onClick={() => {
                    const ten = nguoiChuaVaoDoi.find((n) => n.id === themAi)?.name ?? "";
                    chay(
                      () => assignSquadMemberAction(squadId, themAi, "member"),
                      `Đã thêm ${ten}`,
                    );
                    setThemAi("");
                  }}
                >
                  Thêm
                </Button>
              </div>
            )}
          </TruongNhap>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMo(false)}>
              Xong
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
