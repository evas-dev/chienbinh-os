import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { StaffRow } from "@/components/admin/staff-row";
import { CreateStaffButton } from "@/components/admin/create-staff-button";
import { Card, CardContent } from "@/components/ui/card";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { cn } from "@/lib/utils";

const PILL_BASE = "rounded-full border px-3.5 py-2 text-sm transition-colors";
const PILL_ON = "bg-cb-gold text-cb-bg border-cb-gold font-semibold";
const PILL_OFF = "bg-cb-panel-2 text-cb-ink-dim border-cb-line hover:text-cb-ink";

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
  const [{ data: allStaff, error: staffError }, { data: squads }] = await Promise.all([
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
    // Danh sách nhân sự khá thưa (tên · vai trò · SĐT · trạng thái) — giới hạn bề rộng
    // để trên màn hình lớn không bị kéo dài cả 1200px với khoảng trống ở giữa.
    <div className="max-w-4xl">
      <TieuDeMuc
        icon="👤"
        className="mb-5 text-lg"
        hint={
          <>
            Đang xem: <b>{scope === "__all__" ? "Toàn công ty" : scope}</b> · {activeCount}/{list.length}{" "}
            tài khoản hoạt động
          </>
        }
        action={<CreateStaffButton squads={squads ?? []} />}
      >
        Quản trị nhân sự
      </TieuDeMuc>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabDepts.map((d) => (
          <Link
            key={d}
            href={`/admin?dept=${encodeURIComponent(d)}`}
            className={cn(PILL_BASE, scope === d ? PILL_ON : PILL_OFF)}
          >
            {d}
          </Link>
        ))}
        <Link
          href="/admin?dept=__all__"
          className={cn(PILL_BASE, scope === "__all__" ? PILL_ON : PILL_OFF)}
        >
          Tất cả
        </Link>
      </div>

      <Card className="bg-cb-panel border-cb-line">
        <CardContent className="divide-cb-line-soft divide-y">
          {staffError ? (
            // ADM-02.3: lỗi tải dữ liệu phải khác trạng thái "chưa có nhân sự" —
            // không được để trắng danh sách trông giống như phòng ban trống thật.
            <p className="text-cb-crimson text-sm">
              Không tải được danh sách nhân sự. Vui lòng thử tải lại trang.
            </p>
          ) : list.length === 0 ? (
            <p className="text-cb-ink-dim text-sm">Chưa có nhân sự ở phòng này.</p>
          ) : (
            list.map((w) => <StaffRow key={w.id} warrior={w} isSelf={w.id === profile.id} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
