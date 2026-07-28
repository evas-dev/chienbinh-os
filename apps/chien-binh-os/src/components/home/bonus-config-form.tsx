"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setBonusConfigAction } from "@/lib/actions/bonus";

export function BonusConfigForm({ pool, months }: { pool: number; months: number }) {
  const [poolInput, setPoolInput] = useState(String(pool));
  const [monthsInput, setMonthsInput] = useState(String(months));
  const [isPending, startTransition] = useTransition();

  function submit() {
    const nextPool = Number(poolInput);
    const nextMonths = Number(monthsInput);
    if (!Number.isFinite(nextPool) || nextPool < 0) {
      toast.error("Lỗi", { description: "Quỹ phải là số không âm" });
      return;
    }
    startTransition(async () => {
      const res = await setBonusConfigAction(nextPool, nextMonths);
      if (!res.ok) {
        toast.error("Lỗi cập nhật quỹ", { description: res.error });
        return;
      }
      toast.success("Đã cập nhật quỹ thưởng");
    });
  }

  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      <div className="space-y-1.5">
        <Label>Quỹ thưởng (VNĐ)</Label>
        <Input
          type="number"
          min={0}
          value={poolInput}
          onChange={(e) => setPoolInput(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Chu kỳ chia</Label>
        <Select value={monthsInput} onValueChange={setMonthsInput}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 tháng</SelectItem>
            <SelectItem value="6">6 tháng</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={submit}
        disabled={isPending}
        className="bg-cb-gold text-cb-bg hover:bg-cb-gold-soft col-span-2"
      >
        {isPending ? "Đang lưu…" : "Lưu cấu hình quỹ"}
      </Button>
    </div>
  );
}
