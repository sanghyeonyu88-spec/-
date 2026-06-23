import type { Metadata } from "next";
import { Saira_Condensed, Space_Grotesk, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const sairaCondensed = Saira_Condensed({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-saira",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KOR vs ZAF — 2026 FIFA 월드컵 스코어 예측",
  description: "한국 vs 남아공 2026 FIFA 월드컵 스코어를 예측해보세요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${sairaCondensed.variable} ${spaceGrotesk.variable} ${notoSansKR.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
