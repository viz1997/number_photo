import type { Metadata } from "next"
import { Camera, Shield, Lock, Eye } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "プライバシーポリシー | マイナンバーカード写真サービス | MyNumberPhoto",
  description: "マイナンバーカード写真サービスのプライバシーポリシー。個人情報の収集、使用、保護について詳しく説明します。",
  keywords: "プライバシーポリシー,個人情報保護,データ保護,マイナンバーカード,写真サービス,MyNumberPhoto",
  openGraph: {
    title: "プライバシーポリシー | マイナンバーカード写真サービス",
    description: "マイナンバーカード写真サービスのプライバシーポリシー。個人情報の収集、使用、保護について。",
    type: "website",
    locale: "ja_JP",
    url: "https://mynumber-photo.com/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mynumber-photo.com/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "プライバシーポリシー | マイナンバーカード写真サービス",
            "description": "マイナンバーカード写真サービスのプライバシーポリシー。個人情報の収集、使用、保護について。",
            "url": "https://mynumber-photo.com/privacy",
            "mainEntity": {
              "@type": "Service",
              "name": "マイナンバーカード写真自動調整サービス",
              "provider": {
                "@type": "Organization",
                "name": "MyNumberPhoto",
                "url": "https://mynumber-photo.com"
              },
              "privacyPolicy": "https://mynumber-photo.com/privacy"
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
                  "name": "プライバシーポリシー",
                  "item": "https://mynumber-photo.com/privacy"
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
              <li className="text-gray-900">プライバシーポリシー</li>
            </ol>
          </nav>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
            <p className="text-gray-600">
              最終更新日: 2025年1月1日
            </p>
          </div>

          {/* Privacy Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              {/* General Information */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">総則</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    MyNumberPhoto（以下「当社」）は、お客様のデータを機密に取り扱う義務があります。当社は、この内容を随時適応する権利を留保し、定期的にご確認いただくことをお勧めします。
                  </p>
                  <p>
                    お客様が当社に送信されたデータは、決して第三者に提供されることはありません。
                  </p>
                  <p>
                    お客様は、マイナンバーカード写真を注文せず、無料でダウンロードする場合、個人データを提供することなく当社の写真生成サービスをご利用いただけます。その場合、アップロードされた写真は個人データと関連付けられません。
                  </p>
                  <p>
                    当社のサイトでの登録は必要ありません。注文に必要なすべてのデータは、その都度指定でき、任意のプロファイルに関連付けることができます。
                  </p>
                  <p>
                    さらなる安全対策として、当社のウェブサイト使用後にブラウザのキャッシュをクリアすることをお勧めします。この機能については、通常ブラウザのツールメニュー項目でご確認いただけます（Firefox: ツール &gt; プライベートデータを消去、Internet Explorer: ツール &gt; インターネットオプション &gt; 履歴/キャッシュを消去、Chrome: 「レンチ」 &gt; オプション &gt; 閲覧データを消去）。この機能により、このPCで唯一作業していない場合、見知らぬ人がお客様の個人情報にアクセスできないことが保証されます。
                  </p>
                </div>
              </section>

              {/* Automatic Data Processing */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-emerald-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">このインターネットサイトでの自動データ処理</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、お客様のブラウザが当社に送信する情報を自動的に収集し、サーバーログファイルに保存します。これらは以下の通りです：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>ブラウザの種類 / バージョン</li>
                    <li>使用されているオペレーティングシステム</li>
                    <li>リファラーURL（以前に訪問したページ）</li>
                    <li>アクセスしているコンピュータのホスト名（IPアドレス）</li>
                    <li>サーバーリクエストの日時</li>
                  </ul>
                  <p>
                    これらのデータは特定可能ではありません。このデータと他のデータソースとの統合は行われません。データは統計的評価後に削除されます。
                  </p>
                </div>
              </section>

              {/* Google Analytics */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-emerald-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Google Analytics</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    このサイトは、Google Inc.（「Google」）のウェブ分析サービスであるGoogle Analyticsを使用しています。Google Analyticsは、いわゆる「クッキー」を使用します。クッキーは、お客様のコンピュータに保存されるテキストファイルで、サイトの使用状況の分析を可能にします。
                  </p>
                  <p>
                    クッキーによって生成されたお客様のサイト使用に関する情報（IPアドレスを含む）は、Googleに送信され、Googleのサーバーに保存されます。Googleは、この情報を使用して、サイトの使用状況を評価し、サイト運営者にサイト活動に関するレポートを作成し、サイト活動およびインターネット使用に関連するその他のサービスを提供します。
                  </p>
                  <p>
                    Googleは、法律で要求される場合、またはGoogleがお客様の情報を処理する権限を第三者に委任する場合を除き、第三者にこの情報を提供することはありません。Googleは、お客様のIPアドレスをGoogleの他のデータと関連付けることはありません。
                  </p>
                  <p>
                    お客様は、ブラウザの設定を調整することで、クッキーの使用を拒否できます。ただし、その場合、サイトの一部の機能が正常に動作しない可能性があります。このサイトを使用することで、お客様は、上記の方法でお客様のデータをGoogleが処理することに同意したものとみなされます。
                  </p>
                </div>
              </section>

              {/* Data Protection Rights */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">データ保護に関する権利</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    お客様は、以下の権利を有します：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>個人データへのアクセス権</li>
                    <li>個人データの訂正権</li>
                    <li>個人データの削除権</li>
                    <li>個人データの処理制限権</li>
                    <li>データポータビリティ権</li>
                    <li>異議申立て権</li>
                  </ul>
                  <p>
                    これらの権利を行使したい場合は、当社までお問い合わせください。
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-emerald-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">お問い合わせ</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    プライバシーポリシーに関するご質問やご意見がございましたら、以下の方法でお問い合わせください：
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">MyNumberPhoto</p>
                    <p>Email: privacy@mynumber-photo.com</p>
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
                  <Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-emerald-400 font-medium">
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