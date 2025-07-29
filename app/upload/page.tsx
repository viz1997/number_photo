"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ArrowRight, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

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
    maxSize: 7 * 1024 * 1024, // 7MB
  })

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
  }

  const handleNext = () => {
    if (uploadedFile) {
      // Store file data in sessionStorage for demo purposes
      sessionStorage.setItem(
        "uploadedFile",
        JSON.stringify({
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
        }),
      )
      if (previewUrl) {
        sessionStorage.setItem("previewUrl", previewUrl)
      }
      router.push("/process")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">写真アップロード</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="ml-2 text-emerald-600 font-semibold">アップロード</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <span className="ml-2 text-gray-500">処理</span>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-center">写真をアップロードしてください</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <p>対応形式: JPG, PNG</p>
                    <p>最大ファイルサイズ: 7MB</p>
                    <p>推奨解像度: 480×480ピクセル以上</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {previewUrl && (
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="プレビュー"
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile}>
                      <X className="w-4 h-4" />
                    </Button>
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

                  {previewUrl && !isUploading && (
                    <div className="text-center">
                      <div className="inline-block border-2 border-gray-200 rounded-lg p-2 mb-4">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="アップロードされた写真"
                          width={200}
                          height={200}
                          className="rounded object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-600">プレビュー</p>
                    </div>
                  )}
                </div>
              )}

              {/* Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">写真の要件</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 最近6ヶ月以内に撮影された写真</li>
                      <li>• 正面を向いて、無帽、無背景</li>
                      <li>• 顔がはっきりと写っているもの</li>
                      <li>• 影や反射がないもの</li>
                    </ul>
                  </div>
                </div>
              </div>

              {uploadedFile && !isUploading && (
                <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                  次へ進む
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
