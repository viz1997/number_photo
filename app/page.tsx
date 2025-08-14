"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Upload,
  Download,
  CheckCircle,
  Shield,
  Star,
  RefreshCw,
  Users,
  Clock,
  Zap,
  ExternalLink,
  Loader2,
  CreditCard,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"upload" | "processing" | "payment" | "download">("upload")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // 开始真实上传
      await handleRealUpload(file, url)
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

  const handleRealUpload = async (file: File, previewUrl: string) => {
    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // 准备上传数据
      const formData = new FormData()
      formData.append('file', file)

      // 上传文件
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Upload failed')
      }

      const data = await response.json()
      
      if (data.success) {
        // 保存文件信息到 sessionStorage
        const fileInfo = {
          name: file.name,
          type: file.type,
          size: file.size
        }
        sessionStorage.setItem("uploadedFileInfo", JSON.stringify(fileInfo))
        if (data.photoRecordId) {
          sessionStorage.setItem("photoRecordId", data.photoRecordId)
        }
        // 额外保存上传返回信息，便于 /process 使用R2稳定URL回退
        try {
          const uploadInfo = { fileId: data.fileId, fileName: data.fileName, imageUrl: data.imageUrl, objectKey: data.imageUrl ? new URL(data.imageUrl).pathname.replace(/^\/+/, '') : undefined }
          sessionStorage.setItem("uploadInfo", JSON.stringify(uploadInfo))
        } catch {}
        
        // 上传完成后，重定向到 process 页面
        setTimeout(() => {
          router.push('/process')
        }, 1000) // 给用户1秒时间看到上传完成
      } else {
        throw new Error('Upload succeeded but backend returned success=false')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // 处理下载功能
  const handleDownload = () => {
    if (processedUrl) {
      const link = document.createElement('a')
      link.href = processedUrl
      link.download = 'my-number-card-photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }



  const removeFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setUploadedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setError(null)
  }

  const resetProcess = () => {
    removeFile()
    setProcessedUrl(null)
    setCurrentStep("upload")
    setProcessingProgress(0)
    setShowPaymentDialog(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
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
              10年間使える完璧な一枚を
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
              10年間使える
                <br />
                <span className="text-emerald-600">完璧なマイナンバーカード写真</span><span className="text-gray-900">を作りませんか？</span>
              </h2>

              <p className="text-xl text-gray-600 mb-8">
              どんな写真も、AI技術で美しく規格に完全対応
                <br />
                <span className="font-bold text-emerald-600">100%審査通過保証・万が一の場合は全額返金</span>
              </p>

              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">30秒</div>
                  <div className="text-gray-600">で完成</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">確実</div>
                  <div className="text-gray-600">な品質</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">安心</div>
                  <div className="text-gray-600">の保証</div>
                </div>
              </div>
            </div>

            {/* 左右结构的内容区域 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 左侧：处理前图片 */}
              <div className="order-2 lg:order-1">
                <Image
                  src="/my-number-card-photo-before1.webp"
                  alt="処理前の写真"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* 右侧：上传功能 */}
              <div className="order-1 lg:order-2">
                {currentStep === "upload" && (
                  <Card className="border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-center">写真を選択してください</CardTitle>
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
                                width={150}
                                height={150}
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
                        <p className="text-gray-600 mb-4">最新AI技術でマイナンバーカード規格に調整中</p>
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
                        <p className="text-sm text-gray-600 mt-4 mb-4">マイナンバーカード申請規格準拠・高画質JPEG写真</p>
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
            <h2 className="text-3xl font-bold text-center mb-8">マイナンバーカード 写真のチェックポイント</h2>
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
                    <h3 className="font-semibold text-gray-800 mb-2">オンライン申請の場合</h3>
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
            <h2 className="text-3xl font-bold text-center mb-12">マイナンバーカード オンライン申請方法</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">メールアドレス登録</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📧</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">オンライン申請サイトにアクセス</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 申請書ID（23桁）</p>
                    <p>• メール連絡用氏名</p>
                    <p>• メールアドレス</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800 text-center">
                    ※第3土曜日0:00～8:00で定期メンテナンス
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">顔写真登録</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📷</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">申請者専用WEBサイトで写真登録</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 顔写真登録</p>
                    <p>• 顔写真登録確認</p>
                    <p>• スマホ撮影も可能</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800 text-center">
                    ※2024年12月2日より1歳未満は不要
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">申請情報登録</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📝</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">その他申請に必要な情報を入力</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 生年月日（必須）</p>
                    <p>• 電子証明書発行希望</p>
                    <p>• 氏名の点字表記希望</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800 text-center">
                    すべての項目を正確に入力
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">申請完了</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">必要事項を入力して送信</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 申請完了メール受信</p>
                    <p>• 申請状況確認可能</p>
                    <p>• 交付準備完了</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <p className="text-xs text-gray-800 text-center">
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
            <h2 className="text-3xl font-bold text-center mb-12">マイナンバーカード写真の作り方</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1: Upload */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">1. 写真をアップロード</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">📱</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">任意の写真をドラッグ&ドロップ</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• スマホ写真でもOK</p>
                    <p>• 古い写真でもOK</p>
                    <p>• 背景ありでもOK</p>
                  </div>
                </div>
              </div>

              {/* Step 2: AI Adjustment */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">2. AI自動調整</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">最新AI技術で自動調整</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 背景を白に変更</p>
                    <p>• サイズをマイナンバーカード規格に調整</p>
                    <p>• 超自然美顔効果</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Check */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">3. 規格チェック</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">チェックポイント自動確認</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• マイナンバーカードサイズ規格チェック</p>
                    <p>• 背景色チェック</p>
                    <p>• 画質・明度チェック</p>
                  </div>
                </div>
              </div>

              {/* Step 4: Download */}
              <div className="text-left">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center">4. 高画質版ダウンロード</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-3xl">💾</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">規格準拠の高画質写真</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• 高画質JPEG形式</p>
                    <p>• マイナンバーカード規格準拠</p>
                    <p>• マイナンバーカードオンライン申請対応</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* 第一行：安全・保証 */}
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* 左侧文字内容 */}
              <div className="space-y-6">
                <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  安全・保証
                </div>
                <h2 className="text-3xl font-bold text-blue-600">
                  100%審査通過<br />
                  <span className="text-blue-700">保証付き</span>
                </h2>
                <p className="text-gray-600 text-lg">
                  審査に通らなかった場合は全額返金。<br />
                  SSL暗号化で個人情報を完全保護。
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">100%審査通過保証</h3>
                      <p className="text-sm text-gray-600">万が一審査に通らなかった場合は、全額返金いたします</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">SSL暗号化通信</h3>
                      <p className="text-sm text-gray-600">個人情報を完全保護、第三者への提供は一切ありません</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">24時間自動削除</h3>
                      <p className="text-sm text-gray-600">処理完了後24時間で写真データを自動削除</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 右侧卡片 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 h-80 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0">
                    <Image
                      src="/my-number-card-photo-feature1.webp"
                      alt="安全保証"
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 第二行：最新AI技術 */}
            <div className="grid md:grid-cols-2 gap-12">
              {/* 左侧卡片 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 h-80 relative overflow-hidden border border-gray-200">
                  <div className="absolute inset-0">
                    <Image
                      src="/my-number-card-photo-feature2.webp"
                      alt="AI処理"
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* 右侧文字内容 */}
              <div className="space-y-6">
                <div className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>最新AI技術</span>
                </div>
                <h2 className="text-3xl font-bold">
                  最新AI技術で<br />
                  <span className="text-green-600">完璧なマイナンバーカード写真</span>
                </h2>
                <p className="text-gray-600 text-lg">
                  どんな写真でも最新AI技術でマイナンバーカード規格に完全対応。<br />
                  背景除去、サイズ調整、明度最適化、超自然美顔を自動で実行。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">背景自動除去</h3>
                        <p className="text-xs text-gray-600">複雑な背景も白背景に自動変換</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">超自然美顔</h3>
                        <p className="text-xs text-gray-600">肌質改善・明度補正で自然な美しさ</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">サイズ自動調整</h3>
                        <p className="text-xs text-gray-600">マイナンバーカード規格サイズに完全対応</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">画質向上</h3>
                        <p className="text-xs text-gray-600">マイナンバーカード申請用高画質JPEG形式で出力</p>
                      </div>
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
          <h2 className="text-3xl font-bold text-center mb-12">マイナンバーカード写真の処理例</h2>
          <div className="space-y-12 max-w-4xl mx-auto">
            {[
              {
                before: "複雑な背景・服装・表情が不適切",
                after: "完璧な白背景・規格サイズ・自然な表情で審査通過"
              },
              {
                before: "姿勢は正しくない・服装・明度が不適切", 
                after: "完璧な白背景・規格サイズ・最適明度で審査通過"
              },
              {
                before: "寝具背景・服装・写真サイズが不適切",
                after: "完璧な白背景・規格サイズ・自然な表情で審査通過"
              },
              {
                before: "椅子背景・服装・明度が不適切",
                after: "完璧な白背景・規格サイズ・最適明度で審査通過"
              }
            ].map((description, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-8 items-start">
                <div className="text-center">
                  <h3 className="font-semibold mb-4 text-red-600">処理前</h3>
                  <div className="relative inline-block">
                    <Image
                      src={`/my-number-card-photo-before${index + 1}.webp`}
                      alt={`処理前${index + 1}`}
                      width={300}
                      height={300}
                      className="rounded-lg border-2 border-red-200 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">NG</div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 font-medium">{description.before}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-4 text-emerald-600">処理後</h3>
                  <div className="relative inline-block">
                    <Image
                      src={`/my-number-card-photo-after${index + 1}.webp`}
                      alt={`処理後${index + 1}`}
                      width={300}
                      height={300}
                      className="rounded-lg border-2 border-emerald-200 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs">
                      OK
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 font-medium">{description.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* User Reviews */}
      <section id="reviews" className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">利用者の声</h2>
          
          {/* 第一行 - 向左移动 */}
          <div className="mb-0 h-48 overflow-hidden">
            <div className="flex space-x-6 animate-scroll-left hover:pause">
              {[
                {
                  name: "田中さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧なマイナンバーカード写真になりました！審査も一発通過で大満足です。",
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
              {/* 重复评论以实现无缝循环 */}
              {[
                {
                  name: "田中さん",
                  rating: 5,
                  comment: "スマホで撮った写真が完璧なマイナンバーカード写真になりました！審査も一発通過で大満足です。",
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
                <Card key={`duplicate-${index}`} className="border-emerald-200 min-w-[300px] flex-shrink-0">
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
          <div className="mb-8 h-48 overflow-hidden">
            <div className="flex space-x-6 animate-scroll-right hover:pause">
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
              {/* 重复评论以实现无缝循环 */}
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
              ].map((review, index) => (
                <Card key={`duplicate-right-${index}`} className="border-emerald-200 min-w-[300px] flex-shrink-0">
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
            <div className="inline-flex flex-col items-center space-y-2 bg-emerald-50 px-6 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">累計利用者数</span>
              </div>
              <span className="text-emerald-800 font-semibold text-lg">20,000人突破！</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">よくある質問</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  q: "マイナンバーカードの写真はなんでもいいの?",
                  a: "いいえ、マイナンバーカードの写真には厳格な規格があります。正面を向いた顔写真で、背景は白または薄い色、表情は自然で、帽子やサングラスは不可です。当サービスでは、どんな写真でもAI技術で規格に合わせて調整いたします。",
                },
                {
                  q: "マイナンバーカードの写真は自分で取ってもいいですか?",
                  a: "はい、自分で撮影した写真でも問題ありません。ただし、規格に合った写真である必要があります。当サービスをご利用いただければ、自撮り写真でも完璧な証件照に変換できます。",
                },
                {
                  q: "マイナンバーカードの証明写真はスマホで撮影してもいいですか?",
                  a: "はい、スマホで撮影した写真でも大丈夫です。ただし、画質が良く、顔がはっきりと写っていることが重要です。当サービスでは、スマホ写真でもAI技術で最適化して規格に合わせます。",
                },
                {
                  q: "マイナンバーの写真の化粧はどこまでしていいですか?",
                  a: "自然な化粧であれば問題ありません。ただし、過度な化粧や特殊メイクは避けてください。普段通りの自然な化粧で撮影することをお勧めします。",
                },
                {
                  q: "マイナンバーカードの写真のNG例は?",
                  a: "以下のような写真はNGです：帽子やサングラスを着用した写真、背景が複雑な写真、表情が不自然な写真、古い写真、他の人と一緒に写った写真、モノクロ写真など。",
                },
                {
                  q: "マイナンバーカードの写真の眉毛は覆ってもいいですか?",
                  a: "眉毛を覆う髪の毛がある場合は、顔の特徴がはっきりと分かるように整えてください。ただし、完全に眉毛を隠してしまうのは避けた方が良いでしょう。",
                },
                {
                  q: "マイナンバーカードの写真の服装は?",
                  a: "特に指定はありませんが、普段着で構いません。ただし、制服やユニフォームは避けることをお勧めします。シンプルで清潔感のある服装が最適です。",
                },
                {
                  q: "マイナンバーカードの写真は何年使えますか?",
                  a: "マイナンバーカードの有効期限は10年です。ただし、顔の変化が大きい場合は、より新しい写真の使用をお勧めします。",
                },
                {
                  q: "マイナンバーカードの顔写真はどうするの?",
                  a: "正面を向いた顔写真が必要です。横顔や斜めの写真は不可です。顔がはっきりと写り、表情が自然な写真を撮影してください。",
                },
                {
                  q: "マイナンバーカードの写真は歯を見せる?",
                  a: "自然な表情で撮影してください。無理に笑顔を作る必要はありませんが、口を閉じた自然な表情が最適です。",
                },
                {
                  q: "マイナンバーカードの前髪はどうする?",
                  a: "目や眉毛がはっきりと見えるように、前髪は整えてください。顔の特徴を隠さないように注意が必要です。",
                },
                {
                  q: "マイナンバーカードを作らないとどうなる?",
                  a: "マイナンバーカードの取得は義務ではありませんが、各種手続きで便利な身分証明書として活用できます。取得しない場合でも、マイナンバー通知カードで手続きは可能です。",
                },
                {
                  q: "マイナンバーの写真は笑って撮れない?",
                  a: "自然な表情で撮影してください。無理に笑顔を作る必要はありませんが、口を閉じた自然な表情が最適です。",
                },
                {
                  q: "マイナンバーカードの自撮りのコツは?",
                  a: "スマホを顔の高さに合わせ、自然光の下で撮影してください。背景は白い壁やシートを使用し、顔がはっきりと写るようにしましょう。",
                },
                {
                  q: "マイナンバーカードの写真の髪型は女性はどうしたらいいですか?",
                  a: "顔の特徴がはっきりと分かる髪型にしてください。前髪で目を隠さないよう注意し、自然で清潔感のある髪型が最適です。",
                },
                {
                  q: "マイナンバーカードの更新でメガネをかけても大丈夫?",
                  a: "はい、普段メガネをかけている方は、メガネをかけた状態で撮影してください。ただし、レンズに反射がないよう注意が必要です。",
                },
                {
                  q: "マイナンバーの写真のルールは?",
                  a: "正面を向いた顔写真、白または薄い色の背景、自然な表情、帽子やサングラスなし、顔がはっきりと写っていること、6ヶ月以内に撮影した写真であることなどが基本ルールです。",
                },
                {
                  q: "マイナンバーカードの写真はスマホで撮影したものでもいいですか?",
                  a: "はい、スマホで撮影した写真でも問題ありません。ただし、画質が良く、顔がはっきりと写っていることが重要です。当サービスでは、スマホ写真でもAI技術で最適化して規格に合わせます。",
                },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-emerald-600">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* 公司信息 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/favicon-32x32.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded"
                />
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
                  <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
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
                  <Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@mynumberphoto.com" className="text-gray-400 hover:text-emerald-400 transition-colors">
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
                <span>&copy; 2025 マイナンバーカード写真サービス. All rights reserved.ご不明な点がございましたら:support@mynumberphoto.com</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}