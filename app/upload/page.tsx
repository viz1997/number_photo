"use client"

import { useState, useCallback, useEffect } from "react"
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const simulateUpload = async (file: File) => {
    if (!file) return
    
    console.log('=== simulateUpload 开始 ===')
    console.log('上传文件:', file.name, file.size, file.type)
    
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('准备发送 /api/upload 请求...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('upload response status:', response.status)
      console.log('upload response ok:', response.ok)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      console.log('upload response data:', data)
      console.log('data.success:', data.success)
      console.log('data.imageUrl:', data.imageUrl)
      console.log('data.photoRecordId:', data.photoRecordId)
      
      if (data.success) {
        setUploadProgress(100)

        // Always prefer R2 URL for preview
        if (data.imageUrl) {
          console.log('存储 R2 imageUrl 到 sessionStorage:', data.imageUrl)
          // 对于私有桶，data.imageUrl 是对象键，不是完整URL
          // 我们需要为预览生成一个可访问的URL
          try {
            // 生成预览URL（使用预签名URL）
            const previewRes = await fetch(`/api/original-image/${encodeURIComponent(data.imageUrl)}`)
            if (previewRes.ok) {
              const previewData = await previewRes.json()
              if (previewData?.success && previewData?.imageUrl) {
                sessionStorage.setItem("previewUrl", previewData.imageUrl)
                console.log('设置预览URL:', previewData.imageUrl)
              } else {
                sessionStorage.setItem("previewUrl", data.imageUrl) // 回退到对象键
              }
            } else {
              sessionStorage.setItem("previewUrl", data.imageUrl) // 回退到对象键
            }
          } catch (e) {
            console.warn('生成预览URL失败，使用对象键:', e)
            sessionStorage.setItem("previewUrl", data.imageUrl)
          }
          
          // 供处理页使用：对象键
          try {
            sessionStorage.setItem("uploadInfo", JSON.stringify({ objectKey: data.imageUrl }))
            console.log('存储对象键:', data.imageUrl)
          } catch {}
        } else if (previewUrl) {
          console.log('警告: R2 imageUrl 缺失，暂存本地 previewUrl')
          sessionStorage.setItem("previewUrl", previewUrl)
        }

        // 供处理页使用：上传文件元信息
        try {
          sessionStorage.setItem(
            "uploadedFileInfo",
            JSON.stringify({ name: file.name, size: file.size, type: file.type })
          )
        } catch {}

        if (data.photoRecordId) {
          console.log('存储 photoRecordId 到 sessionStorage:', data.photoRecordId)
          sessionStorage.setItem("photoRecordId", data.photoRecordId)
        }
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('アップロードに失敗しました。もう一度お試しください。')
    } finally {
      setIsUploading(false)
      console.log('=== simulateUpload 结束 ===')
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      simulateUpload(file)
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

  const removeFile = () => {
    // Revoke blob URL to prevent memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setUploadedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
  }

  const handleNext = () => {
    if (uploadedFile) {
      // 确保处理页预期的键存在
      try {
        sessionStorage.setItem(
          "uploadedFileInfo",
          JSON.stringify({
            name: uploadedFile.name,
            size: uploadedFile.size,
            type: uploadedFile.type,
          }),
        )
      } catch {}
      
      // Always use the R2 imageUrl if available, fallback to previewUrl only if needed
      const r2ImageUrl = sessionStorage.getItem("previewUrl")
      if (r2ImageUrl && r2ImageUrl.startsWith('http')) {
        console.log('使用 R2 imageUrl 进行下一步处理:', r2ImageUrl)
        sessionStorage.setItem("previewUrl", r2ImageUrl)
      } else if (previewUrl) {
        console.log('警告: 使用本地 previewUrl，可能无法被 Replicate API 处理:', previewUrl)
        sessionStorage.setItem("previewUrl", previewUrl)
      } else {
        console.log('错误: 没有可用的图片 URL')
        alert('画像のURLが見つかりません。もう一度アップロードしてください。')
        return
      }
      
      // 直接跳转到处理页面
      router.push("/process")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
             {/* Header */}
       <header className="bg-white border-b border-gray-200">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                 <Upload className="w-5 h-5 text-white" />
               </div>
               <h1 className="text-xl font-bold text-gray-900">写真アップロード</h1>
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
              <CardTitle className="text-center">写真を選択してください</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
                  }`}
                >
                  <input {...getInputProps()} accept="image/*" capture="environment" />
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-green-600 text-lg mr-2">✅</span>
                          <span className="font-bold text-green-800 text-xl">処理完了！</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 左侧文案内容 */}
                        <div className="space-y-4">
                          <div className="text-green-900 font-semibold text-lg">
                            次の処理を完了しました
                          </div>
                          <ul className="text-green-800 text-sm space-y-2">
                            <li className="flex items-center">
                              <span className="text-green-600 mr-2">✅</span>
                              顔の明るさ・コントラストを自動補正
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-600 mr-2">✅</span>
                              背景を無地に調整
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-600 mr-2">✅</span>
                              顔の位置・サイズを規定通りに調整
                            </li>
                            <li className="flex items-center">
                              <span className="text-green-600 mr-2">✅</span>
                              影や反射を自動除去
                            </li>
                          </ul>
                          <div className="text-green-900 font-semibold text-base">
                            最終版をゲットして、オンライン申請を進みましょう
                          </div>
                        </div>
                        
                        {/* 右侧处理后图片 */}
                        <div className="flex flex-col items-center">
                          <div className="text-sm text-green-800 font-medium mb-2">処理後の写真</div>
                          <div className="relative w-48 h-48 bg-white border-2 border-green-300 rounded-lg flex items-center justify-center">
                            <div className="text-gray-400 text-center">
                              <div className="text-4xl mb-2">📷</div>
                              <div className="text-xs">SAMPLE</div>
                            </div>
                          </div>
                        </div>
                      </div>
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
