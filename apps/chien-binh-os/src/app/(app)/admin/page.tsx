import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { StaffRow } from "@/components/admin/staff-row";
import { CreateStaffButton } from "@/components/admin/create-staff-button";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { cn } from "@/lib/utils";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh"]);
  if (!profile) return null;

  const scope = (await searchParams).dept ?? "Marketing"; // pilot Marketing mặc định, khớp bản gốc

  const supabase = await createClient();
  const [{ data: allStaff }, { data: squads }] = await Promise.all([
    supabase.from("profiles").select("*").order("name"),
    supabase.from("squads").select("id, name"),
  ]);

  const depts = [...new Set((allStaff ?? []).map((w) => w.dept).filter((d): d is string => Boolean(d)))];
  const list = (allStaff ?? []).filter((w) => scope === "__all__" || w.dept === scope);
  const activeCount = list.filter((w) => w.active).length;

  const tabDepts = [
    "Marketing",
    "Sale",
    ...depts.filter((d) => d !== "Marketing" && d !== "Sale" && d !== "Tổng tư lệnh"),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-lg font-bold">
            <EmojiIcon glyph="👤" />
            Quản trị nhân sự
          </div>
          <div className="text-cb-ink-dim text-sm">
            Đang xem: <b>{scope === "__all__" ? "Toàn công ty" : scope}</b> · {activeCount}/{list.length}{" "}
            tài khoản hoạt động
          </div>
        </div>
        <CreateStaffButton squads={squads ?? []} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabDepts.map((d) => (
          <Link
            key={d}
            href={`/admin?dept=${encodeURIComponent(d)}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              scope === d ? "bg-cb-gold text-cb-bg font-semibold" : "bg-cb-panel-2 text-cb-ink-dim",
            )}
          >
            {d}
          </Link>
        ))}
        <Link
          href="/admin?dept=__all__"
          className={cn(
            "rounded-full px-3 py-1.5 text-sm",
            scope === "__all__" ? "bg-cb-gold text-cb-bg font-semibold" : "bg-cb-panel-2 text-cb-ink-dim",
          )}
        >
          Tất cả
        </Link>
      </div>

      <Card className="bg-cb-panel border-cb-line">
        <CardContent className="divide-cb-line-soft divide-y pt-6">
          {list.length === 0 ? (
            <p className="text-cb-ink-dim text-sm">Chưa có nhân sự ở phòng này.</p>
          ) : (
            list.map((w) => <StaffRow key={w.id} warrior={w} isSelf={w.id === profile.id} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
