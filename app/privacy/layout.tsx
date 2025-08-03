import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | マイナンバーカード写真サービス - 個人情報保護方針',
  description: 'Mynumberphotoのプライバシーポリシーです。AI技術によるマイナンバーカード写真処理サービスにおける個人情報の収集、利用、保護について詳しく説明しています。',
  openGraph: {
    title: 'プライバシーポリシー | マイナンバーカード写真サービス',
    description: 'AI技術によるマイナンバーカード写真処理サービスのプライバシーポリシー。個人情報の保護、Cookie使用、GDPR対応について詳しく説明。',
    type: 'website',
    url: 'https://mynumberphoto.com/privacy',
  },
  alternates: {
    canonical: 'https://mynumberphoto.com/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 