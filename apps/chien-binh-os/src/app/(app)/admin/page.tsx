import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { StaffRow } from "@/components/admin/staff-row";
import { CreateStaffButton } from "@/components/admin/create-staff-button";
import { BangXepHang, laScope } from "@/components/ranks/bang-xep-hang";
import { SoDoTieuDoi } from "@/components/squads/so-do-tieu-doi";
import { BangQuyThuong } from "@/components/bonus/bang-quy-thuong";
import { Card, CardContent } from "@/components/ui/card";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { PILL_BASE, PILL_OFF, PILL_ON } from "@/lib/pill";
import { cn } from "@/lib/utils";

/**
 * Ba cách nhìn công ty theo con người, gộp về một mục điều hướng thay vì ba
 * mục riêng (Nhân sự / Tiểu đội / Quỹ thưởng) như trước.
 *
 * Chỉ Tổng Tư Lệnh mới đổi được chế độ; Tư Lệnh vào đây chỉ có bảng xếp hạng.
 */
const CHE_DO = [
  { key: "danh-sach", label: "Danh sách" },
  { key: "tieu-doi", label: "Tiểu đội" },
  { key: "quy-thuong", label: "Quỹ thưởng" },
] as const;

type CheDo = (typeof CHE_DO)[number]["key"];

function laCheDo(v: string | undefined): CheDo {
  return CHE_DO.some((c) => c.key === v) ? (v as CheDo) : "danh-sach";
}

/**
 * Trang Nhân sự — trung tâm mọi thứ liên quan tới con người.
 *
 * Bảng xếp hạng nằm CỐ ĐỊNH ở cột phải khi xem Danh sách (không giấu sau thẻ),
 * vì hai thứ hay phải đối chiếu với nhau. Hai chế độ còn lại tự nó đã rộng nên
 * chiếm trọn bề ngang.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; scope?: string; xem?: string }>;
}) {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh"]);
  if (!profile) return null;

  const sp = await searchParams;
  const laCeo = profile.role === "tong_tu_lenh";

  const cotXepHang = (
    <div>
      <TieuDeMuc icon="📊" className="mb-4 text-lg" hint="Thi đua theo điểm mùa">
        Bảng xếp hạng
      </TieuDeMuc>
      <BangXepHang profile={profile} scope={laScope(sp.scope)} basePath="/admin" />
    </div>
  );

  // Tư Lệnh chỉ được xem xếp hạng (đúng như mục /ranks cũ cho phép); danh sách
  // nhân sự lộ số điện thoại và có nút khoá tài khoản nên vẫn chỉ CEO thấy.
  if (!laCeo) return <div className="max-w-3xl">{cotXepHang}</div>;

  const cheDo = laCheDo(sp.xem);
  const thanhCheDo = (
    <div className="mb-5 flex flex-wrap gap-2">
      {CHE_DO.map((c) => (
        <Link
          key={c.key}
          href={c.key === "danh-sach" ? "/admin" : `/admin?xem=${c.key}`}
          aria-current={cheDo === c.key ? "page" : undefined}
          className={cn(PILL_BASE, cheDo === c.key ? PILL_ON : PILL_OFF)}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );

  if (cheDo === "tieu-doi") {
    return (
      <div>
        {thanhCheDo}
        <SoDoTieuDoi />
      </div>
    );
  }

  if (cheDo === "quy-thuong") {
    return (
      <div>
        {thanhCheDo}
        <BangQuyThuong profile={profile} />
      </div>
    );
  }

  const scope = sp.dept ?? "Marketing"; // pilot Marketing mặc định, khớp bản gốc

  const supabase = await createClient();
  const [{ data: allStaff, error: staffError }, { data: squads }] = await Promise.all([
    supabase.from("profiles").select("*").order("name"),
    supabase.from("squads").select("id, name"),
  ]);

  const depts = [
    ...new Set((allStaff ?? []).map((w) => w.dept).filter((d): d is string => Boolean(d))),
  ];
  const list = (allStaff ?? []).filter((w) => scope === "__all__" || w.dept === scope);
  const activeCount = list.filter((w) => w.active).length;

  const tabDepts = [
    "Marketing",
    "Sale",
    ...depts.filter((d) => d !== "Marketing" && d !== "Sale" && d !== "Tổng tư lệnh"),
  ];

  return (
    <div>
      {thanhCheDo}
      {/* Hai cột: danh sách nhân sự bên trái, bảng xếp hạng bên phải. Cột phải cố
          định 400px vì các dòng xếp hạng ngắn (hạng · tên · điểm), để co giãn thì
          trên màn rộng chữ và điểm dạt ra hai đầu. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div>
          <TieuDeMuc
            icon="👤"
            className="mb-5 text-lg"
            hint={
              <>
                Đang xem: <b>{scope === "__all__" ? "Toàn công ty" : scope}</b> · {activeCount}/
                {list.length} tài khoản hoạt động
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

          <Card>
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

        {cotXepHang}
      </div>
    </div>
  );
}
