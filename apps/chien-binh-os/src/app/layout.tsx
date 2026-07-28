import type { Metadata } from "next";
import { Be_Vietnam_Pro, Anton, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Font chữ chính — hỗ trợ đầy đủ dấu tiếng Việt, dùng cho toàn bộ nội dung.
const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Font tiêu đề đậm, phong cách "game"/quân sự — vẫn hỗ trợ đủ dấu tiếng Việt.
const headingFont = Anton({
  variable: "--font-heading",
  subsets: ["vietnamese", "latin"],
  weight: "400",
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
