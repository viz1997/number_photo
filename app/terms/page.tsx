import type { Metadata } from "next"
import { Camera } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "利用規約 | マイナンバーカード写真サービス | MyNumberPhoto",
  description: "マイナンバーカード写真サービスの利用規約。AI技術による写真自動調整サービスの利用条件、責任範囲、プライバシー保護について詳しく説明します。",
  keywords: "利用規約,マイナンバーカード,写真サービス,AI技術,写真自動調整,利用条件,プライバシー保護,MyNumberPhoto",
  openGraph: {
    title: "利用規約 | マイナンバーカード写真サービス",
    description: "マイナンバーカード写真サービスの利用規約。AI技術による写真自動調整サービスの利用条件について。",
    type: "website",
    locale: "ja_JP",
    url: "https://mynumber-photo.com/terms",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mynumber-photo.com/terms",
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "利用規約 | マイナンバーカード写真サービス",
            "description": "マイナンバーカード写真サービスの利用規約。AI技術による写真自動調整サービスの利用条件について。",
            "url": "https://mynumber-photo.com/terms",
            "mainEntity": {
              "@type": "Service",
              "name": "マイナンバーカード写真自動調整サービス",
              "provider": {
                "@type": "Organization",
                "name": "MyNumberPhoto",
                "url": "https://mynumber-photo.com"
              },
              "termsOfService": "https://mynumber-photo.com/terms"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "ホーム",
                  "item": "https://mynumber-photo.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "利用規約",
                  "item": "https://mynumber-photo.com/terms"
                }
              ]
            }
          }),
        }}
      />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">マイナンバーカード写真</h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  ホーム
                </Link>
              </li>
              <li className="text-gray-400">›</li>
              <li className="text-gray-900">利用規約</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">利用規約</h1>
            <p className="text-gray-600">
              最終更新日: 2025年1月1日
            </p>
          </div>

          {/* Terms Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              {/* General Terms */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第1条（適用）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本規約は、MyNumberPhoto（以下「当社」）が提供するマイナンバーカード写真自動調整サービス（以下「本サービス」）の利用条件を定めるものです。
                  </p>
                  <p>
                    本サービスをご利用いただくお客様（以下「利用者」）は、本規約に同意したものとみなします。
                  </p>
                </div>
              </section>

              {/* Service Description */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第2条（サービスの内容）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本サービスは、AI技術を使用してアップロードされた写真をマイナンバーカード申請用の規格に自動調整するサービスです。
                  </p>
                  <p>
                    本サービスでは以下の処理を行います：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>背景の自動除去・白背景化</li>
                    <li>サイズの自動調整（マイナンバーカード規格対応）</li>
                    <li>明度・コントラストの最適化</li>
                    <li>画質の向上</li>
                  </ul>
                </div>
              </section>

              {/* Usage Rules */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第3条（利用規則）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    利用者は、本サービスの利用にあたり、以下の事項を遵守するものとします：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>法令および公序良俗に反する行為を行わないこと</li>
                    <li>当社または第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為を行わないこと</li>
                    <li>本サービスの運営を妨害するおそれのある行為を行わないこと</li>
                    <li>他の利用者に関する個人情報等を収集または蓄積する行為を行わないこと</li>
                    <li>他の利用者に成りすます行為を行わないこと</li>
                    <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為を行わないこと</li>
                    <li>その他、当社が不適切と判断する行為を行わないこと</li>
                  </ul>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第4条（知的財産権）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本サービスに関する知的財産権は、当社または当社にライセンスを許諾している者に帰属します。
                  </p>
                  <p>
                    利用者がアップロードした写真の著作権は、利用者に帰属します。ただし、当社は本サービスの提供に必要な範囲で、当該写真を処理することができるものとします。
                  </p>
                </div>
              </section>

              {/* Privacy Protection */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第5条（プライバシー保護）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、利用者のプライバシーを尊重し、個人情報の保護に努めます。
                  </p>
                  <p>
                    個人情報の取り扱いについては、別途定めるプライバシーポリシーに従います。
                  </p>
                  <p>
                    アップロードされた写真は、処理完了後24時間以内に自動的に削除されます。
                  </p>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第6条（免責事項）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、本サービスに関して、利用者と他の利用者または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
                  </p>
                  <p>
                    当社は、本サービスの内容変更、中断、終了によって生じたいかなる損害についても、一切の責任を負いません。
                  </p>
                  <p>
                    当社は、利用者が本サービスを利用して得た情報等について、正確性、有用性等いかなる保証も行いません。
                  </p>
                </div>
              </section>

              {/* Service Changes */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第7条（サービス内容の変更等）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとします。
                  </p>
                  <p>
                    当社は、本サービスの提供の停止によって生じたいかなる損害についても、一切の責任を負いません。
                  </p>
                </div>
              </section>

              {/* Terms Changes */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第8条（利用規約の変更）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
                  </p>
                  <p>
                    本規約の変更後、本サービスの利用を継続した場合には、変更後の規約に同意したものとみなします。
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第9条（準拠法・裁判管轄）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本規約の解釈にあたっては、日本法を準拠法とします。
                  </p>
                  <p>
                    本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">第10条（お問い合わせ）</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本規約に関するお問い合わせは、以下の方法でお願いいたします。
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">MyNumberPhoto</p>
                    <p>Email: support@mynumber-photo.com</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* 公司信息 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">マイナンバーカード写真</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI技術でマイナンバーカード写真を自動調整するオンラインサービス。
              </p>
            </div>

            {/* サービス */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-400">サービス</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    マイナンバーカード写真
                  </Link>
                </li>
              </ul>
            </div>

            {/* サポート */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-400">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-emerald-400 font-medium">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 分割线 */}
          <div className="border-t border-gray-800 mt-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-sm text-gray-400">
                <span>&copy; 2025 マイナンバーカード写真サービス. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 