import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Nihongo Tamil",
  description: "JLPT N5 → N3 for Tamil speakers. Cards, games and exam-format tests.",
};

export const viewport: Viewport = {
  themeColor: "#e85d8a",
  width: "device-width",
  initialScale: 1,
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Sans+Tamil:wght@400;600;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="min-h-full flex flex-col">
        <TopBar />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 pb-24 pt-4">{children}</main>
      </body>
    </html>
  );
}
