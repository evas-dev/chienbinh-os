import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { requireRole } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiIcon } from "@/components/chung/emoji-icon";
import { TieuDeMuc } from "@/components/chung/tieu-de-muc";
import { DongNhatKy, type DongFeed } from "@/components/feed/dong-nhat-ky";
import { khoaNgay, moTaPhamVi, nhanNgay } from "@/lib/feed";

export default async function FeedPage() {
  const profile = await getCurrentProfile();
  requireRole(profile, ["tong_tu_lenh", "tu_lenh", "chien_sy"]);
  if (!profile) return null;

  const supabase = await createClient();

  // Phạm vi xem KHÔNG lọc ở đây mà do RLS "read feed scoped by role" (migration
  // 0029) quyết định: Chiến Sỹ chỉ thấy sự kiện của mình, Tư Lệnh thêm nhân sự
  // cùng phòng ban, Tổng Tư Lệnh thấy tất cả. Đặt ở tầng DB nên không lách được
  // bằng cách gọi API trực tiếp, và `limit` dưới đây tính trên số dòng đã lọc.
  const { data: feed, error } = await supabase
    .from("feed")
    .select("id, icon, text, created_at, subject_id, actor_id")
    .order("created_at", { ascending: false })
    .limit(60);

  // Lấy tên/phòng ban cho cả chủ thể và người thực hiện trong 1 lượt.
  const canId = Array.from(
    new Set(
      (feed ?? []).flatMap((f) => [f.subject_id, f.actor_id]).filter((v): v is string => !!v),
    ),
  );
  const { data: nguoi } = canId.length
    ? await supabase.from("profiles").select("id, name, dept").in("id", canId)
    : { data: [] };
  const theoId = new Map((nguoi ?? []).map((p) => [p.id, p]));

  const dsDong: DongFeed[] = (feed ?? []).map((f) => {
    const chuThe = f.subject_id ? theoId.get(f.subject_id) : undefined;
    return {
      id: f.id,
      icon: f.icon,
      text: f.text,
      created_at: f.created_at,
      tenChuThe: chuThe?.name ?? null,
      phongBan: chuThe?.dept ?? null,
      laToi: f.subject_id === profile.id,
      tenNguoiThucHien: f.actor_id ? (theoId.get(f.actor_id)?.name ?? null) : null,
    };
  });

  // Gom theo ngày — nhật ký dài đọc theo mốc ngày dễ định vị hơn danh sách phẳng.
  const homNay = khoaNgay(new Date().toISOString());
  const nhomTheoNgay = new Map<string, DongFeed[]>();
  for (const d of dsDong) {
    const khoa = d.created_at ? khoaNgay(d.created_at) : "khong-ro";
    nhomTheoNgay.set(khoa, [...(nhomTheoNgay.get(khoa) ?? []), d]);
  }

  return (
    <Card className="max-w-3xl">
      <CardContent>
        <TieuDeMuc icon="📣" hint={`${dsDong.length} hoạt động gần nhất`}>
          Nhật ký chiến công
        </TieuDeMuc>

        {/* Nói rõ phạm vi để Chiến Sỹ không tưởng nhật ký bị lỗi khi thấy ít dòng. */}
        <p className="bg-cb-panel-2 border-cb-line mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <EmojiIcon glyph="🛡" className="text-cb-gold-soft mt-0.5" />
          <span className="text-cb-ink-dim">{moTaPhamVi(profile.role, profile.dept)}</span>
        </p>

        {error ? (
          // FEE-01 AC3: lỗi tải dữ liệu phải khác trạng thái "chưa có hoạt động".
          <p className="text-cb-crimson py-4 text-sm" role="alert">
            Không tải được nhật ký chiến công. Vui lòng thử lại.
          </p>
        ) : dsDong.length === 0 ? (
          <p className="text-cb-ink-dim py-4 text-sm">
            Chưa có hoạt động nào. Nhận và hoàn thành nhiệm vụ để ghi dấu ở đây.
          </p>
        ) : (
          <div className="space-y-5">
            {[...nhomTheoNgay.entries()].map(([khoa, dong]) => (
              <section key={khoa}>
                <h3 className="text-cb-ink-faint font-heading border-cb-line-soft mb-1 border-b pb-2 text-[11px] tracking-[0.14em] uppercase">
                  {nhanNgay(khoa)}
                </h3>
                <ul className="divide-cb-line-soft divide-y">
                  {dong.map((d) => (
                    // Hôm nay thì "3 giờ trước" hữu ích; ngày cũ thì mốc giờ cụ
                    // thể rõ hơn là "5 ngày trước".
                    <DongNhatKy key={d.id} dong={d} hienGio={khoa !== homNay} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
