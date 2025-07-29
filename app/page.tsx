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
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">利用者の声</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            ].map((review, index) => (
              <Card key={index} className="border-emerald-200">
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
