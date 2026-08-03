import { redirect } from "next/navigation";

/** Khen thưởng đã gộp vào trang Thưởng phạt. Giữ route cho link/bookmark cũ. */
export default async function CommendPage() {
  redirect("/thuong-phat");
}
