import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

/**
 * Nguồn "ai đang đăng nhập / vai trò gì" duy nhất cho mọi Server Component
 * trong cùng 1 request — thay cho me()/state.currentUserId toàn cục kiểu cũ.
 * Bọc trong cache() để nhiều nơi gọi trong cùng request chỉ tính 1 lần.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Tài khoản bị ngưng (active=false) coi như đã đăng xuất — khớp init.js cũ.
  if (!profile || !profile.active) return null;

  return profile;
});
