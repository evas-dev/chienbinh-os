"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = await createClient();
  // Ghi nhận trước khi signOut() — sau đó auth.uid() không còn hợp lệ để RPC
  // xác định tác nhân (AUTH-10.1: mọi sự kiện đăng xuất phải có tác nhân).
  await supabase.rpc("log_auth_event", { p_event_type: "logout" });
  await supabase.auth.signOut();
  redirect("/login");
}
