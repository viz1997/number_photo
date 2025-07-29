"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Mail, CheckCircle, Clock, Star } from "lucide-react"
import Image from "next/image"

export default function DownloadPage({ params }: { params: { token: string } }) {
  const [userEmail, setUserEmail] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("23:59:45")

  useEffect(() => {
    // Get user email from sessionStorage
    const email = sessionStorage.getItem("userEmail")
    if (email) {
      setUserEmail(email)
    }

    // Simulate countdown timer
    let hours = 23,
      minutes = 59,
      seconds = 45
    const timer = setInterval(() => {
      seconds--
      if (seconds < 0) {
        seconds = 59
        minutes--
        if (minutes < 0) {
          minutes = 59
          hours--
          if (hours < 0) {
            clearInterval(timer)
            return
          }
        }
      }
      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement("a")
    link.href = "/placeholder.svg?height=600&width=600"
    link.download = "mynumber-photo.jpg"
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ダウンロード</h1>
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
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">支払い</span>
              </div>
              <div className="w-8 h-px bg-emerald-600"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">ダウンロード</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Success Message */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-emerald-800 mb-2">処理完了！</h2>
                  <p className="text-emerald-700">お支払いありがとうございました。写真の処理が完了しました。</p>
                </div>
              </CardContent>
            </Card>

            {/* Download Section */}
            <Card>
              <CardHeader>
                <CardTitle>高画質写真ダウンロード</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50 inline-block mb-4">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="完成した写真"
                      width={300}
                      height={300}
                      className="rounded object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">マイナンバーカード申請規格準拠・高画質JPEG</p>

                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    高画質写真をダウンロード
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">写真の仕様</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p>• サイズ: 4.5cm × 3.5cm</p>
                      <p>• 解像度: 300dpi</p>
                    </div>
                    <div>
                      <p>• ファイル形式: JPEG</p>
                      <p>• 背景: 無地白色</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  メール送信完了
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">ダウンロードリンクを送信しました</p>
                    <p className="text-sm text-gray-600 mb-2">{userEmail} にダウンロードリンクをお送りしました。</p>
                    <p className="text-xs text-gray-500">
                      メールが届かない場合は、迷惑メールフォルダもご確認ください。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Limit Warning */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-orange-800 mb-2">ダウンロード期限</h4>
                    <p className="text-sm text-orange-700 mb-2">このダウンロードリンクは24時間有効です。</p>
                    <div className="text-lg font-mono font-bold text-orange-800">残り時間: {timeRemaining}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  サービスはいかがでしたか？
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">今後のサービス向上のため、ご感想をお聞かせください。</p>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="w-8 h-8 text-gray-300 hover:text-yellow-400 transition-colors">
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
