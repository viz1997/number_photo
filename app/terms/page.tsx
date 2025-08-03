import type { Metadata } from "next"
import { Camera } from "lucide-react"

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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">マイナンバーカード写真</h1>
            </div>
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
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 総則、適用範囲</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) MyNumberPhoto（以下「当社」）とお客様との間のビジネス関係については、以下に定める利用規約（以下「本規約」）の最新版のみが適用されます。
                  </p>
                  <p>
                    (2) 本規約は、日本国内におけるすべてのサービス提供に適用されます。
                  </p>
                  <p>
                    (3) 本規約は、オンラインでのサービス利用の目的でお客様が保存および印刷することができます。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 契約当事者</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    お客様の契約当事者は、MyNumberPhoto（以下「当社」）です。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 契約の成立</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社とお客様との間で、デジタル写真編集サービス（以下「編集済み画像ファイル」）に関する契約は、お客様がオンラインでサービスを利用し、当社がその利用を確認した時点で成立します。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 受諾保証、写真編集</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) お客様がマイナンバーカード申請目的でサービスを利用された場合、当社は作成された写真がマイナンバーカード申請要件を満たすことを保証します。万が一、申請が拒否された場合は、お客様から新しい写真をご提供いただければ、無償で再作成いたします。
                  </p>
                  <p>
                    (2) 当社は、お客様の写真をデジタル編集いたします。特にマイナンバーカード申請目的が指定されている場合、品質向上および公式要件への適合を目的として編集を行います。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 料金</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    サービス提供は、契約成立日の当社ウェブサイトに記載された適用料金（日本円）に基づいて行われます。すべての料金は税込み最終価格です。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 サービス提供、配信</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) サービス提供は、お客様が指定されたメールアドレスへのデジタル配信により行われます。サービスは、本規約第7条に従った全額支払いの受領後に提供されます。
                  </p>
                  <p>
                    (2) お客様がマイナンバーカード申請目的を指定されている場合、提供された写真が適切でない場合、当社は予想される拒否理由を明記してお客様に通知いたします。
                  </p>
                  <p>
                    (3) 当社は部分的なサービス提供を行う権利を有します。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 支払い、遅延</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) お客様は、サービス利用時に希望する支払い方法を指定してください。利用可能な支払い方法は、クレジットカード決済またはその他のオンライン決済サービスです。
                  </p>
                  <p>
                    (2) お客様が支払いを遅延した場合、当社は遅延料金を請求する権利を有します。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 解約権</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    解約権は存在しません。特に、作成された写真はお客様の指定に基づいて作成され、お客様の個人的ニーズに合わせて調整されているためです。ただし、第9条の規定は留保されます。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 瑕疵担保請求</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) サービスは、デジタル写真編集および処理の技術基準を満たさない場合に瑕疵があるとみなされます。
                  </p>
                  <p>
                    (2) お客様は、明らかな瑕疵をサービス受領後14日以内に申し立てる必要があります。当社ウェブサイトの連絡先またはメールでの連絡で十分です。
                  </p>
                  <p>
                    (3) 正当な苦情の場合、当社は代替サービスを提供する権利を有します。代替提供が不可能、失敗、またはお客様が設定した合理的な期間内に行われない場合、お客様は契約解除または購入価格の減額を要求する権利を有します。
                  </p>
                  <p>
                    (4) 元の画像ファイルの品質が低い場合、瑕疵とはみなされません。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 瑕疵責任</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    当社は、故意または重過失、および生命、身体または健康の侵害によるすべての損害について責任を負います。軽過失については、当社は本質的な契約義務の違反、特に製品自体への損害についてのみ責任を負います。責任は通常予見可能な契約損害に限定されます。お客様の注文後に発生する損害に対する追加請求は、特に除外されます。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 相殺</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    お客様による相殺は、お客様の反対請求が法的に確立されているか、当社によって争われていない場合のみ可能です。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 所有権の留保</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    完全な支払いまで、サービス成果物は当社の所有物となります。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 データ保護、データバックアップ</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) お客様は、注文処理およびアーカイブに必要な個人情報がディスクに保存されることを認識し、同意します。お客様は、個人データの収集、処理、使用に明示的に同意します。すべてのデータは当社によって機密に取り扱われます。お客様は、将来に向けて効力を有する同意をいつでも撤回する権利を有します。
                  </p>
                  <p>
                    (2) 注文時に、当社はお客様がサービス提供時または画像ファイル受領時を超えてデータセットをバックアップすることを前提としています。お客様が当社に送信したデータのバックアップは行われません。
                  </p>
                  <p>
                    (3) 注文処理の目的で、お客様は画像ファイル、特に画像印刷のために第三者に提供されることに同意します。ただし、個人データの転送は行われません。
                  </p>
                  <p>
                    (4) お客様が注文のために送信した画像は、再注文を可能にするため、30暦日間当社によって保存されます。お客様の要求により、送信された画像ファイルは注文完了後直ちに削除されます。
                  </p>
                  <p>
                    (5) サービスに瑕疵がある場合、またはお客様の意見でサービスに瑕疵がある場合、事実の最終的な明確化後にのみ解約が可能です。
                  </p>
                  <p>
                    (6) 当社が法的に保存を義務付けられている場合、削除請求も存在しません。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 14 著作権、人格権、民事法の側面</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) 注文処理の目的で、お客様は当社に画像ファイルの非独占的ライセンスを付与し、それらの編集を許可します。ここで、画像の編集とは、必要に応じて画像のトリミングおよび後処理（特に明度、コントラスト、色相、背景のレタッチ）の両方を理解します。
                  </p>
                  <p>
                    (2) 送信された画像ファイルの内容については、お客様が単独で責任を負います。当社に提供されたすべての画像ファイルは、お客様の著作権、商標権、またはその他の権利の要件を満たしています。送信により、お客様は第三者の権利を侵害しないことを確認します。お客様は、これらの権利の侵害から生じるすべての損害から当社を免責します。
                  </p>
                  <p>
                    (3) さらに、注文により、お客様は送信された画像ファイルの内容が、特に児童ポルノの配布に関する規則および未成年者のポルノ表現に関する刑法に違反しないことを保証します。当社がこの保証の違反を認識した場合、当社は直ちに適切な法執行当局に連絡します。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 15 履行地、裁判管轄権および準拠法</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    (1) 契約関係から生じるすべての義務の履行地は、当社の所在地です。
                  </p>
                  <p>
                    (2) ビジネス関係に関連する法的紛争の場合、日本法のみが適用されます。
                  </p>
                  <p>
                    (3) 訴訟提起時に、お客様が日本国内に住所または通常の居所、または裁判管轄権の場所を持たない場合、またはお客様が商人であり、その能力で行動する場合、当社の所在地が専属裁判管轄権となります。
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 16 分離条項</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    この契約の個別の規定が無効または実行不可能である場合、または契約締結後に無効または執行不能になった場合、契約の有効性は他の点では影響を受けません。無効または執行不能な規定は、契約当事者が無効または執行不能な規定で追求しようとしていた経済的目的の効果に最も近い有効で執行可能な規制に置き換えられます。契約が不完全であることが判明した場合、前記の規定は適切に修正されて適用されます。
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 bg-emerald-50 rounded-lg p-6 border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">お問い合わせ</h3>
            <p className="text-emerald-700 mb-2">
              本利用規約に関するご質問やご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <a 
              href="/contact" 
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
                  <a href="/terms" className="text-emerald-400 font-medium">
                    利用規約
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
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