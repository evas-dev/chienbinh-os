import { redirect } from "next/navigation";
import type { Profile } from "@/lib/auth/get-current-profile";
import type { Enums } from "@/types/database";

/**
 * Chặn trang theo vai trò — gọi ở đầu mỗi page.tsx bị giới hạn quyền,
 * thay cho TABS[].roles filter phía client cũ.
 */
export function requireRole(profile: Profile | null, allowed: Enums<"role_type">[]) {
  if (!profile || !allowed.includes(profile.role)) {
    redirect("/");
  }
}
