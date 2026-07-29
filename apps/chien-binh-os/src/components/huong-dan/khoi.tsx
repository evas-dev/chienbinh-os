import { cn } from "@/lib/utils";
import { EmojiIcon } from "@/components/chung/emoji-icon";

/**
 * Các khối dùng chung cho trang Hướng dẫn sử dụng (/huong-dan).
 *
 * Trang này là tài liệu dài (không phải dashboard), nên không dùng Card như các
 * trang khác mà dựng riêng vài primitive tối giản: mục có số thứ tự, tiêu đề
 * phụ, khối chú ý, bảng cuộn ngang. Mọi màu vẫn lấy từ token cb-* để đồng bộ
 * với phần còn lại của app.
 */

export type VaiTroMuc = "chung" | "chien_sy" | "tu_lenh" | "tong_tu_lenh";

// Rail màu bên trái mục, mã hoá mục này dành cho vai trò nào — không phải trang trí.
const RAIL: Record<VaiTroMuc, string> = {
  chung: "",
  chien_sy: "border-l-cb-green border-l-[3px] pl-4 sm:pl-5",
  tu_lenh: "border-l-cb-gold border-l-[3px] pl-4 sm:pl-5",
  tong_tu_lenh: "border-l-cb-crimson border-l-[3px] pl-4 sm:pl-5",
};

/** Một mục lớn của cẩm nang. `so` là số thứ tự dùng để đối chiếu với mục lục. */
export function Muc({
  id,
  so,
  tieuDe,
  vaiTro = "chung",
  nhan,
  children,
}: {
  id: string;
  so: number;
  tieuDe: string;
  vaiTro?: VaiTroMuc;
  /** Thẻ vai trò hiện cạnh số mục, vd "Chiến Sỹ". */
  nhan?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", RAIL[vaiTro])}>
      <div className="mb-4">
        <div className="text-cb-ink-faint mb-1.5 flex items-center gap-2 font-mono text-xs">
          {String(so).padStart(2, "0")}
          {nhan ? <>· {nhan}</> : null}
        </div>
        <h2 className="font-heading text-xl leading-tight tracking-wide uppercase sm:text-2xl">
          {tieuDe}
        </h2>
      </div>
      <div className="space-y-4 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

/** Tiêu đề phụ trong một mục. */
export function TieuDePhu({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-cb-gold mt-7 mb-2 text-base tracking-wide first:mt-0">
      {children}
    </h3>
  );
}

/** Tiêu đề cấp 3 — dùng cho các bước trong một quy trình. */
export function TieuDeBuoc({ children }: { children: React.ReactNode }) {
  return <h4 className="text-cb-ink mt-5 mb-1.5 text-sm font-semibold">{children}</h4>;
}

const LUU_KIEU = {
  tin: { rail: "border-l-cb-blue", nhan: "text-cb-blue", nen: "bg-cb-panel" },
  meo: { rail: "border-l-cb-gold", nhan: "text-cb-gold", nen: "bg-cb-panel" },
  canh_bao: {
    rail: "border-l-cb-crimson",
    nhan: "text-cb-crimson",
    nen: "bg-cb-crimson/8",
  },
} as const;

/** Khối chú ý: `tin` (thông tin), `meo` (nên làm), `canh_bao` (dễ sai / không hoàn tác). */
export function Luu({
  kieu = "tin",
  nhan,
  children,
}: {
  kieu?: keyof typeof LUU_KIEU;
  nhan: string;
  children: React.ReactNode;
}) {
  const k = LUU_KIEU[kieu];
  return (
    <div className={cn("border-cb-line rounded-lg border border-l-[3px] p-3.5", k.rail, k.nen)}>
      <div className={cn("font-heading mb-1.5 text-[11px] tracking-[0.14em] uppercase", k.nhan)}>
        {nhan}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/**
 * Bọc bảng để cuộn ngang trên điện thoại — bảng trong tài liệu này khá rộng,
 * không được để cả trang cuộn ngang theo.
 */
export function Bang({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-cb-line bg-cb-panel overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[30rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  canhGiua,
  canhPhai,
}: {
  children?: React.ReactNode;
  canhGiua?: boolean;
  canhPhai?: boolean;
}) {
  return (
    <th
      className={cn(
        "bg-cb-bg-2 border-cb-line text-cb-ink-faint font-heading border-b px-3.5 py-2.5 text-left text-[11px] tracking-[0.13em] whitespace-nowrap uppercase",
        canhGiua && "text-center",
        canhPhai && "text-right",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  dam,
  canhGiua,
  so,
  am,
}: {
  children?: React.ReactNode;
  /** Cột đầu tiên — chữ sáng hơn để mắt bám theo hàng. */
  dam?: boolean;
  canhGiua?: boolean;
  /** Ô chứa số: canh phải + font mono + tabular-nums cho thẳng cột. */
  so?: boolean;
  /** Số âm (trừ EXP) — tô đỏ. */
  am?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-cb-line-soft text-cb-ink-dim border-b px-3.5 py-2.5 align-top",
        dam && "text-cb-ink font-semibold",
        canhGiua && "text-center",
        so && "text-right font-mono tabular-nums whitespace-nowrap",
        am && "text-cb-crimson text-right font-mono font-semibold tabular-nums",
      )}
    >
      {children}
    </td>
  );
}

const THE_MAU = {
  xam: "text-cb-ink-dim border-cb-line",
  vang: "text-cb-gold border-cb-gold/40",
  xanh: "text-cb-green border-cb-green/40",
  do: "text-cb-crimson border-cb-crimson/45",
  tim: "text-cb-purple border-cb-purple/40",
} as const;

/** Thẻ trạng thái nhỏ — dùng lại đúng các nhãn người dùng thấy trong app. */
export function The({
  mau = "xam",
  children,
}: {
  mau?: keyof typeof THE_MAU;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "bg-cb-panel-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        THE_MAU[mau],
      )}
    >
      {children}
    </span>
  );
}

/** Công thức tính (quỹ thưởng) — cần font mono để dấu ÷ × không bị lệch. */
export function CongThuc({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-cb-line bg-cb-bg-2 text-cb-gold-soft overflow-x-auto rounded-lg border p-4 font-mono text-sm">
      {children}
    </div>
  );
}

/** Sơ đồ các bước xếp ngang, tự xuống dòng trên điện thoại. */
export function SoDoBuoc({ buoc }: { buoc: string[] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {buoc.map((b, i) => (
        <li
          key={b}
          className="border-cb-line border-l-cb-gold bg-cb-panel rounded-lg border border-l-[3px] p-3"
        >
          <div className="text-cb-ink-faint font-mono text-[11px]">Bước {i + 1}</div>
          <div className="mt-1 font-semibold">{b}</div>
        </li>
      ))}
    </ol>
  );
}

/** Câu hỏi thường gặp — dùng <details> để không cần JS. */
export function CauHoi({ hoi, children }: { hoi: string; children: React.ReactNode }) {
  return (
    <details className="border-cb-line bg-cb-panel group rounded-lg border">
      <summary className="hover:bg-cb-panel-2 focus-visible:outline-cb-gold flex cursor-pointer items-center justify-between gap-3 rounded-lg px-4 py-3 font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span>{hoi}</span>
        <EmojiIcon
          glyph="➕"
          className="text-cb-gold shrink-0 transition-transform group-open:rotate-45"
        />
      </summary>
      <div className="text-cb-ink-dim space-y-2 px-4 pb-3.5">{children}</div>
    </details>
  );
}

/** Đoạn văn — gom lại để khoảng cách dòng nhất quán toàn trang. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-cb-ink-dim">{children}</p>;
}

/** Danh sách gạch đầu dòng. */
export function DanhSach({ items, soThuTu }: { items: React.ReactNode[]; soThuTu?: boolean }) {
  const Tag = soThuTu ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "text-cb-ink-dim marker:text-cb-ink-faint space-y-1.5 pl-5",
        soThuTu ? "list-decimal" : "list-disc",
      )}
    >
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </Tag>
  );
}
