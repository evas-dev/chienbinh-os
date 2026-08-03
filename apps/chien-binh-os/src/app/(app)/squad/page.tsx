import { redirect } from "next/navigation";

/**
 * Sơ đồ tiểu đội đã gộp vào trang Nhân sự. Giữ route này để link/bookmark cũ
 * không chết.
 */
export default async function SquadPage() {
  redirect("/admin?xem=tieu-doi");
}
