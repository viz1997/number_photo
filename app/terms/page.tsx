import { Shield, CheckCircle, AlertCircle, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
              <Link href="/terms" className="text-emerald-600 font-medium">
                利用規約
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-emerald-600 transition-colors">
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
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">利用規約</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              最終更新日: 2025年1月1日
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                1. 利用規約への同意
              </h2>
              <p className="text-gray-700 mb-4">
                本利用規約（以下「本規約」）は、Mynumberphoto（以下「当社」）が運営するmynumberphoto.com（以下「本サイト」）の利用に関する条件を定めるものです。
              </p>
              <p className="text-gray-700 mb-4">
                本サイトをご利用いただくことで、お客様は本規約に同意したものとみなされます。本規約に同意されない場合は、本サイトの利用をお控えください。
              </p>
              <p className="text-gray-700">
                当社は、必要に応じて本規約を変更する場合があります。変更があった場合は、本サイト上でお知らせいたします。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                2. サービスの内容
              </h2>
              <p className="text-gray-700 mb-4">
                当社は、お客様がアップロードされた写真を最新のAI技術を用いてマイナンバーカード用の規格に適合するよう処理するサービス（以下「本サービス」）を提供いたします。
              </p>
              <div className="bg-emerald-50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold text-emerald-800 mb-3">本サービスに含まれる処理：</h3>
                <ul className="space-y-2 text-emerald-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    背景の自動除去と白背景への変換
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    マイナンバーカード規格に適合するサイズ調整
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    明度・コントラストの最適化
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 mr-2 flex-shrink-0" />
                    自然な美顔処理
                  </li>
                </ul>
              </div>
            </section>



            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                3. 禁止事項
              </h2>
              <p className="text-gray-700 mb-4">
                本サイトの利用にあたり、以下の行為は禁止されています：
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  本サイトのセキュリティ機能を無効化または回避する行為
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  ウイルスやマルウェアをアップロードする行為
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  当社のサーバーに過度な負荷をかける行為
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  他人の権利を侵害するコンテンツをアップロードする行為
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  本サイトを商業目的で利用する行為（当社が許可した場合を除く）
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                4. 免責事項
              </h2>
              <p className="text-gray-700 mb-4">
                本サイトは「現状のまま」提供され、当社は以下の事項について一切の責任を負いません：
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                  本サイトの利用により生じるいかなる損害
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                  本サイトの一時的な停止またはアクセス不能
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                  アップロードされたデータの損失または破損
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                  第三者が提供するサービスに関連する問題
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                5. 知的財産権
              </h2>
              <p className="text-gray-700 mb-4">
                本サイトのコンテンツ、デザイン、ロゴ、商標等の知的財産権は、当社または当社のライセンサーに帰属します。
              </p>
              <p className="text-gray-700 mb-4">
                お客様がアップロードされた写真の著作権は、お客様に帰属します。当社は、本サービスの提供に必要な範囲でのみ、お客様の写真を使用いたします。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                6. 準拠法と管轄裁判所
              </h2>
              <p className="text-gray-700 mb-4">
                本規約の解釈および適用については、日本法が準拠法となります。
              </p>
              <p className="text-gray-700">
                本規約に関して紛争が生じた場合、東京地方裁判所を第一審の専属管轄裁判所とします。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                7. お問い合わせ
              </h2>
              <p className="text-gray-700 mb-6">
                本規約に関するお問い合わせは、以下の方法でお願いいたします：
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