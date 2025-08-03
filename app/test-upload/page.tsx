"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[UPLOAD_DEBUG] ${message}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
      addLog(`文件选择成功: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("请选择一个文件")
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)
    setProgress(0)
    setDebugLog([])

    addLog("开始上传流程...")

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      addLog(`准备上传文件: ${file.name}`)
      addLog(`文件大小: ${file.size} bytes`)
      addLog(`文件类型: ${file.type}`)

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(Math.round(percentComplete))
          addLog(`上传进度: ${Math.round(percentComplete)}%`)
        }
      })

      xhr.addEventListener('loadstart', () => {
        addLog("上传请求开始")
      })

      xhr.addEventListener('load', () => {
        addLog(`服务器响应状态: ${xhr.status}`)
        addLog(`服务器响应: ${xhr.responseText}`)
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              setResult(response)
              addLog("上传成功！")
              addLog(`文件ID: ${response.fileId}`)
              addLog(`图片URL: ${response.imageUrl}`)
            } else {
              setError(response.error || '上传失败')
              addLog(`错误: ${response.error || '未知错误'}`)
            }
          } catch (parseError) {
            setError("服务器响应格式错误")
            addLog(`解析错误: ${parseError}`)
          }
        } else {
          setError(`HTTP错误: ${xhr.status}`)
          addLog(`HTTP错误详情: ${xhr.status} - ${xhr.statusText}`)
        }
        setUploading(false)
      })

      xhr.addEventListener('error', () => {
        setError("网络错误：无法连接到服务器")
        addLog("上传请求失败：网络错误")
        setUploading(false)
      })

      xhr.addEventListener('timeout', () => {
        setError("请求超时")
        addLog("上传超时")
        setUploading(false)
      })

      xhr.open('POST', '/api/upload')
      addLog("发送POST请求到 /api/upload")
      xhr.send(formData)

    } catch (error) {
      setError(`上传异常: ${error}`)
      addLog(`上传异常: ${error}`)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">上传测试页面</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>文件上传测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? '上传中...' : '测试上传'}
            </Button>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center">{progress}%</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">上传成功！</p>
                    <p>文件ID: {result.fileId}</p>
                    <p>图片URL: <a href={result.imageUrl} target="_blank" className="text-blue-600 underline">查看图片</a></p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {debugLog.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">调试日志:</h3>
                <pre className="text-xs overflow-auto max-h-64">
                  {debugLog.join('\n')}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            返回主页面
          </a>
        </div>
      </div>
    </div>
  )
}