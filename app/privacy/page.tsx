import { Shield, CheckCircle, AlertCircle, Mail, MapPin, Phone, Eye, Lock, Database } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">マイナンバーカード写真</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors">
                ホーム
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="text-emerald-600 font-medium">
                プライバシーポリシー
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              最終更新日: 2025年1月1日
            </p>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 text-emerald-600 mr-3" />
                プライバシーの保護について
              </h2>
              <p className="text-gray-700 mb-4">
                当社は、お客様のプライバシーを尊重し、お客様が当社と共有される情報の適切な保護と管理の必要性を認識しています。本プライバシーポリシーは、当社がお客様の情報をどのように取り扱うかを説明するものです。
              </p>
              <p className="text-gray-700">
                当社は、お客様の個人情報の保護を最優先に考え、適切なセキュリティ対策を実施しています。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Database className="w-6 h-6 text-emerald-600 mr-3" />
                情報の収集と利用
              </h2>
              <p className="text-gray-700 mb-4">
                より良いサービスを提供するため、当社のウェブサイトをご利用いただく際に、お客様から特定の個人を識別できる情報を提供していただく場合があります。例えば、お問い合わせの際に必要な情報です。
              </p>
              <p className="text-gray-700 mb-4">
                当社が要求する情報は、当社に保持され、本プライバシーポリシーに記載されている通りに使用されます。
              </p>
              <p className="text-gray-700 mb-4">
                お客様は、個人情報を提供することなくウェブサイトをご利用いただけます。ただし、個人情報を提供しない場合、ウェブサイトの特定の機能が利用できない場合があります。
              </p>
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-semibold text-emerald-800 mb-3">情報の共有について</h3>
                <p className="text-emerald-700">
                  当社は、収集した情報を販売、共有、または譲渡することはありません。ただし、一般的に適用される法律により要求される場合、またはお客様へのサービス提供に必要な場合を除きます。
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="w-6 h-6 text-emerald-600 mr-3" />
                写真データの取り扱い
              </h2>
              <p className="text-gray-700 mb-4">
                当社のウェブサイトにアップロードされた写真は、お客様の写真が処理されるまで当社のサーバーに保存されます。
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 mb-3">写真データの保護</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    処理完了後、写真データは自動的に削除されます
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    第三者への写真データの提供は一切行いません
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    暗号化された安全な通信を使用しています
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Database className="w-6 h-6 text-emerald-600 mr-3" />
                非識別情報
              </h2>
              <p className="text-gray-700 mb-4">
                お客様がウェブサイトとやり取りする際、当社は特定の個人を識別できない情報を受信し、保存します。このような情報は、様々な技術を使用して受動的に収集され、現在のところお客様を特定するために使用することはできません。
              </p>
              <p className="text-gray-700 mb-4">
                当社は、このような情報を自ら保存するか、Google Analyticsなどのサービスプロバイダーのデータベースに含める場合があります。このウェブサイトは、このような情報を使用し、他の情報と組み合わせて、例えば、当社のウェブサイトへの総訪問者数、ウェブサイトの各ページへの訪問者数、デスクトップ訪問者の総数などを追跡する場合があります。
              </p>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">重要な注意事項</h3>
                <p className="text-yellow-700">
                  このプロセスでは、個人情報は利用できず、使用されません。
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                Google Analytics
              </h2>
              <p className="text-gray-700 mb-4">
                当社のウェブサイトは、ウェブサイトのパフォーマンスを向上させるためにGoogle Analyticsを使用しています。以下は、当社のウェブサイトで使用されているGoogle Analyticsのプライバシーポリシーへのリンクです。
              </p>
              <p className="text-gray-700 mb-4">
                当社は、ウェブサイトへの訪問者を誘導するためにGoogle広告プラットフォームを使用しています。Google広告のパフォーマンスを分析するために、当社のGoogle Analyticsでエンハンスドコンバージョン追跡を使用しています。
              </p>
              <div className="bg-red-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-red-800 mb-3">情報の共有について</h3>
                <p className="text-red-700 mb-3">
                  当社は、広告測定サービスを当社に代わって実行するために、第三者（Google）とお客様の情報（メールアドレス）を共有します。当社は、このような共有と使用について、法律で要求される場合、購入時に顧客の同意を得ています。
                </p>
                <p className="text-red-700">
                  購入を行う場合、お客様は当社のプライバシーポリシーと利用規約に同意したものとみなされます。
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">ユーザーの選択と制御</h3>
                <p className="text-blue-700 mb-3">
                  Google広告経由で当社のウェブサイトにアクセスし、Googleアカウントユーザーである場合、「マイアクティビティ」の「ウェブとアプリのアクティビティ」設定を調整することで、データの使用方法を制御できます。
                </p>
                <p className="text-blue-700">
                  Google広告経由で当社のウェブサイトにアクセスし、第三者とのメール共有に同意されない場合は、購入をお控えください。
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                Cookie（クッキー）
              </h2>
              <p className="text-gray-700 mb-4">
                このウェブサイトは、お客様のPC、携帯電話、またはタブレットに情報を保存するCookieおよび類似技術を使用しています。これは通常、デバイスのブラウザに保存されます。
              </p>
              <p className="text-gray-700 mb-4">
                当社は、Cookieを使用して、訪問者にウェブサイトの異なる機能へのアクセスを許可し、ユーザーを互いに区別し、ウェブサイトのパフォーマンスを分析し、ユーザーに適応した興味ベースの広告を活用します。
              </p>
              <div className="bg-emerald-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-emerald-800 mb-3">Cookieの目的</h3>
                <ul className="space-y-2 text-emerald-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    分析：当社のウェブサイトのユニーク訪問者数をカウントし、ウェブサイトの運用と機能に関する統計を開発するためにCookieを活用します
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    ページ訪問とユーザー情報（地理的位置、デバイス、オペレーティングシステム、ブラウザ）に関する情報を保存します
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">Cookieの制御</h3>
                <p className="text-yellow-700">
                  訪問者は、ブラウザまたはデバイスの設定を通じて、Cookieの使用を自発的に選択できます。ブラウザ設定で、ブラウザがダウンロードするCookieの設定を調整できます。また、ブラウザまたはデバイスに保存されている既存のCookieをすべて削除することもできます。
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertCircle className="w-6 h-6 text-emerald-600 mr-3" />
                お子様のプライバシー
              </h2>
              <p className="text-gray-700 mb-4">
                このウェブサイトは、お子様を引き付けるために作成されたものではありません。したがって、当社は、13歳未満であることがわかっている方から個人情報を収集する意図はありません。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 text-emerald-600 mr-3" />
                GDPR（一般データ保護規則）プライバシー権利
              </h2>
              <p className="text-gray-700 mb-4">
                GDPRは、個人データを処理するサービスを使用する際に、欧州経済領域（EEA）の市民に特定の権利を与えます。お客様がこれらの権利を行使できるように、当社は変更を行い、お客様がデータをより適切に制御できるようになりました。
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 mb-3">GDPRが提供する個人の権利：</h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    個人データがどのように処理されるかについて知る権利
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    個人データへのアクセス権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    訂正権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    削除権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    処理の制限権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    データポータビリティ権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    異議申し立て権
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    自動化された意思決定とプロファイリングに関する権利
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="w-6 h-6 text-emerald-600 mr-3" />
                お問い合わせ・アクセス要求
              </h2>
              <p className="text-gray-700 mb-4">
                当社がお客様について保存している個人データへのアクセス、引き渡し、修正、または削除をご希望の場合は、support@mynumberphoto.comまでメールをお送りください。
              </p>
              <p className="text-gray-700 mb-6">
                また、いつでも異議を申し立て、制限を要求し、同意を撤回することもできます。
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-gray-700">メール: support@mynumberphoto.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-gray-700">住所: 東京都渋谷区（詳細はお問い合わせください）</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-emerald-600 mr-3" />
                    <span className="text-gray-700">電話: 03-XXXX-XXXX（平日9:00-18:00）</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                Cookieとその関連第三者プロバイダーのリスト
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">名前</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">目的</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">期間</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">第三者アクセスと連絡先</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">Google Analytics</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">分析</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">最大540日</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">https://www.google.com/analytics/</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">Facebook</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">興味ベースマーケティング</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">最大540日</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">facebook.com, staticxx.facebook.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">Twitter</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">興味ベースマーケティング</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">最大540日</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">twitter.com, platform.twitter.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">Youtube</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">分析</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">最大540日</td>
                      <td className="px-4 py-3 text-sm text-gray-700 border-b">youtube.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">Cloudflare</td>
                      <td className="px-4 py-3 text-sm text-gray-700">分析</td>
                      <td className="px-4 py-3 text-sm text-gray-700">最大540日</td>
                      <td className="px-4 py-3 text-sm text-gray-700">cloudflare.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
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
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold">マイナンバーカード写真</span>
              </div>
              <p className="text-gray-400 mb-4">
                最新AI技術で完璧なマイナンバーカード写真を提供。<br />
                背景除去、サイズ調整、美顔処理を自動で実行します。
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">サービス</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    写真処理
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    料金プラン
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    サンプル写真
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">サポート</h3>
              <ul className="space-y-2">
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

          <div className="border-t border-gray-800 mt-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-sm text-gray-400">
                <span>&copy; 2025 Mynumberphoto. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 