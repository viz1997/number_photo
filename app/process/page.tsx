"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function ProcessPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get original image from sessionStorage
    const previewUrl = sessionStorage.getItem("previewUrl")
    if (previewUrl) {
      setOriginalImageUrl(previewUrl)
    }

    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          // Set processed image (with watermark simulation)
          setProcessedImageUrl("/placeholder.svg?height=400&width=400")
          return 100
        }
        return prev + 5
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const handlePayment = () => {
    router.push("/payment")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">写真処理中</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">処理</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <span className="ml-2 text-gray-500">支払い</span>
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

          {isProcessing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">写真を処理しています...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">マイナンバーカード規格に合わせて写真を調整中です</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>処理進行状況</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">処理内容</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 背景を無地に調整</li>
                    <li>• サイズを規格に合わせて調整</li>
                    <li>• 明度・コントラストの最適化</li>
                    <li>• ファイル形式の最適化</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-emerald-600">
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    処理完了
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div className="text-center">
                      <h3 className="font-semibold mb-4">元の写真</h3>
                      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        {originalImageUrl && (
                          <Image
                            src={originalImageUrl || "/placeholder.svg"}
                            alt="元の写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Processed Image */}
                    <div className="text-center">
                      <h3 className="font-semibold mb-4">処理後の写真</h3>
                      <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50 relative">
                        {processedImageUrl && (
                          <>
                            <Image
                              src={processedImageUrl || "/placeholder.svg"}
                              alt="処理後の写真"
                              width={250}
                              height={250}
                              className="mx-auto rounded object-cover"
                            />
                            {/* Watermark overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm font-semibold transform rotate-12">
                                SAMPLE
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">※プレビューにはウォーターマークが表示されます</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">調整内容</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-700">
                      <div>
                        <p>• 背景: 無地白色に調整</p>
                        <p>• サイズ: 4.5cm × 3.5cm (規格準拠)</p>
                      </div>
                      <div>
                        <p>• 解像度: 300dpi (高画質)</p>
                        <p>• ファイル形式: JPEG</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 inline-block mb-4">
                      <div className="text-2xl font-bold text-emerald-600">¥500</div>
                      <div className="text-sm text-gray-600">高画質写真1枚</div>
                    </div>
                    <div>
                      <Button onClick={handlePayment} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                        支払いに進む
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
