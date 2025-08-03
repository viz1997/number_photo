import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "マイナンバーカード写真 | AI自動調整で100%審査通過保証 | ¥500",
  description:
    "マイナンバーカード写真をAI技術で自動調整。どんな写真も30秒で規格準拠のマイナンバー写真に変換。100%審査通過保証、不通過なら全額返金。¥500で即座にダウンロード可能。",
  keywords: "",
  openGraph: {
    title: "マイナンバーカード写真 | AI自動調整サービス",
    description: "AI技術でマイナンバーカード写真を自動調整。100%審査通過保証で安心。",
    type: "website",
    locale: "ja_JP",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="canonical" href="https://mynumber-photo.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: "マイナンバーカード写真自動調整サービス",
              description: "AI技術でマイナンバーカード写真を自動調整するオンラインサービス",
              provider: {
                "@type": "Organization",
                name: "マイナンバーカード写真サービス",
              },
              offers: {
                "@type": "Offer",
                price: "500",
                priceCurrency: "JPY",
              },
            }),
          }}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "sou35pq5xg");
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-09LGCNQTVQ"
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-09LGCNQTVQ');
            `,
          }}
        />
      </head>
      <body className={notoSansJP.className}>{children}</body>
    </html>
  )
}
