import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { cn } from "@/lib/utils";
import { PILL_BASE, PILL_OFF, PILL_ON } from "@/lib/pill";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import {
  MucGioiThieu,
  MucDangNhap,
  MucVaiTro,
  MucBonConSo,
} from "@/components/huong-dan/muc-chung";
import { MucChienSy } from "@/components/huong-dan/muc-chien-sy";
import { MucTuLenh } from "@/components/huong-dan/muc-tu-lenh";
import { MucTongTuLenh } from "@/components/huong-dan/muc-tong-tu-lenh";
import { MucTraCuu, MucCauHoi, MucHanChe } from "@/components/huong-dan/muc-tra-cuu";

// Bộ lọc vai trò: tài liệu dài, mỗi người chỉ cần đọc 1 trong 3 mục theo vai
// trò của mình. Dùng searchParams + <Link> (giống /ranks) thay vì useState để
// trang vẫn là Server Component và link chia sẻ được.
const LOC = [
  { key: "tat_ca", label: "Xem tất cả" },
  { key: "chien_sy", label: "Chiến Sỹ" },
  { key: "tu_lenh", label: "Tư Lệnh" },
  { key: "tong_tu_lenh", label: "Tổng Tư Lệnh" },
] as const;

type Loc = (typeof LOC)[number]["key"];

const MOI_VAI_TRO: Loc[] = ["tat_ca", "chien_sy", "tu_lenh", "tong_tu_lenh"];

// Mục lục — `hien` khai báo mục hiện với những lựa chọn lọc nào.
// Tư Lệnh phải đọc cả mục Chiến Sỹ (họ cũng có nhiệm vụ riêng), và Tổng Tư Lệnh
// phải đọc cả mục Tư Lệnh (CEO cũng duyệt kết quả).
//
// `so` cố định, KHÔNG đánh số lại theo thứ tự hiển thị khi lọc: số mục là mã
// tham chiếu (nội dung có chỗ viết "xem mục 3") và phải khớp với số in trong
// từng section, nếu không mục lục sẽ nói 06 trong khi section ghi 08.
const MUC_LUC: { id: string; so: number; ten: string; hien: Loc[] }[] = [
  { id: "gioi-thieu", so: 1, ten: "Chiến Binh OS là gì", hien: MOI_VAI_TRO },
  { id: "dang-nhap", so: 2, ten: "Đăng nhập", hien: MOI_VAI_TRO },
  { id: "vai-tro", so: 3, ten: "Ba vai trò", hien: MOI_VAI_TRO },
  { id: "bon-con-so", so: 4, ten: "Bốn con số cần hiểu", hien: MOI_VAI_TRO },
  {
    id: "chien-sy",
    so: 5,
    ten: "Dành cho Chiến Sỹ",
    hien: ["tat_ca", "chien_sy", "tu_lenh"],
  },
  {
    id: "tu-lenh",
    so: 6,
    ten: "Dành cho Tư Lệnh",
    hien: ["tat_ca", "tu_lenh", "tong_tu_lenh"],
  },
  {
    id: "tong-tu-lenh",
    so: 7,
    ten: "Dành cho Tổng Tư Lệnh",
    hien: ["tat_ca", "tong_tu_lenh"],
  },
  { id: "tra-cuu", so: 8, ten: "Bảng tra cứu", hien: MOI_VAI_TRO },
  { id: "cau-hoi", so: 9, ten: "Câu hỏi thường gặp", hien: MOI_VAI_TRO },
  { id: "han-che", so: 10, ten: "Hạn chế đã biết", hien: MOI_VAI_TRO },
];

export default async function HuongDanPage({
  searchParams,
}: {
  searchParams: Promise<{ vai_tro?: string }>;
}) {
  const profile = await getCurrentProfile();
  // Cẩm nang vận hành áp dụng cho mọi vai trò — không giới hạn ai.
  requireRole(profile, ["tong_tu_lenh", "tu_lenh", "chien_sy"]);

  const param = (await searchParams).vai_tro;
  const loc: Loc = LOC.some((l) => l.key === param) ? (param as Loc) : "tat_ca";
  const hien = (id: string) => MUC_LUC.find((m) => m.id === id)?.hien.includes(loc) ?? false;
  const mucHienThi = MUC_LUC.filter((m) => m.hien.includes(loc));

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
      {/* Mục lục dính bên trái, chỉ hiện trên màn hình lớn. */}
      <nav aria-label="Mục lục" className="hidden lg:block">
        <div className="sticky top-6">
          <div className="text-cb-ink-faint border-cb-line font-heading mb-2 border-b pb-2.5 text-[11px] tracking-[0.18em] uppercase">
            Mục lục
          </div>
          <ol className="space-y-px">
            {mucHienThi.map((m) => (
              <li key={m.id}>
                <a
                  href={`#${m.id}`}
                  className="text-cb-ink-dim hover:bg-cb-panel hover:text-cb-ink focus-visible:outline-cb-gold flex gap-2.5 rounded-md px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <span className="text-cb-ink-faint pt-0.5 font-mono text-[11px]">
                    {String(m.so).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">{m.ten}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="min-w-0 max-w-[72ch]">
        <p className="bg-cb-panel-2 border-cb-line mb-4 flex items-start gap-2 rounded-lg border p-3.5 text-sm leading-relaxed">
          <EmojiIcon glyph="🎓" className="text-cb-gold-soft mt-0.5" />
          <span>
            Cẩm nang vận hành dành cho <b>mọi nhân sự</b> — không cần biết kỹ thuật. Chọn vai trò
            của bạn để chỉ hiện những mục cần đọc.
          </span>
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-cb-ink-faint font-heading mr-1 text-[11px] tracking-[0.16em] uppercase">
            Tôi là
          </span>
          {LOC.map((l) => (
            <Link
              key={l.key}
              href={`/huong-dan?vai_tro=${l.key}`}
              aria-current={loc === l.key ? "page" : undefined}
              className={cn(PILL_BASE, loc === l.key ? PILL_ON : PILL_OFF)}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* divide-y kẻ vạch giữa các mục — khoảng cách do space-y của cha lo. */}
        <div className="divide-cb-line-soft space-y-12 divide-y [&>section]:pb-12 [&>section:last-child]:pb-0">
          {hien("gioi-thieu") ? <MucGioiThieu /> : null}
          {hien("dang-nhap") ? <MucDangNhap /> : null}
          {hien("vai-tro") ? <MucVaiTro /> : null}
          {hien("bon-con-so") ? <MucBonConSo /> : null}
          {hien("chien-sy") ? <MucChienSy /> : null}
          {hien("tu-lenh") ? <MucTuLenh /> : null}
          {hien("tong-tu-lenh") ? <MucTongTuLenh /> : null}
          {hien("tra-cuu") ? <MucTraCuu /> : null}
          {hien("cau-hoi") ? <MucCauHoi /> : null}
          {hien("han-che") ? <MucHanChe /> : null}
        </div>

        <p className="text-cb-ink-faint border-cb-line mt-10 border-t pt-5 text-xs">
          Tài liệu mô tả hệ thống tại thời điểm 29/07/2026. Nếu bạn thấy giao diện khác với hướng
          dẫn, có thể hệ thống đã được cập nhật.
        </p>
      </div>
    </div>
  );
}
