import { redirect } from "next/navigation";

/** Xử phạt đã gộp vào trang Thưởng phạt. Giữ route cho link/bookmark cũ. */
export default async function PenaltyPage() {
  redirect("/thuong-phat?xem=phat");
}
