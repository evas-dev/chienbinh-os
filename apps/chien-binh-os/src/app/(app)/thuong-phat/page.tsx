import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { DanhSachKhenThuong } from "@/components/commend/danh-sach-khen-thuong";
import { KhuXuPhat } from "@/components/penalty/khu-xu-phat";
import { PILL_BASE, PILL_OFF, PILL_ON } from "@/lib/pill";
import { cn } from "@/lib/utils";

const CHE_DO = [
  { key: "khen", label: "Khen thưởng" },
  { key: "phat", label: "Xử phạt" },
] as const;

type CheDo = (typeof CHE_DO)[number]["key"];

function laCheDo(v: string | undefined): CheDo {
  return CHE_DO.some((c) => c.key === v) ? (v as CheDo) : "khen";
}

/**
 * Thưởng phạt — gộp hai mục Khen thưởng và Xử phạt trước đây.
 *
 * Hai việc cùng một khuôn: chọn người, nêu lý do, ghi vào sổ EXP, rồi xem lại
 * lịch sử. Tách ra hai mục điều hướng chỉ làm thanh nav dài thêm mà người dùng
 * vẫn phải nhảy qua lại giữa chúng.
 *
 * Dùng viên chọn thay vì xếp chồng cả hai: mỗi bên đã có form và một hai bảng
 * dài, dồn chung một trang thì phải cuộn rất sâu mới tới phần dưới.
 */
export default async function ThuongPhatPage({
  searchParams,
}: {
  searchParams: Promise<{ xem?: string }>;
}) {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh"]);
  if (!profile) return null;

  const { xem } = await searchParams;
  const cheDo = laCheDo(xem);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {CHE_DO.map((c) => (
          <Link
            key={c.key}
            href={c.key === "khen" ? "/thuong-phat" : `/thuong-phat?xem=${c.key}`}
            aria-current={cheDo === c.key ? "page" : undefined}
            className={cn(PILL_BASE, cheDo === c.key ? PILL_ON : PILL_OFF)}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {cheDo === "phat" ? (
        <KhuXuPhat profile={profile} />
      ) : (
        <DanhSachKhenThuong profile={profile} />
      )}
    </div>
  );
}
