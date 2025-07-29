"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Camera,
  CreditCard,
  Download,
  CheckCircle,
  Shield,
  HelpCircle,
  Star,
  Loader2,
  RefreshCw,
  Users,
  Award,
  Clock,
  Zap,
  ExternalLink,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "payment" | "download">("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [email, setEmail] = useState("")
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [downloadToken, setDownloadToken] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      simulateUpload()
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 7 * 1024 * 1024,
  })

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setCurrentStep("processing")
          simulateProcessing()
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setProcessedUrl("/placeholder.svg?height=400&width=400")
          setCurrentStep("payment")
          return 100
        }
        return prev + 3
      })
    }, 300)
  }

  const handlePayment = async () => {
    if (!email) {
      alert("メールアドレスを入力してください")
      return
    }

    setIsPaymentProcessing(true)

    setTimeout(() => {
      setIsPaymentProcessing(false)
      setShowPaymentDialog(false)
      setDownloadToken(Math.random().toString(36).substring(2, 15))
      setCurrentStep("download")
    }, 3000)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = "/placeholder.svg?height=600&width=600"
    link.download = "mynumber-photo.jpg"
    link.click()
  }

  const resetProcess = () => {
    setCurrentStep("upload")
    setUploadedFile(null)
    setPreviewUrl(null)
    setProcessedUrl(null)
    setUploadProgress(0)
    setProcessingProgress(0)
    setEmail("")
    setDownloadToken("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-emerald-600">
                特徴
              </a>
              <a href="#comparison" className="text-gray-600 hover:text-emerald-600">
                比較
              </a>
              <a href="#reviews" className="text-gray-600 hover:text-emerald-600">
                口コミ
              </a>
              <a href="#faq" className="text-gray-600 hover:text-emerald-600">
                FAQ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* 标题部分保持居中 */}
            <div className="text-center mb-12">
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full inline-block mb-6">
                AI技術でマイナンバーカード写真を自動調整
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                マイナンバーカード写真
                <br />
                <span className="text-emerald-600">自動調整サービス</span>
              </h2>

              <p className="text-xl text-gray-600 mb-8">
                どんな写真でもAI技術で規格に完全対応
                <br />
                <span className="font-bold text-emerald-600">100%審査通過保証・不通過なら全額返金</span>
              </p>

              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">¥500</div>
                  <div className="text-gray-600">1枚あたり</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">100%</div>
                  <div className="text-gray-600">審査通過率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">30秒</div>
                  <div className="text-gray-600">処理時間</div>
                </div>
              </div>
            </div>

            {/* 左右结构的内容区域 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：占位图 */}
              <div className="order-2 lg:order-1">
                <div className="bg-gray-100 border border-emerald-200 rounded-lg p-8 relative">
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center relative">
                    <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-500 rounded"></div>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">
                      处
                    </div>
                    <div className="absolute bottom-4 right-4 bg-gray-600 text-white p-2 rounded-full">
                      <div className="w-4 h-4 bg-white rounded-full relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：上传功能 */}
              <div className="order-1 lg:order-2">
                {currentStep === "upload" && (
                  <Card className="border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-center">写真をアップロードしてください</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!uploadedFile ? (
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-semibold text-gray-700 mb-2">
                            {isDragActive ? "ここにファイルをドロップしてください" : "ファイルをドラッグ&ドロップ"}
                          </p>
                          <p className="text-gray-500 mb-4">または</p>
                          <Button variant="outline" className="mb-4 bg-transparent">
                            ファイルを選択
                          </Button>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>対応形式: JPG, PNG | 最大: 7MB</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            {previewUrl && (
                              <Image
                                src={previewUrl || "/placeholder.svg"}
                                alt="アップロード写真"
                                width={200}
                                height={200}
                                className="mx-auto rounded object-cover border-2 border-gray-200"
                              />
                            )}
                          </div>
                          {isUploading && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>アップロード中...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {currentStep === "processing" && (
                  <Card className="border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-center">AI処理中...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Flux AI技術でマイナンバーカード規格に調整中</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>処理進行状況</span>
                            <span>{processingProgress}%</span>
                          </div>
                          <Progress value={processingProgress} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === "payment" && (
                  <Card className="border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-center text-emerald-600">
                        <CheckCircle className="w-6 h-6 inline mr-2" />
                        処理完了！
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="text-center">
                          <h3 className="font-semibold mb-4">元の写真</h3>
                          {previewUrl && (
                            <Image
                              src={previewUrl || "/placeholder.svg"}
                              alt="元の写真"
                              width={200}
                              height={200}
                              className="mx-auto rounded object-cover border-2 border-gray-200"
                            />
                          )}
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-4">処理後の写真</h3>
                          <div className="relative">
                            {processedUrl && (
                              <>
                                <Image
                                  src={processedUrl || "/placeholder.svg"}
                                  alt="処理後の写真"
                                  width={200}
                                  height={200}
                                  className="mx-auto rounded object-cover border-2 border-emerald-200"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm font-semibold transform rotate-12">
                                    SAMPLE
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <Button
                          onClick={() => setShowPaymentDialog(true)}
                          size="lg"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          ¥500で高画質版をダウンロード
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep === "download" && (
                  <Card className="border-2 border-emerald-200 bg-emerald-50">
                    <CardHeader>
                      <CardTitle className="text-center text-emerald-600">
                        <CheckCircle className="w-6 h-6 inline mr-2" />
                        ダウンロード準備完了！
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        {processedUrl && (
                          <Image
                            src={processedUrl || "/placeholder.svg"}
                            alt="完成した写真"
                            width={300}
                            height={300}
                            className="mx-auto rounded object-cover border-2 border-emerald-200"
                          />
                        )}
                        <p className="text-sm text-gray-600 mt-4 mb-4">マイナンバーカード申請規格準拠・高画質JPEG</p>
                        <Button onClick={handleDownload} size="lg" className="bg-emerald-600 hover:bg-emerald-700 mr-4">
                          <Download className="w-5 h-5 mr-2" />
                          高画質写真をダウンロード
                        </Button>
                        <Button onClick={resetProcess} variant="outline" size="lg">
                          <RefreshCw className="w-5 h-5 mr-2" />
                          新しい写真を処理
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">マイナンバーカード 写真のチェックポイント</h3>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-4 border-emerald-500">
                    <Image
                      src="/sample.png"
                      alt="写真要件サンプル"
                      width={180}
                      height={180}
                      className="rounded"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                      <span>最近6ヶ月以内に撮影</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                      <span>正面、無帽、無背景のもの</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                      <span>白黒の写真でも可</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">オンライン申請の場合</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• ファイル形式：JPEG</li>
                      <li>• カラーモード：RGBカラー</li>
                      <li>• ファイルサイズ：20KB〜7MB</li>
                      <li>• ピクセルサイズ：幅480〜6000ピクセル、高さ480〜6000ピクセル</li>
                    </ul>
                  </div>
                  <div className="mt-6 text-center">
                    <a 
                      href="https://www.kojinbango-card.go.jp/apprec/apply/facephoto/" 
                      target="_blank" 
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      政府機関の公式要件を確認
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Application Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">マイナンバーカード オンライン申請方法</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">メールアドレス登録</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📧</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">オンライン申請サイトにアクセス</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 申請書ID（23桁）</p>
                    <p>• メール連絡用氏名</p>
                    <p>• メールアドレス</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800">
                    ※第3土曜日0:00～8:00で定期メンテナンス
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">顔写真登録</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📷</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">申請者専用WEBサイトで写真登録</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 顔写真登録</p>
                    <p>• 顔写真登録確認</p>
                    <p>• スマホ撮影も可能</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800">
                    ※2024年12月2日より1歳未満は不要
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">申請情報登録</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📝</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">その他申請に必要な情報を入力</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 生年月日（必須）</p>
                    <p>• 電子証明書発行希望</p>
                    <p>• 氏名の点字表記希望</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800">
                    すべての項目を正確に入力
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">申請完了</h4>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">必要事項を入力して送信</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 申請完了メール受信</p>
                    <p>• 申請状況確認可能</p>
                    <p>• 交付準備完了</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800">
                    メールで申請完了通知
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Make MyNumber Card Photo */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">マイナンバーカード写真の作り方</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1: Upload */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">1. 写真をアップロード</h4>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">任意の写真をドラッグ&ドロップ</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• スマホ写真でもOK</p>
                    <p>• 古い写真でもOK</p>
                    <p>• 背景ありでもOK</p>
                  </div>
                </div>
              </div>

              {/* Step 2: AI Adjustment */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">2. AI自動調整</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Flux AI技術で自動調整</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 背景を白に変更</p>
                    <p>• サイズを規格に調整</p>
                    <p>• 明度・コントラスト最適化</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Check */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">3. 規格チェック</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">チェックポイント自動確認</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• サイズ規格チェック</p>
                    <p>• 背景色チェック</p>
                    <p>• 画質・明度チェック</p>
                  </div>
                </div>
              </div>

              {/* Step 4: Download */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-lg mb-3">4. 高画質版ダウンロード</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">💾</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">規格準拠の高画質写真</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 高画質JPEG形式</p>
                    <p>• マイナンバーカード規格準拠</p>
                    <p>• オンライン申請対応</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Guarantee Feature */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：内容 */}
              <div className="order-1 lg:order-1">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    <Shield className="w-4 h-4 mr-2" />
                    安全・保証
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-900">
                    100%審査通過
                    <br />
                    <span className="text-blue-600">保証付き</span>
                  </h3>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    審査に通らなかった場合は全額返金。
                    <br />
                    SSL暗号化で個人情報を完全保護。
                  </p>
                  
                  <div className="space-y-4 pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">100%審査通過保証</h4>
                        <p className="text-gray-600">万が一審査に通らなかった場合は、全額返金いたします</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">SSL暗号化通信</h4>
                        <p className="text-gray-600">個人情報を完全保護、第三者への提供は一切ありません</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">24時間自動削除</h4>
                        <p className="text-gray-600">処理完了後24時間で写真データを自動削除</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右侧：图片 */}
              <div className="order-2 lg:order-2">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl p-8 border border-blue-200">
                    <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-emerald-50"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-semibold">SSL暗号化</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-semibold">100%保証</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-semibold">自動削除</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        安全
                      </div>
                      <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        保証
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Technology Feature */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：图片 */}
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8 border border-emerald-200">
                    <div className="w-full h-80 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-12 h-12 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="w-32 h-8 bg-emerald-200 rounded animate-pulse"></div>
                          <div className="w-24 h-6 bg-blue-200 rounded animate-pulse"></div>
                          <div className="w-28 h-6 bg-emerald-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        AI処理中
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* 右侧：内容 */}
              <div className="order-1 lg:order-2">
                <div className="space-y-6">
                  <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
                    <Zap className="w-4 h-4 mr-2" />
                    最新AI技術
                  </div>
                  
                  <h3 className="text-4xl font-bold text-gray-900">
                    Flux AI技術で
                    <br />
                    <span className="text-emerald-600">完璧な証件照</span>
                  </h3>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    どんな写真でもAI技術で規格に完全対応。
                    <br />
                    背景除去、サイズ調整、明度最適化を自動で実行。
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="font-semibold">背景自動除去</span>
                      </div>
                      <p className="text-sm text-gray-600">複雑な背景も白背景に自動変換</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="font-semibold">サイズ自動調整</span>
                      </div>
                      <p className="text-sm text-gray-600">規格サイズに完全対応</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="font-semibold">明度最適化</span>
                      </div>
                      <p className="text-sm text-gray-600">最適な明度・コントラストに調整</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2" />
                        <span className="font-semibold">画質向上</span>
                      </div>
                      <p className="text-sm text-gray-600">高画質JPEG形式で出力</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section id="comparison" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">処理前後の比較</h3>
          <div className="space-y-12 max-w-4xl mx-auto">
            {[1, 2, 3].map((index) => (
              <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                  <h4 className="font-semibold mb-4 text-red-600">処理前</h4>
                  <div className="relative">
                    <Image
                      src={`/placeholder.svg?height=300&width=300&text=Before${index}`}
                      alt={`処理前${index}`}
                      width={300}
                      height={300}
                      className="mx-auto rounded-lg border-2 border-red-200"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">規格外</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">背景・サイズ・明度が不適切</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold mb-4 text-emerald-600">処理後</h4>
                  <div className="relative">
                    <Image
                      src={`/placeholder.svg?height=300&width=300&text=After${index}`}
                      alt={`処理後${index}`}
                      width={300}
                      height={300}
                      className="mx-auto rounded-lg border-2 border-emerald-200"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs">
                      規格準拠
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">完璧な白背景・規格サイズ・最適明度</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">なぜ選ばれるのか？</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-2">Flux AI技術</h4>
              <p className="text-sm text-gray-600">最新のAI技術でどんな写真も完璧な証件照に変換</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-2">規格完全準拠</h4>
              <p className="text-sm text-gray-600">マイナンバーカード申請規格に完全対応、不通過なら全額返金</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-2">30秒で完成</h4>
              <p className="text-sm text-gray-600">アップロードから完成まで最短30秒の高速処理</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold mb-2">安全・安心</h4>
              <p className="text-sm text-gray-600">SSL暗号化通信で個人情報を完全保護</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Reviews */}
      <section id="reviews" className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">利用者の声</h3>
          
          {/* 第一行 - 向左移动 */}
          <div className="mb-8">
            <div className="flex space-x-6 animate-scroll-left hover:pause" style={{ width: 'fit-content' }}>
              {[
                {
                  name: "田中さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧な証件照になりました！審査も一発通過で大満足です。",
                },
                {
                  name: "佐藤さん",
                  rating: 5,
                  comment: "写真館に行く時間がなかったので助かりました。30秒で完成するのは本当に便利です。",
                },
                {
                  name: "山田さん",
                  rating: 5,
                  comment: "背景がごちゃごちゃした写真でもきれいな白背景に。AI技術の凄さを実感しました。",
                },
                {
                  name: "鈴木さん",
                  rating: 5,
                  comment: "自宅で撮った写真がこんなに綺麗になるなんて信じられません。本当に感謝しています！",
                },
                {
                  name: "高橋さん",
                  rating: 5,
                  comment: "子供の写真も完璧に処理されて、家族みんなでマイナンバーカード申請できました。",
                },
                {
                  name: "渡辺さん",
                  rating: 5,
                  comment: "古い写真でも最新のAI技術で蘇らせてくれました。本当に素晴らしいサービスです。",
                },
                {
                  name: "伊藤さん",
                  rating: 5,
                  comment: "仕事が忙しくて写真館に行けなかったので、このサービスは本当に救世主でした。",
                },
                {
                  name: "中村さん",
                  rating: 5,
                  comment: "明度調整も完璧で、どんな環境で撮った写真でも規格に合うようにしてくれます。",
                },
                {
                  name: "小林さん",
                  rating: 5,
                  comment: "100%審査通過保証があるので安心して利用できました。結果も期待通りでした！",
                },
                {
                  name: "加藤さん",
                  rating: 5,
                  comment: "スマホの自撮り写真がこんなに綺麗な証件照になるなんて、技術の進歩を実感しました。",
                },
                {
                  name: "斎藤さん",
                  rating: 5,
                  comment: "夜間でも自宅で完璧な証件照が作れるなんて、本当に便利な時代になりました。",
                },
                {
                  name: "松本さん",
                  rating: 5,
                  comment: "背景除去の精度が素晴らしいです。複雑な背景でも完璧に白背景に変換されます。",
                },
                {
                  name: "井上さん",
                  rating: 5,
                  comment: "30秒で完成するのは本当に驚きです。写真館に行く手間が省けて大助かりです。",
                },
                {
                  name: "野田さん",
                  rating: 5,
                  comment: "子供の写真も大人の写真も、どちらも完璧に処理してくれました。家族全員で利用しています。",
                },
                {
                  name: "福田さん",
                  rating: 5,
                  comment: "古い写真でも最新の規格に合わせて調整してくれるので、思い出の写真も活用できます。",
                },
                {
                  name: "石川さん",
                  rating: 5,
                  comment: "明度調整が完璧で、どんな照明条件でも最適な明度に調整してくれます。",
                },
                {
                  name: "遠藤さん",
                  rating: 5,
                  comment: "スマホで撮った写真がこんなに綺麗になるなんて、本当に信じられませんでした。",
                },
                {
                  name: "青木さん",
                  rating: 5,
                  comment: "審査に一発で通ったので、このサービスの精度の高さを実感しました。",
                },
                {
                  name: "岡田さん",
                  rating: 5,
                  comment: "自宅で完璧な証件照が作れるなんて、本当に画期的なサービスです。",
                },
                {
                  name: "長谷川さん",
                  rating: 5,
                  comment: "AI技術の進歩を実感できるサービスです。これからも利用し続けます。",
                },
                // 重复前面的评论以确保无缝循环
                {
                  name: "田中さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧な証件照になりました！審査も一発通過で大満足です。",
                },
                {
                  name: "佐藤さん",
                  rating: 5,
                  comment: "写真館に行く時間がなかったので助かりました。30秒で完成するのは本当に便利です。",
                },
                {
                  name: "山田さん",
                  rating: 5,
                  comment: "背景がごちゃごちゃした写真でもきれいな白背景に。AI技術の凄さを実感しました。",
                },
                {
                  name: "鈴木さん",
                  rating: 5,
                  comment: "自宅で撮った写真がこんなに綺麗になるなんて信じられません。本当に感謝しています！",
                },
                {
                  name: "高橋さん",
                  rating: 5,
                  comment: "子供の写真も完璧に処理されて、家族みんなでマイナンバーカード申請できました。",
                },
                {
                  name: "渡辺さん",
                  rating: 5,
                  comment: "古い写真でも最新のAI技術で蘇らせてくれました。本当に素晴らしいサービスです。",
                },
                {
                  name: "伊藤さん",
                  rating: 5,
                  comment: "仕事が忙しくて写真館に行けなかったので、このサービスは本当に救世主でした。",
                },
                {
                  name: "中村さん",
                  rating: 5,
                  comment: "明度調整も完璧で、どんな環境で撮った写真でも規格に合うようにしてくれます。",
                },
                {
                  name: "小林さん",
                  rating: 5,
                  comment: "100%審査通過保証があるので安心して利用できました。結果も期待通りでした！",
                },
                {
                  name: "加藤さん",
                  rating: 5,
                  comment: "スマホの自撮り写真がこんなに綺麗な証件照になるなんて、技術の進歩を実感しました。",
                },
                {
                  name: "斎藤さん",
                  rating: 5,
                  comment: "夜間でも自宅で完璧な証件照が作れるなんて、本当に便利な時代になりました。",
                },
                {
                  name: "松本さん",
                  rating: 5,
                  comment: "背景除去の精度が素晴らしいです。複雑な背景でも完璧に白背景に変換されます。",
                },
                {
                  name: "井上さん",
                  rating: 5,
                  comment: "30秒で完成するのは本当に驚きです。写真館に行く手間が省けて大助かりです。",
                },
                {
                  name: "野田さん",
                  rating: 5,
                  comment: "子供の写真も大人の写真も、どちらも完璧に処理してくれました。家族全員で利用しています。",
                },
                {
                  name: "福田さん",
                  rating: 5,
                  comment: "古い写真でも最新の規格に合わせて調整してくれるので、思い出の写真も活用できます。",
                },
                {
                  name: "石川さん",
                  rating: 5,
                  comment: "明度調整が完璧で、どんな照明条件でも最適な明度に調整してくれます。",
                },
                {
                  name: "遠藤さん",
                  rating: 5,
                  comment: "スマホで撮った写真がこんなに綺麗になるなんて、本当に信じられませんでした。",
                },
                {
                  name: "青木さん",
                  rating: 5,
                  comment: "審査に一発で通ったので、このサービスの精度の高さを実感しました。",
                },
                {
                  name: "岡田さん",
                  rating: 5,
                  comment: "自宅で完璧な証件照が作れるなんて、本当に画期的なサービスです。",
                },
                {
                  name: "長谷川さん",
                  rating: 5,
                  comment: "AI技術の進歩を実感できるサービスです。これからも利用し続けます。",
                },
              ].map((review, index) => (
                <Card key={index} className="border-emerald-200 min-w-[300px] flex-shrink-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{review.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 第二行 - 向右移动 */}
          <div className="mb-8">
            <div className="flex space-x-6 animate-scroll-right hover:pause" style={{ width: 'fit-content' }}>
              {[
                {
                  name: "西村さん",
                  rating: 5,
                  comment: "写真館に行く時間とお金を節約できて、しかも完璧な品質。本当に感謝しています。",
                },
                {
                  name: "前田さん",
                  rating: 5,
                  comment: "子供の写真も大人の写真も、どちらも完璧に処理してくれました。家族全員で利用しています。",
                },
                {
                  name: "中島さん",
                  rating: 5,
                  comment: "古い写真でも最新の規格に合わせて調整してくれるので、思い出の写真も活用できます。",
                },
                {
                  name: "藤田さん",
                  rating: 5,
                  comment: "明度調整が完璧で、どんな照明条件でも最適な明度に調整してくれます。",
                },
                {
                  name: "後藤さん",
                  rating: 5,
                  comment: "スマホで撮った写真がこんなに綺麗になるなんて、本当に信じられませんでした。",
                },
                {
                  name: "近藤さん",
                  rating: 5,
                  comment: "審査に一発で通ったので、このサービスの精度の高さを実感しました。",
                },
                {
                  name: "村上さん",
                  rating: 5,
                  comment: "自宅で完璧な証件照が作れるなんて、本当に画期的なサービスです。",
                },
                {
                  name: "太田さん",
                  rating: 5,
                  comment: "AI技術の進歩を実感できるサービスです。これからも利用し続けます。",
                },
                {
                  name: "石井さん",
                  rating: 5,
                  comment: "背景除去の精度が素晴らしいです。複雑な背景でも完璧に白背景に変換されます。",
                },
                {
                  name: "小川さん",
                  rating: 5,
                  comment: "30秒で完成するのは本当に驚きです。写真館に行く手間が省けて大助かりです。",
                },
                {
                  name: "坂本さん",
                  rating: 5,
                  comment: "夜間でも自宅で完璧な証件照が作れるなんて、本当に便利な時代になりました。",
                },
                {
                  name: "森さん",
                  rating: 5,
                  comment: "100%審査通過保証があるので安心して利用できました。結果も期待通りでした！",
                },
                {
                  name: "山口さん",
                  rating: 5,
                  comment: "スマホの自撮り写真がこんなに綺麗な証件照になるなんて、技術の進歩を実感しました。",
                },
                {
                  name: "阿部さん",
                  rating: 5,
                  comment: "写真館に行く時間がなかったので助かりました。30秒で完成するのは本当に便利です。",
                },
                {
                  name: "吉田さん",
                  rating: 5,
                  comment: "自宅で撮った写真がこんなに綺麗になるなんて信じられません。本当に感謝しています！",
                },
                {
                  name: "佐々木さん",
                  rating: 5,
                  comment: "子供の写真も完璧に処理されて、家族みんなでマイナンバーカード申請できました。",
                },
                {
                  name: "松井さん",
                  rating: 5,
                  comment: "古い写真でも最新のAI技術で蘇らせてくれました。本当に素晴らしいサービスです。",
                },
                {
                  name: "橋本さん",
                  rating: 5,
                  comment: "仕事が忙しくて写真館に行けなかったので、このサービスは本当に救世主でした。",
                },
                {
                  name: "清水さん",
                  rating: 5,
                  comment: "明度調整も完璧で、どんな環境で撮った写真でも規格に合うようにしてくれます。",
                },
                {
                  name: "高木さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧な証件照になりました！審査も一発通過で大満足です。",
                },
                // 重复前面的评论以确保无缝循环
                {
                  name: "西村さん",
                  rating: 5,
                  comment: "写真館に行く時間とお金を節約できて、しかも完璧な品質。本当に感謝しています。",
                },
                {
                  name: "前田さん",
                  rating: 5,
                  comment: "子供の写真も大人の写真も、どちらも完璧に処理してくれました。家族全員で利用しています。",
                },
                {
                  name: "中島さん",
                  rating: 5,
                  comment: "古い写真でも最新の規格に合わせて調整してくれるので、思い出の写真も活用できます。",
                },
                {
                  name: "藤田さん",
                  rating: 5,
                  comment: "明度調整が完璧で、どんな照明条件でも最適な明度に調整してくれます。",
                },
                {
                  name: "後藤さん",
                  rating: 5,
                  comment: "スマホで撮った写真がこんなに綺麗になるなんて、本当に信じられませんでした。",
                },
                {
                  name: "近藤さん",
                  rating: 5,
                  comment: "審査に一発で通ったので、このサービスの精度の高さを実感しました。",
                },
                {
                  name: "村上さん",
                  rating: 5,
                  comment: "自宅で完璧な証件照が作れるなんて、本当に画期的なサービスです。",
                },
                {
                  name: "太田さん",
                  rating: 5,
                  comment: "AI技術の進歩を実感できるサービスです。これからも利用し続けます。",
                },
                {
                  name: "石井さん",
                  rating: 5,
                  comment: "背景除去の精度が素晴らしいです。複雑な背景でも完璧に白背景に変換されます。",
                },
                {
                  name: "小川さん",
                  rating: 5,
                  comment: "30秒で完成するのは本当に驚きです。写真館に行く手間が省けて大助かりです。",
                },
                {
                  name: "坂本さん",
                  rating: 5,
                  comment: "夜間でも自宅で完璧な証件照が作れるなんて、本当に便利な時代になりました。",
                },
                {
                  name: "森さん",
                  rating: 5,
                  comment: "100%審査通過保証があるので安心して利用できました。結果も期待通りでした！",
                },
                {
                  name: "山口さん",
                  rating: 5,
                  comment: "スマホの自撮り写真がこんなに綺麗な証件照になるなんて、技術の進歩を実感しました。",
                },
                {
                  name: "阿部さん",
                  rating: 5,
                  comment: "写真館に行く時間がなかったので助かりました。30秒で完成するのは本当に便利です。",
                },
                {
                  name: "吉田さん",
                  rating: 5,
                  comment: "自宅で撮った写真がこんなに綺麗になるなんて信じられません。本当に感謝しています！",
                },
                {
                  name: "佐々木さん",
                  rating: 5,
                  comment: "子供の写真も完璧に処理されて、家族みんなでマイナンバーカード申請できました。",
                },
                {
                  name: "松井さん",
                  rating: 5,
                  comment: "古い写真でも最新のAI技術で蘇らせてくれました。本当に素晴らしいサービスです。",
                },
                {
                  name: "橋本さん",
                  rating: 5,
                  comment: "仕事が忙しくて写真館に行けなかったので、このサービスは本当に救世主でした。",
                },
                {
                  name: "清水さん",
                  rating: 5,
                  comment: "明度調整も完璧で、どんな環境で撮った写真でも規格に合うようにしてくれます。",
                },
                {
                  name: "高木さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧な証件照になりました！審査も一発通過で大満足です。",
                },
              ].map((review, index) => (
                <Card key={index} className="border-emerald-200 min-w-[300px] flex-shrink-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{review.name}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-4 bg-emerald-50 px-6 py-3 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600" />
              <span className="text-emerald-800 font-semibold">累計利用者数: 50,000人突破！</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">よくある質問</h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "どんな写真でも処理できますか？",
                a: "はい。スマホで撮った写真、古い写真、背景がある写真など、どんな写真でもAI技術で規格に合わせて調整できます。",
              },
              {
                q: "審査に通らなかった場合はどうなりますか？",
                a: "100%審査通過を保証しています。万が一審査に通らなかった場合は、全額返金いたします。",
              },
              {
                q: "処理にはどのくらい時間がかかりますか？",
                a: "通常30秒程度で処理が完了します。混雑時でも最大2分以内には完成します。",
              },
              {
                q: "写真のデータは安全ですか？",
                a: "SSL暗号化通信で保護され、処理完了後24時間で自動削除されます。第三者に提供することは一切ありません。",
              },
              {
                q: "支払い方法は何がありますか？",
                a: "クレジットカード決済に対応しています。安全な決済システムを使用しているため安心してご利用いただけます。",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-emerald-800 mb-2 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    {faq.q}
                  </h4>
                  <p className="text-gray-600 ml-7">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 マイナンバーカード写真サービス. All rights reserved.</p>
        </div>
      </footer>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              お支払い
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>マイナンバーカード写真処理</span>
                <span className="font-bold text-emerald-600">¥500</span>
              </div>
            </div>

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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">100%審査通過保証</h4>
                  <p className="text-sm text-blue-700">審査に通らなかった場合は全額返金いたします</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!email || isPaymentProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  決済処理中...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  ¥500 を支払う
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
