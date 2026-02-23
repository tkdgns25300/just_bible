import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Damion } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const damion = Damion({
  variable: "--font-title",
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Just Bible",
  description: "성경 본문을 빠르게 검색하고 복사할 수 있는 웹 애플리케이션",
  openGraph: {
    title: "Just Bible",
    description: "당신의 일상에 가장 단순한 성경 사전",
    siteName: "Just Bible",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Bible",
    description: "당신의 일상에 가장 단순한 성경 사전",
  },
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("just-bible-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${damion.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
