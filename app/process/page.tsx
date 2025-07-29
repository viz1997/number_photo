"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowRight, CheckCircle, Download } from "lucide-react"
import Image from "next/image"

export default function ProcessPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Get original image from sessionStorage
    const previewUrl = sessionStorage.getItem("previewUrl")
    console.log('=== process 页面开始 ===')
    console.log('从 sessionStorage 获取的 previewUrl:', previewUrl)
    
    if (previewUrl) {
      setOriginalImageUrl(previewUrl)
      console.log('开始处理图片:', previewUrl)
      processImage(previewUrl)
    } else {
      console.log('错误: sessionStorage 中没有 previewUrl')
      setError("No image found. Please upload an image first.")
      setIsProcessing(false)
    }
  }, [])

  const processImage = async (imageUrl: string) => {
    console.log('=== processImage 开始 ===')
    console.log('处理图片 URL:', imageUrl)
    
    try {
      // Simulate initial progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 2
        })
      }, 100)

      console.log('准备调用 /api/process...')
      // Call the processing API
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      console.log('process response status:', response.status)
      console.log('process response ok:', response.ok)

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('process API 错误:', errorData)
        throw new Error(errorData.details || 'Processing failed')
      }

      const data = await response.json()
      console.log('process response data:', data)
      console.log('data.success:', data.success)
      console.log('data.processedImageUrl:', data.processedImageUrl)
      
      if (data.success && data.processedImageUrl) {
        setProcessedImageUrl(data.processedImageUrl)
        setProgress(100)
        console.log('处理成功，设置 processedImageUrl:', data.processedImageUrl)
        
        // Generate watermarked version
        setTimeout(() => {
          generateWatermarkedImage(data.processedImageUrl)
        }, 500)
      } else {
        console.log('错误: 没有收到处理后的图片')
        throw new Error('No processed image received')
      }
    } catch (error) {
      console.error('Processing error:', error)
      setError(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
      console.log('=== processImage 结束 ===')
    }
  }

  const generateWatermarkedImage = (imageUrl: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the original image
      ctx.drawImage(img, 0, 0)
      
      // Add watermark
      ctx.save()
      
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Watermark text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = `${Math.max(canvas.width * 0.1, 24)}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Add some rotation for watermark effect
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-0.2)
      ctx.fillText('Preview', 0, 0)
      
      ctx.restore()
      
      // Convert to data URL
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setWatermarkedImageUrl(watermarkedDataUrl)
    }
    
    img.onerror = () => {
      console.error('Failed to load image for watermarking')
      setWatermarkedImageUrl(imageUrl) // Fallback to original
    }
    
    img.src = imageUrl
  }

  const downloadImage = () => {
    if (!processedImageUrl) return
    
    const link = document.createElement('a')
    link.href = processedImageUrl
    link.download = `processed-photo-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.history.back()} 
              className="w-full"
            >
              戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                            src={originalImageUrl}
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
                        {watermarkedImageUrl && (
                          <Image
                            src={watermarkedImageUrl}
                            alt="処理後の写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
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
                    <Button 
                      onClick={downloadImage} 
                      size="lg" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={!processedImageUrl}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      高画質写真をダウンロード
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">
                      ダウンロードされる写真にはウォーターマークが含まれません
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden canvas for watermark generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
