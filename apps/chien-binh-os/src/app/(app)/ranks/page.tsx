import { redirect } from "next/navigation";

/**
 * Bảng xếp hạng đã gộp vào trang Nhân sự. Giữ lại route này để link/bookmark
 * cũ không chết, và chuyển tiếp luôn tham số `scope` đang chọn.
 */
export default async function RanksPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope } = await searchParams;
  redirect(`/admin${scope ? `?scope=${encodeURIComponent(scope)}` : ""}`);
}
