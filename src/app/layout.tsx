import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRA CỨU THỦ TỤC NHÀ ĐẤT | Luật Đất Đai 2024 & Thừa Kế",
  description:
    "TRA CỨU THỦ TỤC NHÀ ĐẤT - Cổng tra cứu thủ tục sang tên Sổ đỏ, thừa kế di sản, tặng cho nhà đất, giải quyết tranh chấp, tính thuế phí tự động và điểm tin pháp luật cập nhật hàng ngày.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
