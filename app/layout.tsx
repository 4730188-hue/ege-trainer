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
  description: "Твой личный ЕГЭ-тренер в Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const yandexMetrikaId = 109047892;

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

        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],
              k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(${yandexMetrikaId}, "init", {
              ssr: true,
              webvisor: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true
            });

            window.YM_COUNTER_ID = ${yandexMetrikaId};
          `}
        </Script>

        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${yandexMetrikaId}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
