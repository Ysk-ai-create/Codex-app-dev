import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "巡点 JUNTEN｜マンション設備点検管理",
  description: "マンション設備の点検・異常対応・報告書作成を一元管理するデモアプリ",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
