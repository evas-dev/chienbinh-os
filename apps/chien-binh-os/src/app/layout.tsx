import type { Metadata } from "next";
import { Be_Vietnam_Pro, Baloo_2, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Font chữ chính — hỗ trợ đầy đủ dấu tiếng Việt, dùng cho toàn bộ nội dung.
const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Font tiêu đề & nút: chữ khối bo tròn kiểu game di động.
 *
 * Bộ UI tham chiếu (Brawl Stars) dùng Lilita One, nhưng font đó CHỈ có subset
 * latin/latin-ext — thiếu hẳn dải U+1EA0–1EF9 chứa phần lớn nguyên âm có dấu
 * tiếng Việt (ế, ộ, ữ...), nên chữ sẽ vỡ thành hai font lẫn lộn. Baloo 2 giữ
 * đúng chất khối tròn đó mà có subset vietnamese đầy đủ.
 *
 * Thay cho Anton (cao, gầy, kiểu áp phích) — đúng chất quân sự nhưng không ra
 * chất game.
 */
const headingFont = Baloo_2({
  variable: "--font-heading",
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHIẾN BINH OS — Hệ điều hành đội nhóm",
  description: "Vận hành công ty như một cuộc chiến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${bodyFont.variable} ${headingFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
