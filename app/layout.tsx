import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EGE Trainer",
  description: "Подготовка к ЕГЭ в формате Telegram Mini App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent">
        {children}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <Script id="telegram-webapp-init" strategy="afterInteractive">
          {`
            (function () {
              if (typeof window === 'undefined') return;
              var tg = window.Telegram && window.Telegram.WebApp;
              if (!tg) return;
              try { tg.ready(); } catch (e) {}
              try { tg.expand(); } catch (e) {}
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
