import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約 | マイナンバーカード写真サービス - AI技術で完璧な写真を提供',
  description: 'Mynumberphotoの利用規約です。AI技術によるマイナンバーカード写真処理サービスの利用条件、料金、返金ポリシー、禁止事項などを詳しく説明しています。',
  openGraph: {
    title: '利用規約 | マイナンバーカード写真サービス',
    description: 'AI技術によるマイナンバーカード写真処理サービスの利用規約。料金、返金ポリシー、禁止事項を詳しく説明。',
    type: 'website',
    url: 'https://mynumberphoto.com/terms',
  },
  alternates: {
    canonical: 'https://mynumberphoto.com/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 