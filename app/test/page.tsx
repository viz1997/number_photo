"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Download } from "lucide-react"
import Image from "next/image"

export default function TestPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Use a sample image URL for testing
      const testImageUrl = "https://replicate.delivery/pbxt/N55l5TWGh8mSlNzW8usReoaNhGbFwvLeZR3TX1NL4pd2Wtfv/replicate-prediction-f2d25rg6gnrma0cq257vdw2n4c.png"

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 2
        })
      }, 100)

      // Call the processing API
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: testImageUrl }),
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Processing failed')
      }

      const data = await response.json()
      
      if (data.success && data.processedImageUrl) {
        setProcessedImageUrl(data.processedImageUrl)
        setProgress(100)
      } else {
        throw new Error('No processed image received')
      }
    } catch (error) {
      console.error('Processing error:', error)
      setError(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImageUrl) return
    
    const link = document.createElement('a')
    link.href = processedImageUrl
    link.download = `test-processed-photo-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API テスト</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={testProcessing} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  処理中...
                </>
              ) : (
                'テスト画像を処理'
              )}
            </Button>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>処理進行状況</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">エラー</h4>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {processedImageUrl && (
              <div className="space-y-4">
                <h3 className="font-semibold">処理結果</h3>
                <div className="border rounded-lg p-4">
                  <Image
                    src={processedImageUrl}
                    alt="処理後の写真"
                    width={400}
                    height={400}
                    className="mx-auto rounded object-cover"
                  />
                </div>
                <Button 
                  onClick={downloadImage} 
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 