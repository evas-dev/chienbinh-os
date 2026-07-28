import { createClient } from "@/lib/supabase/server";

// SEC-11: không yêu cầu đăng nhập, chỉ công bố mức tối thiểu (sẵn sàng hay
// không + thời điểm kiểm tra) — không trả chuỗi kết nối, khoá bí mật hay
// chi tiết hạ tầng. Round-trip thật tới Postgres qua RPC health_check()
// (security definer, cấp quyền anon riêng — xem migration 0028) thay vì chỉ
// kiểm tra tiến trình Next.js còn sống.
export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("health_check");
    if (error) throw error;

    return Response.json({ status: "ok", checkedAt });
  } catch {
    return Response.json({ status: "error", checkedAt }, { status: 503 });
  }
}
