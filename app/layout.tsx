import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "マイナンバーカード写真 | AI自動調整で100%審査通過保証 | ¥500",
  description:
    "マイナンバーカード写真をAI技術で自動調整。どんな写真も30秒で規格準拠の証件照に変換。100%審査通過保証、不通過なら全額返金。¥500で即座にダウンロード可能。",
  keywords: "マイナンバーカード,写真,証件照,AI,自動調整,審査通過,オンライン申請,Flux",
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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
