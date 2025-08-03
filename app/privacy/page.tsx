import type { Metadata } from "next"
import { Camera, Shield, Lock, Eye } from "lucide-react"

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
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">マイナンバーカード写真</h1>
            </a>
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
                <a href="/" className="hover:text-emerald-600 transition-colors">
                  ホーム
                </a>
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
                    クッキーによって生成された、お客様のウェブサイト使用に関する情報は、通常Googleのサーバー（米国）に送信され、保存されます。このウェブサイトでIP匿名化が有効になっている場合、お客様のIPアドレスは、欧州連合加盟国または欧州経済地域協定の締約国の地域内でGoogleによって切り詰められます。
                  </p>
                  <p>
                    例外的な場合のみ、完全なIPアドレスが米国のGoogleサーバーに転送され、そこで切り詰められます。Googleは、このウェブサイトの運営者の代理として、ウェブサイトの使用状況の評価、ウェブサイト運営者向けのウェブサイト活動に関するレポートの作成、およびウェブサイト使用とインターネット使用に関連するその他のサービス提供の目的でこの情報を使用します。
                  </p>
                  <p>
                    お客様のブラウザがGoogle Analytics使用中に転送するIPアドレスは、Googleが保有する他のデータと関連付けられません。
                  </p>
                  <p>
                    お客様は、ブラウザソフトウェアで適切な設定を選択することでクッキーの使用を拒否できますが、その場合、このウェブサイトの全機能を使用できない可能性があることにご注意ください。さらに、以下のリンクから利用可能なブラウザプラグインをダウンロードしてインストールすることで、クッキーによって生成され、ウェブサイト使用に関連するデータ（お客様のIPアドレスを含む）の収集と、このデータのGoogleによる処理を防ぐことができます：
                  </p>
                  <p className="bg-gray-100 p-4 rounded">
                    <a href="http://tools.google.com/dlpage/gaoptout?hl=ja" className="text-emerald-600 hover:text-emerald-700">
                      http://tools.google.com/dlpage/gaoptout?hl=ja
                    </a>
                  </p>
                </div>
              </section>

              {/* Unwanted Email Harassment */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">不要なメールハラスメント</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社はスパムを嫌います。お客様と同様に、毎日宣伝メールの山をかき分けていますが、それに費やす時間が多すぎます。したがって、当社は不要な広告でお客様を煩わせることはありません。お客様のデータは当社によって第三者に提供されることはありません。
                  </p>
                </div>
              </section>

              {/* Facebook Plugins */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Facebookプラグイン（いいねボタン）使用に関するデータプライバシー声明</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社のページには、ソーシャルネットワークFacebook（Facebook Inc.、1601 Willow Road、Menlo Park、California、94025、USA）のプラグインが統合されています。Facebookプラグインは、当社のページのFacebookロゴまたは「いいねボタン」で認識できます。Facebookプラグインの概要については、以下をクリックしてください：
                  </p>
                  <p className="bg-gray-100 p-4 rounded">
                    <a href="http://developers.facebook.com/docs/plugins/" className="text-emerald-600 hover:text-emerald-700">
                      http://developers.facebook.com/docs/plugins/
                    </a>
                  </p>
                  <p>
                    当社のページを訪問すると、プラグインはお客様のブラウザとFacebookサーバーの間に直接接続を確立します。この方法で、Facebookはお客様のIPアドレスが当社のページを訪問したことを知らされます。Facebookアカウントにログインした状態でFacebook「いいねボタン」をクリックすると、Facebookプロフィールから当社のページのコンテンツにリンクできます。この方法で、Facebookは当社のページへの訪問をユーザーアカウントに割り当てることができます。ページの提供者として、当社は送信されたデータの内容またはFacebookによるその使用について通知されないことにご注意ください。詳細については、Facebookのデータプライバシー声明をご覧ください：
                  </p>
                  <p className="bg-gray-100 p-4 rounded">
                    <a href="http://ja-jp.facebook.com/policy.php" className="text-emerald-600 hover:text-emerald-700">
                      http://ja-jp.facebook.com/policy.php
                    </a>
                  </p>
                  <p>
                    Facebookが当社のページへの訪問をFacebookユーザーアカウントに割り当てることができないようにしたい場合は、Facebookユーザーアカウントからログアウトしてください。
                  </p>
                </div>
              </section>

              {/* Google +1 */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Google +1使用に関するデータプライバシー声明</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>情報の収集と配布：</strong><br />
                    Google +1ボタンにより、お客様は世界中に情報を公開できます。Google +1ボタンを通じて、お客様と他のユーザーはGoogleと当社のパートナーからパーソナライズされたコンテンツを受け取ります。Googleは、+1を押したコンテンツについて入力した情報と、+1をクリックしたときに訪問していたページに関する情報の両方を保存します。
                  </p>
                  <p>
                    お客様の+1は、検索結果やGoogleプロフィール、またはインターネット上のウェブサイトや広告の他の場所で、プロフィール名や写真と一緒にヒントとして表示される場合があります。Googleは、お客様と他のユーザーのためにGoogleサービスを改善するために、+1活動に関する情報を記録します。
                  </p>
                  <p>
                    Google +1ボタンを使用するには、少なくともプロフィール用に選択した名前を含む、グローバルに表示される公開Googleプロフィールが必要です。この名前はすべてのGoogleサービスで使用されます。場合によっては、この名前はGoogleアカウントを通じてコンテンツを共有したときに使用した別の名前を置き換えることもできます。
                  </p>
                  <p>
                    お客様のGoogleプロフィールの身元は、お客様のメールアドレスを知っている、またはお客様に関する他の識別情報を持っているユーザーに表示される場合があります。
                  </p>
                  <p>
                    <strong>収集された情報の使用：</strong><br />
                    上記で説明した使用に加えて、お客様が提供する情報は、適用されるGoogleデータ保護/プライバシーポリシーに従って使用されます。Googleは、ユーザーの+1活動に関する集計統計を公開したり、出版社、広告主、または関連ウェブサイトなどのユーザーやパートナーに開示したりする場合があります。
                  </p>
                </div>
              </section>

              {/* Twitter */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Twitter使用に関するデータ声明</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社のページには、Twitterサービスの機能が組み込まれています。これらの機能は、Twitter Inc.、Twitter, Inc. 1355 Market St, Suite 900, San Francisco, CA 94103, USAによって提供されています。
                  </p>
                  <p>
                    Twitterと「リツイート」機能を使用すると、訪問したウェブサイトがTwitterアカウントにリンクされ、他のユーザーに開示されます。この過程で、データもTwitterに送信されます。
                  </p>
                  <p>
                    ページの提供者として、当社は送信されたデータの内容またはTwitterによるその使用について通知されないことにご注意ください。このトピックに関する詳細については、Twitterのデータ保護/プライバシー声明をご覧ください：
                  </p>
                  <p className="bg-gray-100 p-4 rounded">
                    <a href="http://twitter.com/privacy" className="text-emerald-600 hover:text-emerald-700">
                      http://twitter.com/privacy
                    </a>
                  </p>
                  <p>
                    お客様は、以下にアクセスしてアカウント設定でTwitterのプライバシー設定を変更できます：
                  </p>
                  <p className="bg-gray-100 p-4 rounded">
                    <a href="http://twitter.com/account/settings" className="text-emerald-600 hover:text-emerald-700">
                      http://twitter.com/account/settings
                    </a>
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">データ保持期間</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、お客様の個人情報を以下の期間保持します：
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>アップロードされた写真：処理完了後30日間</li>
                    <li>注文情報：法的要件に従って保持</li>
                    <li>ログデータ：統計分析後削除</li>
                    <li>メールアドレス：サービス提供に必要な期間</li>
                  </ul>
                  <p>
                    お客様は、いつでもデータの削除を要求できます。削除要求は、support@mynumberphoto.comまでお送りください。
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">お問い合わせ</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    本プライバシーポリシーに関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。
                  </p>
                  <p>
                    <strong>メール：</strong> support@mynumberphoto.com
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">お問い合わせ</h3>
            <p className="text-emerald-700 mb-2">
              本プライバシーポリシーに関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <a 
              href="mailto:support@mynumberphoto.com" 
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
            >
              お問い合わせ：support@mynumberphoto.com
            </a>
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
                  <a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    マイナンバーカード写真
                  </a>
                </li>
              </ul>
            </div>

            {/* サポート */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-400">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    利用規約
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-emerald-400 font-medium">
                    プライバシーポリシー
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    お問い合わせ
                  </a>
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