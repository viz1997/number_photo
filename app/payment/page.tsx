"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Mail, Shield, CheckCircle } from "lucide-react"

export default function PaymentPage() {
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    if (!email) {
      alert("メールアドレスを入力してください")
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      // Generate a mock token for download
      const token = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem("userEmail", email)
      router.push(`/download/${token}`)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/favicon-32x32.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded"
              />
              <h1 className="text-xl font-bold text-gray-900">マイナンバーカード写真</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-900"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">アップロード</span>
              </div>
              <div className="w-8 h-px bg-emerald-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">処理</span>
              </div>
              <div className="w-8 h-px bg-emerald-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">支払い</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">
                  4
                </div>
                <span className="ml-2 text-gray-500">ダウンロード</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ご注文内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center py-4 border-b">
                  <div>
                    <h3 className="font-semibold">マイナンバーカード用写真処理</h3>
                    <p className="text-sm text-gray-600">高画質JPEG形式 × 1枚</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">¥500</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 font-semibold text-lg">
                  <span>合計</span>
                  <span className="text-emerald-600">¥500</span>
                </div>
              </CardContent>
            </Card>

            {/* Email Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  メールアドレス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      処理完了後、こちらのメールアドレスにダウンロードリンクをお送りします
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-emerald-800 mb-2">セキュリティについて</h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• SSL暗号化により安全に決済処理を行います</li>
                      <li>• クレジットカード情報は保存されません</li>
                      <li>• 写真データは24時間後に自動削除されます</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handlePayment}
                  disabled={!email || isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      決済処理中...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      ¥500 を支払う
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  お支払いボタンをクリックすることで、利用規約に同意したものとみなします
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
