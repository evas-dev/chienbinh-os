import { redirect } from "next/navigation";

/**
 * Quỹ thưởng đã gộp vào trang Nhân sự. Giữ route này để link/bookmark cũ không
 * chết.
 */
export default async function BonusPage() {
  redirect("/admin?xem=quy-thuong");
}
