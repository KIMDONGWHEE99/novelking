import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://justnovelking.com";

export const metadata: Metadata = {
  title: {
    default: "NovelKing - AI 소설 창작 도구",
    template: "%s | NovelKing",
  },
  description:
    "아이디어 하나로 소설을 완성하세요. AI가 시놉시스, 캐릭터, 세계관, 플롯을 자동으로 만들고 챕터별 본문까지 써줍니다. 무료로 시작하세요.",
  keywords: [
    "AI 소설",
    "소설 쓰기",
    "AI 글쓰기",
    "웹소설",
    "소설 창작",
    "AI 작가",
    "시놉시스 생성",
    "소설 마법사",
    "NovelKing",
  ],
  authors: [{ name: "NovelKing" }],
  creator: "NovelKing",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "NovelKing",
    title: "NovelKing - AI 소설 창작 도구",
    description:
      "아이디어 하나로 소설을 완성하세요. AI가 시놉시스, 캐릭터, 세계관, 플롯을 자동으로 만들고 챕터별 본문까지 써줍니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovelKing - AI 소설 창작 도구",
    description:
      "아이디어 하나로 소설을 완성하세요. AI가 시놉시스, 캐릭터, 세계관, 플롯을 자동 생성.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
