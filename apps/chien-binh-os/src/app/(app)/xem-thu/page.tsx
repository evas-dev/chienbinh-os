import Image from "next/image";
// TẠM THỜI — trang xem thử giao diện, sẽ xoá sau khi duyệt xong.
import { Card, CardContent } from "@/components/ui/card";
import { MissionCard } from "@/components/missions/mission-card";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { ThanhTienDo } from "@/components/chung/thanh-tien-do";
import { Chip } from "@/components/chung/chip";
import { AnhDaiDien } from "@/components/chung/anh-dai-dien";
import { TAT_CA_NHAN_VAT } from "@/lib/nhan-vat";
import { Button } from "@/components/ui/button";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import type { Tables } from "@/types/database";

type Mission = Tables<"missions">;

function nv(over: Partial<Mission>): Mission {
  return {
    assignee_id: null,
    assigner_id: null,
    badge_reward: null,
    created_at: null,
    current: 0,
    deadline: "2026-08-08",
    exp: 40,
    fixed: true,
    icon: null,
    id: Math.random().toString(36).slice(2),
    parent_id: null,
    status: "todo",
    target: 10,
    title: "Nhiệm vụ",
    type: "ngay",
    unit: "video",
    ...over,
  };
}

const DEMO: Mission[] = [
  nv({ title: "Đăng 10 video TikTok", status: "todo", current: 0, target: 10 }),
  nv({ title: "Gọi 30 khách hàng tiềm năng", status: "doing", current: 18, target: 30, unit: "cuộc", exp: 60 }),
  nv({ title: "Viết 5 bài chuẩn SEO", status: "review", current: 5, target: 5, unit: "bài", exp: 80, fixed: false }),
  nv({ title: "Chốt 3 hợp đồng lớn", status: "done", current: 3, target: 3, unit: "hợp đồng", exp: 120, fixed: false }),
];

export default function XemThuPage() {
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <AnhDaiDien id="demo-dung" ten="Đặng Tiến Dũng" className="size-20" canhPx={80} />
              <div className="min-w-0">
                <div className="font-heading text-lg leading-tight font-bold">Đặng Tiến Dũng</div>
                <div className="text-cb-ink-dim mt-0.5 text-sm">
                  Tiền Tuyến · Marketing · Chiến Sỹ
                </div>
                <div className="text-cb-ink-faint mt-0.5 text-xs">Tiểu đội: Sấm Sét (Mkt)</div>
                <Chip mau="vang" className="mt-2">
                  <EmojiIcon glyph="🎖" /> Trung Sĩ
                </Chip>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2 text-xs">
                <span className="text-cb-ink-dim font-semibold">
                  EXP <span className="text-cb-gold text-sm">1.240</span>
                </span>
                <span className="text-cb-ink-faint">Còn 260 → Thượng Sĩ</span>
              </div>
              <ThanhTienDo pct={68} co="lon" soDoan={10} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
                <div className="text-cb-gold cb-chu-noi text-2xl font-bold">7</div>
                <div className="text-cb-ink-faint mt-1 text-xs font-semibold tracking-wide">
                  HUÂN CHƯƠNG
                </div>
              </div>
              <div className="bg-cb-bg-2 ring-cb-line rounded-xl p-4 ring-1 shadow-[inset_0_2px_4px_0_rgb(0_0_0/0.35)]">
                <div className="text-cb-gold cb-chu-noi text-2xl font-bold">320</div>
                <div className="text-cb-ink-faint mt-1 text-xs font-semibold tracking-wide">
                  ĐIỂM MÙA
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TieuDeMuc icon="🎯">Nhiệm vụ hôm nay</TieuDeMuc>
            {DEMO.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <TieuDeMuc icon="🛡" hint={`${TAT_CA_NHAN_VAT.length} nhân vật — mỗi nhân sự được gán cố định một người`}>
            Kho nhân vật
          </TieuDeMuc>
          {/* Hiện thẳng từng file ảnh, KHÔNG đi qua AnhDaiDien: component đó
              băm id ra nhân vật, truyền tên vào sẽ ra nhân vật khác. */}
          <div className="flex flex-wrap gap-2.5">
            {TAT_CA_NHAN_VAT.map((ten) => (
              <div
                key={ten}
                className="bg-cb-panel-2 relative size-16 overflow-hidden rounded-xl border-2 border-black/85"
              >
                <Image
                  src={`/avatars/${ten}.png`}
                  alt={ten}
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TieuDeMuc icon="⚡" hint="Các kiểu nút">
            Nút bấm
          </TieuDeMuc>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Nhận nhiệm vụ</Button>
            <Button variant="secondary">Phụ</Button>
            <Button variant="outline">Viền</Button>
            <Button variant="destructive">Xử phạt</Button>
            <Button variant="ghost">Mờ</Button>
            <Button size="lg">Nút to</Button>
            <Button size="sm">Nút nhỏ</Button>
            <Button disabled>Khoá</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip>Xám</Chip>
            <Chip mau="vang">Vàng</Chip>
            <Chip mau="xanh">Xanh</Chip>
            <Chip mau="do">Đỏ</Chip>
            <Chip mau="tim">Tím</Chip>
            <Chip mau="lam">Lam</Chip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
