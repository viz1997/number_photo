"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowRight, CheckCircle, Download, Upload, X, AlertCircle, Mail, Clock, Star } from "lucide-react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutProvider } from "@stripe/react-stripe-js"
import CheckoutForm from "@/components/payment/checkout/CheckoutForm"
import { useDropzone } from "react-dropzone"
import { getAccessibleR2FileUrl } from "@/lib/r2-client"
import { getPhotoRecord } from "@/lib/supabase"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function ProcessPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useSearchParams()
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null)
  const [checkoutInitLoading, setCheckoutInitLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const autoAdvanceTriedRef = useRef(false)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [pendingProcessRecordId, setPendingProcessRecordId] = useState<string | null>(null)
  const triggerOnceRef = useRef(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializePage = async () => {
      // 检查是否是从其他页面跳转过来的（通过URL参数或referrer）
      const isDirectAccess = !document.referrer.includes(window.location.origin) && 
                            !window.location.search.includes('session_id') &&
                            !window.location.search.includes('from_upload')
      
      // 检查是否有强制重置参数
      const shouldReset = window.location.search.includes('reset=true')
      
      // 如果是直接访问或有重置参数，清除所有session数据并显示上传界面
      if (isDirectAccess || shouldReset) {
        console.log('直接访问或强制重置 /process 页面，清除所有session数据')
        sessionStorage.clear()
        setIsProcessing(false)
        setProcessedImageUrl(null)
        setOriginalImageUrl(null)
        setWatermarkedImageUrl(null)
        setError(null)
        setShowCheckout(false)
        setCheckoutClientSecret(null)
        setUploadedFile(null)
        setUploadPreview(null)
        setUploadProgress(0)
        setProgress(0)
        return
      }

      // 检查是否从主页上传了文件
      const uploadedFileInfo = sessionStorage.getItem("uploadedFileInfo")
      const uploadInfoRawFromMain = sessionStorage.getItem("uploadInfo")
      
      if (uploadedFileInfo && uploadInfoRawFromMain) {
        console.log('检测到从主页上传的文件，清除processedImageUrl状态并触发上传流程')
        console.log('清除前的sessionStorage状态:', {
          processedImageUrl: sessionStorage.getItem("processedImageUrl"),
          watermarkedImageUrl: sessionStorage.getItem("watermarkedImageUrl"),
          photoRecordId: sessionStorage.getItem("photoRecordId")
        })
        // 清除之前可能存在的处理结果状态
        setProcessedImageUrl(null)
        setWatermarkedImageUrl(null)
        setIsProcessing(false)
        // 同时清除sessionStorage中的processedImageUrl，确保状态一致
        sessionStorage.removeItem("processedImageUrl")
        sessionStorage.removeItem("watermarkedImageUrl")
        // 清除其他可能影响状态的数据
        sessionStorage.removeItem("photoRecordId")
        // 清除错误状态
        setError(null)
        console.log('清除后的sessionStorage状态:', {
          processedImageUrl: sessionStorage.getItem("processedImageUrl"),
          watermarkedImageUrl: sessionStorage.getItem("watermarkedImageUrl"),
          photoRecordId: sessionStorage.getItem("photoRecordId")
        })
        // ✅ 触发上传流程（使用R2 URL）
        handleUploadedFileFromMainPage(uploadedFileInfo)
        setIsInitializing(false)
        return
      }

      // 只有在不是从主页上传的情况下，才继续执行后续逻辑
      // Get original image and record info from sessionStorage
      const uploadInfoRaw = sessionStorage.getItem("uploadInfo")
      const photoRecordId = sessionStorage.getItem("photoRecordId")
      const processedImageUrlFromStorage = sessionStorage.getItem("processedImageUrl")
      const isPaymentCompleted = sessionStorage.getItem("paymentCompleted")
      
      // 如果是从主页上传，跳过后续逻辑
      if (sessionStorage.getItem("uploadedFileInfo")) {
        console.log('检测到uploadedFileInfo，跳过后续逻辑')
        setIsInitializing(false)
        return
      }

      console.log('从sessionStorage加载数据:', {
        photoRecordId,
        processedImageUrlFromStorage,
        isPaymentCompleted
      })

      // Clear any existing session data when accessing the page directly
      // This ensures users always start with a fresh upload flow
      if (!photoRecordId && !processedImageUrlFromStorage) {
        // Clear any stale data to ensure clean state
        sessionStorage.removeItem("previewUrl")
        sessionStorage.removeItem("uploadInfo")
        sessionStorage.removeItem("paymentCompleted")
        sessionStorage.removeItem("pendingDownloadFileKey")
        setIsProcessing(false)
        return
      }

      // Prioritize persistent R2 URL over ephemeral blob URL for original image display
      if (uploadInfoRaw) {
        try {
          const uploadInfo = JSON.parse(uploadInfoRaw)
          const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
          if (publicDomain && uploadInfo?.objectKey) {
            const r2Url = `${publicDomain}/${uploadInfo.objectKey}`
            setOriginalImageUrl(r2Url)
            console.log('使用持久化R2 URL显示原图:', r2Url)
          }
        } catch (e) {
          console.warn('解析 uploadInfo 失败:', e)
        }
      }

      if (photoRecordId) {
        // 如果已有处理结果，直接显示
        if (processedImageUrlFromStorage) {
          setProcessedImageUrl(processedImageUrlFromStorage)
          setIsProcessing(false)
          // 生成水印预览
          setTimeout(() => {
            generateWatermarkedImage(processedImageUrlFromStorage)
          }, 500)
          return
        }
        
        // 如果没有sessionStorage中的处理结果，尝试从数据库获取
        console.log('从数据库获取已处理结果...')
        setIsProcessing(true)
        const hasResult = await fetchProcessedResultFromDatabase(photoRecordId)
        if (hasResult) {
          setIsProcessing(false)
          return
        }
        
        // 如果数据库中没有结果，说明AI处理还没有完成，需要重新处理
        console.log('数据库中没有找到已处理结果，需要重新处理')
        setIsProcessing(false)
        // 这里可以显示一个提示，告诉用户处理还在进行中
        setError('AI处理还在进行中，请稍后再試')
      } else {
        // 如果没有 photoRecordId，说明还没有上传，显示上传界面
        setIsProcessing(false)
      }
      
      setIsInitializing(false)
    }

    initializePage()
  }, [])

  // 新增：从Supabase获取已处理结果的函数
  const fetchProcessedResultFromDatabase = async (photoRecordId: string) => {
    try {
      console.log('从数据库获取已处理结果...')
      const photoRecord = await getPhotoRecord(photoRecordId)
      
      if (photoRecord && photoRecord.output_image_url) {
        console.log('找到已处理的结果:', photoRecord.output_image_url)
        
        // 设置处理后的图片URL
        setProcessedImageUrl(photoRecord.output_image_url)
        sessionStorage.setItem("processedImageUrl", photoRecord.output_image_url)
        
        // 设置支付状态
        if (photoRecord.is_paid) {
          sessionStorage.setItem("paymentCompleted", "true")
        }
        
        // 生成水印预览
        setTimeout(() => {
          if (photoRecord.output_image_url) {
            generateWatermarkedImage(photoRecord.output_image_url)
          }
        }, 500)
        
        // 检查支付状态并创建下载token
        if (photoRecord.output_image_url) {
          checkPaymentStatusAndCreateToken(photoRecordId, photoRecord.output_image_url)
        }
        
        return true
      } else {
        console.log('数据库中没有找到已处理的结果')
        return false
      }
    } catch (error) {
      console.error('从数据库获取结果失败:', error)
      return false
    }
  }

  // 新增：检查支付状态并创建下载token的函数
  const checkPaymentStatusAndCreateToken = async (photoRecordId: string, processedImageUrl: string) => {
    try {
      console.log('检查支付状态并尝试创建下载token...')
      const fileKey = processedImageUrl.startsWith('http') ? 
        new URL(processedImageUrl).pathname.replace(/^\/+/, '') : 
        processedImageUrl
      
      const tokenRes = await fetch('/api/download/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey, photoRecordId })
      })
      
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json()
        if (tokenData?.success && tokenData?.token) {
          console.log('支付已完成，自动创建下载token成功:', tokenData.token)
          sessionStorage.setItem("paymentCompleted", "true")
          setDownloadToken(tokenData.token)
          return
        }
      }
      
      if (tokenRes.status === 403) {
        console.log('支付未完成，显示支付界面')
        // 支付未完成，显示支付界面
        setShowCheckout(true)
      }
    } catch (error) {
      console.error('检查支付状态时出错:', error)
    }
  }

  useEffect(() => {
    // Handle return from embedded checkout on the same page
    const sessionId = params.get("session_id")
    if (!sessionId) return

    const handleReturn = async () => {
      try {
        const res = await fetch(`/api/session-status?session_id=${sessionId}`)
        const data = await res.json()
        if (data.status === "complete") {
          // Ensure we use the photoRecordId from Stripe metadata if present
          const metaRecordId = (data?.session?.metadata?.photoRecordId as string | undefined) || undefined
          if (metaRecordId) {
            sessionStorage.setItem("photoRecordId", metaRecordId)
          }
          // Prefer existing pending file key; if missing, derive from processed image URL
          let fileKey = sessionStorage.getItem("pendingDownloadFileKey") || undefined
          if (!fileKey) {
            const url = processedImageUrl || sessionStorage.getItem("processedImageUrl") || undefined
            if (url) {
              try {
                const derived = url.startsWith('http') ? new URL(url).pathname.replace(/^\/+/, '') : url
                fileKey = derived
                sessionStorage.setItem('pendingDownloadFileKey', derived)
              } catch {}
            }
          }
          const photoRecordId = sessionStorage.getItem("photoRecordId")
          if (fileKey && photoRecordId) {
            // 设置支付完成标志
            sessionStorage.setItem("paymentCompleted", "true")
            // 支付完成后创建下载 token，增加重试以等待后端写入 is_paid
            const tryCreateToken = async (attempt = 1): Promise<boolean> => {
            const tokenRes = await fetch('/api/download/create-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileKey, photoRecordId })
            })
              if (tokenRes.ok) {
            const tokenData = await tokenRes.json()
                if (tokenData?.success && tokenData?.token) {
              sessionStorage.removeItem("pendingDownloadFileKey")
                  setDownloadToken(tokenData.token)
                  return true
                }
              }
              if (tokenRes.status === 403 && attempt < 3) {
                // 等待后端 is_paid 写入生效
                await new Promise(r => setTimeout(r, 800))
                return tryCreateToken(attempt + 1)
              }
              return false
            }

            const ok = await tryCreateToken(1)
            if (ok) return
            
            // If we still can't get the token after retries, show a manual retry option
            setError("支付已完成，但系统需要一点时间来更新状态。请稍等片刻后点击重试按钮。")
            // Store the retry info for manual retry
            sessionStorage.setItem('pendingRetry', JSON.stringify({ fileKey, photoRecordId }))
          }
          // 如果没有获取到token，显示错误
          setError("支付完成但无法创建下载链接，请联系客服")
        } else {
          // 支付未完成，显示结账界面
          setShowCheckout(true)
        }
      } catch (error) {
        console.error('处理支付返回时出错:', error)
        setError("支付处理出错，请重试")
      }
    }

    handleReturn()
  }, [params])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (uploadPreview && uploadPreview.startsWith('blob:')) {
        URL.revokeObjectURL(uploadPreview)
      }
    }
  }, [uploadPreview])

  // 调试：监控processedImageUrl状态变化
  useEffect(() => {
    console.log('processedImageUrl状态变化:', {
      processedImageUrl,
      isInitializing,
      pendingProcessRecordId,
      photoRecordId: sessionStorage.getItem('photoRecordId')
    })
  }, [processedImageUrl, isInitializing, pendingProcessRecordId])

  useEffect(() => {
    // 当处理完成时，自动判断应进入步骤二还是步骤三：
    // - 若已支付（服务器允许创建下载 token），直接跳到下载页（步骤三）
    // - 若未支付（403），展示结账（步骤二）
    if (!processedImageUrl) return
    if (showCheckout || checkoutClientSecret) return
    if (autoAdvanceTriedRef.current) return
    if (isInitializing) return

    const isPaymentCompleted = sessionStorage.getItem("paymentCompleted")

        const resolveFileKey = (url: string) => {
          try {
            if (url.startsWith('http')) {
              return new URL(url).pathname.replace(/^\/+/, '')
            }
            return url
          } catch {
            return url
          }
        }

    const attempt = async () => {
      autoAdvanceTriedRef.current = true
        const fileKey = resolveFileKey(processedImageUrl)
        sessionStorage.setItem('pendingDownloadFileKey', fileKey)
      const photoRecordId = sessionStorage.getItem('photoRecordId') || undefined
      if (!photoRecordId) return

      try {
        const tokenRes = await fetch('/api/download/create-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey, photoRecordId })
        })
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          if (tokenData?.success && tokenData?.token) {
            sessionStorage.setItem("paymentCompleted", "true")
            // Instead of redirecting, render Step 3 content inline
            setDownloadToken(tokenData.token)
            return
          }
        }
        if (tokenRes.status === 403) {
          // 未支付 → 清理误置的支付完成标记并展示结账
          sessionStorage.removeItem('paymentCompleted')
          await initEmbeddedCheckout()
        }
      } catch {
        // 忽略网络错误，停留在当前页面
      }
    }

    attempt()
  }, [processedImageUrl, showCheckout, checkoutClientSecret])

  // 新增：当pendingProcessRecordId被设置时，自动显示邮箱弹窗
  useEffect(() => {
    if (pendingProcessRecordId && !isProcessing && !processedImageUrl && !downloadToken) {
      // 在步骤二界面显示时，自动显示邮箱弹窗
      console.log('步骤二界面显示，自动显示邮箱弹窗')
      setShowEmailDialog(true)
    }
  }, [pendingProcessRecordId, isProcessing, processedImageUrl, downloadToken])

  const handleFileUpload = async (file: File, options?: { silent?: boolean }) => {
    if (!file) return

    console.log('=== handleFileUpload 开始 ===')
    console.log('上传文件:', file.name, file.size, file.type)
    
    const silent = options?.silent === true
    if (!silent) {
      setIsUploading(true)
      setUploadProgress(0)
    }
    setError(null)
    
    let uploadResult: { photoRecordId: string } | undefined

    try {
      // 创建预览（仅非静默模式）
      if (!silent) {
        const previewUrl = URL.createObjectURL(file)
        setUploadPreview(previewUrl)
        setOriginalImageUrl(previewUrl)
      }

      // 模拟上传进度（仅非静默模式）
      let progressInterval: NodeJS.Timeout | undefined
      if (!silent) {
        progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              if (progressInterval) clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)
      }

      // 准备上传数据
      const formData = new FormData()
      formData.append('file', file)

      console.log('准备发送 /api/upload 请求...')
      // 上传文件
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (progressInterval) clearInterval(progressInterval)
      if (!silent) setUploadProgress(100)

      console.log('upload response status:', response.status)
      console.log('upload response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Upload failed')
      }

      const data = await response.json()
      console.log('upload response data:', data)
      console.log('data.success:', data.success)
      console.log('data.photoRecordId:', data.photoRecordId)
      
      if (data.success && data.photoRecordId) {
        // 保存到 sessionStorage
        if (data.photoRecordId) {
          if (silent) {
            // 静默模式下，不存储到sessionStorage，只返回ID
            console.log('静默上传成功，获得photoRecordId:', data.photoRecordId)
            uploadResult = { photoRecordId: data.photoRecordId }
          } else {
            sessionStorage.setItem("photoRecordId", data.photoRecordId)
            sessionStorage.setItem("previewUrl", uploadPreview || '')
            console.log('存储 photoRecordId 到 sessionStorage:', data.photoRecordId)
            console.log('存储 previewUrl 到 sessionStorage:', uploadPreview)
          }
        }
         
        // 非静默模式下，设置pendingProcessRecordId以显示步骤二界面
        if (!silent) {
          // 上传完成后，设置pendingProcessRecordId以显示步骤二界面
          setPendingProcessRecordId(data.photoRecordId)
          console.log('上传完成，设置pendingProcessRecordId以显示步骤二界面')
        }
      } else {
        throw new Error('Upload succeeded but no photo record ID received')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      setUploadPreview(null)
      setOriginalImageUrl(null)
    } finally {
      if (!silent) {
        setIsUploading(false)
        setUploadProgress(0)
      }
      console.log('=== handleFileUpload 结束 ===')
    }
    
    // 静默模式下返回photoRecordId
    return uploadResult
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      handleFileUpload(file)
    }
  }, [])

  const validateBlobUrl = async (url: string): Promise<boolean> => {
    // Blob URLs don't support HEAD reliably; treat as valid within the same session
    if (url.startsWith('blob:')) return true
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      // If HEAD fails (CORS or server limitations), don't block the flow
      return true
    }
  }

  const handleUploadedFileFromMainPage = async (uploadedFileInfo: string) => {
    console.log('=== handleUploadedFileFromMainPage 开始 ===')
    console.log('当前状态:', {
      pendingProcessRecordId,
      isProcessing,
      processedImageUrl,
      originalImageUrl
    })
    
    // 从主页上传完成后进入：直接显示步骤二，自动触发邮箱弹窗
    // 优先使用持久化R2 URL，而不是临时的blob URL
    const uploadInfoRaw = sessionStorage.getItem("uploadInfo")
    if (uploadInfoRaw) {
      try {
        const uploadInfo = JSON.parse(uploadInfoRaw)
        const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
        if (publicDomain && uploadInfo?.objectKey) {
          const r2Url = `${publicDomain}/${uploadInfo.objectKey}`
          setOriginalImageUrl(r2Url)
          console.log('使用持久化R2 URL显示原图:', r2Url)
        } else {
          console.warn('R2 URL不可用，无法显示原图')
        }
      } catch (e) {
        console.warn('解析 uploadInfo 失败:', e)
      }
    }
    
    try {
      const fileInfo = JSON.parse(uploadedFileInfo)
      // 由于不再有previewUrl，我们需要从uploadInfo创建File对象
      let file: File | null = null
      const uploadInfoRaw = sessionStorage.getItem("uploadInfo")
      if (uploadInfoRaw) {
        try {
          const uploadInfo = JSON.parse(uploadInfoRaw)
          if (uploadInfo?.imageUrl) {
            // 从R2 URL创建File对象
            const res = await fetch(uploadInfo.imageUrl)
            if (!res.ok) throw new Error(`Failed to fetch R2 image: ${res.status}`)
            const blob = await res.blob()
            file = new File([blob], fileInfo.name, { type: fileInfo.type })
            setUploadedFile(file)
            // 不设置uploadPreview，因为我们使用R2 URL
          }
        } catch (e) {
          console.warn('从R2 URL创建File对象失败:', e)
        }
      }

      // 如果已存在记录ID，直接可处理
      const existingId = sessionStorage.getItem('photoRecordId')
      console.log('检查是否已存在photoRecordId:', existingId)
      if (existingId) {
        console.log('发现已存在的photoRecordId:', existingId)
        setPendingProcessRecordId(existingId)
        // 设置pendingProcessRecordId以显示步骤二界面
        return
      }

      // 否则，静默上传一次仅用于创建记录（不显示进度）
      if (file) {
        console.log('开始静默上传以创建记录...')
        const result = await handleFileUpload(file, { silent: true })
        // 静默上传成功后，直接使用返回的photoRecordId
        if (result && result.photoRecordId) {
          console.log('静默上传后获得photoRecordId:', result.photoRecordId)
          setPendingProcessRecordId(result.photoRecordId)
          // 设置pendingProcessRecordId以显示步骤二界面
        }
      } else {
        console.warn('无法创建File对象，跳过静默上传')
        return
      }
    } catch (error) {
      console.error('处理上传文件失败:', error)
      if (error instanceof Error && error.message.includes('Blob URL is invalid')) {
        setError('セッションが期限切れになりました。もう一度写真をアップロードしてください。')
      } else {
        setError('ファイルの処理に失敗しました。もう一度お試しください。')
      }
      setIsProcessing(false)
    }
    
    console.log('=== handleUploadedFileFromMainPage 结束 ===')
    console.log('最终状态:', {
      pendingProcessRecordId,
      isProcessing,
      processedImageUrl,
      originalImageUrl
    })
    console.log('sessionStorage状态:', {
      processedImageUrl: sessionStorage.getItem("processedImageUrl"),
      watermarkedImageUrl: sessionStorage.getItem("watermarkedImageUrl")
    })
  }

  // 新增：处理邮箱弹窗的函数，确保无论用户如何操作都会开始AI处理
  const handleEmailDialogAction = (action: 'confirm' | 'cancel' | 'close') => {
    console.log('=== handleEmailDialogAction 开始 ===', { action })
    console.log('当前状态:', {
      pendingProcessRecordId,
      photoRecordId: sessionStorage.getItem('photoRecordId'),
      isProcessing,
      processedImageUrl
    })
    
    const email = emailInput.trim()
    if (email) {
      sessionStorage.setItem('email', email)
    }
    setShowEmailDialog(false)
    
    // 无论用户如何操作，都开始AI处理
    const photoRecordId = pendingProcessRecordId || sessionStorage.getItem('photoRecordId')
    if (photoRecordId && !isProcessing && !processedImageUrl) {
      console.log('开始AI处理，photoRecordId:', photoRecordId)
      setIsProcessing(true)
      processImage(photoRecordId)
      // 清除pendingProcessRecordId，因为AI处理即将开始
      setPendingProcessRecordId(null)
    } else {
      console.log('跳过AI处理:', {
        photoRecordId,
        isProcessing,
        processedImageUrl
      })
    }
    
    console.log('=== handleEmailDialogAction 结束 ===')
  }

  const removeFile = () => {
    // Revoke blob URL to prevent memory leaks
    if (uploadPreview && uploadPreview.startsWith('blob:')) {
      URL.revokeObjectURL(uploadPreview)
    }
    setUploadedFile(null)
    setUploadPreview(null)
    setUploadProgress(0)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 7 * 1024 * 1024, // 7MB
  })

  const processImage = async (photoRecordId: string) => {
    console.log('=== processImage 开始 ===')
    console.log('处理记录 ID:', photoRecordId)
    
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
        body: JSON.stringify({ photoRecordId }),
      })

      console.log('process response status:', response.status)
      console.log('process response ok:', response.ok)
      console.log('process response headers:', Object.fromEntries(response.headers.entries()))

      clearInterval(progressInterval)

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.log('process API 错误 (JSON):', errorData)
          throw new Error(errorData.details || 'Processing failed')
        } else {
          // Handle non-JSON responses (HTML error pages)
          const errorText = await response.text()
          console.log('process API 错误 (非JSON):', errorText.substring(0, 200))
          
          if (response.status === 500) {
            throw new Error('サーバー内部エラーが発生しました。環境変数の設定を確認してください。')
          } else if (response.status === 404) {
            throw new Error('APIエンドポイントが見つかりません。')
          } else {
            throw new Error(`API呼び出しに失敗しました (${response.status})`)
          }
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        console.log('Unexpected response type:', contentType)
        console.log('Response content:', responseText.substring(0, 200))
        throw new Error('APIから無効なレスポンスが返されました')
      }

      const data = await response.json()
      console.log('process response data:', data)
      console.log('data.success:', data.success)
      console.log('data.outputImageUrl:', data.outputImageUrl)
      
      if (data.success && data.outputImageUrl) {
        setProcessedImageUrl(data.outputImageUrl)
        setProgress(100)
        console.log('处理成功，设置 processedImageUrl:', data.outputImageUrl)
        
        // 保存处理后的图片URL到 sessionStorage，避免重复处理
        sessionStorage.setItem("processedImageUrl", data.outputImageUrl)
        
        // Generate watermarked version
        setTimeout(() => {
          generateWatermarkedImage(data.outputImageUrl)
        }, 500)
      } else {
        console.log('错误: 没有收到处理后的图片')
        throw new Error('No processed image received')
      }
    } catch (error) {
      console.error('Processing error:', error)
      
      // より詳細なエラーメッセージを表示
      let errorMessage = 'Processing failed'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // 環境変数関連のエラーの場合、具体的な指示を表示
      if (errorMessage.includes('環境変数') || errorMessage.includes('DATABASE_URL')) {
        errorMessage = 'データベース接続エラー。.env.localファイルの設定を確認してください。'
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
      console.log('=== processImage 结束 ===')
    }
  }

  const generateWatermarkedImage = async (imageUrl: string) => {
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
      
      // Watermark text - draw three labels along diagonal
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      const baseFont = Math.max(canvas.width * 0.08, 24)
      ctx.font = `${baseFont}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const positions = [
        { x: canvas.width * 0.25, y: canvas.height * 0.25 },
        { x: canvas.width * 0.5, y: canvas.height * 0.5 },
        { x: canvas.width * 0.75, y: canvas.height * 0.75 },
      ]
      for (const pos of positions) {
        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate(-0.2)
        ctx.fillText('Preview', 0, 0)
        ctx.restore()
      }
      
      ctx.restore()
      
      // Convert to data URL
      const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      setWatermarkedImageUrl(watermarkedDataUrl)
    }
    
    img.onerror = () => {
      console.error('Failed to load image for watermarking')
      setWatermarkedImageUrl(imageUrl) // Fallback to original
    }
    
    // Try to get an accessible URL for the image
    try {
      // Extract the object key from the imageUrl
      let objectKey: string | undefined
      if (imageUrl.includes('/mynumber/')) {
        // Extract the path after the domain
        const urlParts = imageUrl.split('/mynumber/')
        if (urlParts.length > 1) {
          objectKey = `mynumber/${urlParts[1]}`
        }
      }
      
      if (objectKey) {
        // Use the accessible R2 URL function
        const accessibleUrl = await getAccessibleR2FileUrl(objectKey)
        console.log('Using accessible R2 URL for watermarking:', accessibleUrl)
        img.src = accessibleUrl
      } else {
        // Fallback to original URL
        img.src = imageUrl
      }
    } catch (error) {
      console.warn('Failed to get accessible URL, using original:', error)
      img.src = imageUrl
    }
  }

  const initEmbeddedCheckout = async () => {
    try {
      setCheckoutInitLoading(true)
      setCheckoutError(null)
      // 先显示支付容器，让用户看到“正在初始化/错误信息”
      setShowCheckout(true)
      const photoRecordId = sessionStorage.getItem('photoRecordId')
      const email = sessionStorage.getItem('email') || undefined
      if (!photoRecordId) {
        setCheckoutError('缺少照片记录ID')
        return
      }
      const baseUrl = window.location.href.split('#')[0]
      const sep = baseUrl.includes('?') ? '&' : '?'
      const returnUrl = `${baseUrl}${sep}session_id={CHECKOUT_SESSION_ID}`
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoRecordId,
          email,
          returnUrl
        })
      })
      if (!response.ok) {
        throw new Error(`创建结账会话失败: ${response.status}`)
      }
      const data = await response.json()
      if (!data.clientSecret) {
        throw new Error('未获取到 clientSecret')
      }
      setCheckoutClientSecret(data.clientSecret)
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : '初始化结账失败')
    } finally {
      setCheckoutInitLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!processedImageUrl) return

    const resolveFileKey = (url: string) => {
      try {
        if (url.startsWith('http')) {
          return new URL(url).pathname.replace(/^\/+/, '')
        }
        return url
      } catch {
        return url
      }
    }

    const fileKey = resolveFileKey(processedImageUrl)
    const photoRecordId = sessionStorage.getItem('photoRecordId') || undefined

    // Try to create a normal download token (requires paid)
    try {
      const tokenRes = await fetch('/api/download/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey, photoRecordId })
      })
      const tokenData = await tokenRes.json()
      if (tokenRes.ok && tokenData.success && tokenData.token) {
        const downloadRes = await fetch(`/api/download/${tokenData.token}`)
        const downloadData = await downloadRes.json()
        if (downloadRes.ok && downloadData.downloadUrl) {
          const link = document.createElement('a')
          link.href = downloadData.downloadUrl
          link.download = downloadData.fileName || `processed-photo-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }

      // If failed with 403 (Payment required), show embedded checkout on this page
      if (tokenRes.status === 403) {
        sessionStorage.setItem('pendingDownloadFileKey', fileKey)
        await initEmbeddedCheckout()
        return
      }

      // If failed for other reasons, fall through to watermarked flow
    } catch (_) {
      // ignore and fallback to watermarked
    }

    // Fallback: watermarked download token (allowed when unpaid)
    try {
      const wmTokenRes = await fetch('/api/download/watermarked/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey })
      })
      const wmTokenData = await wmTokenRes.json()
      if (wmTokenRes.ok && wmTokenData.success && wmTokenData.token) {
        const wmRes = await fetch(`/api/download/watermarked/${wmTokenData.token}`)
        const wmData = await wmRes.json()
        if (wmRes.ok && wmData.downloadUrl) {
          const link = document.createElement('a')
          link.href = wmData.downloadUrl
          link.download = wmData.fileName || `watermarked-photo-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        }
      }
    } catch (_) {
      // if even watermarked flow fails, do nothing
    }
  }

  if (error) {
    // Check if this is a payment-related error that can be retried
    const pendingRetry = sessionStorage.getItem('pendingRetry')
    const canRetry = pendingRetry && error.includes('支付已完成')
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">エラーが発生しました</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              {canRetry && (
                <Button 
                  onClick={async () => {
                    try {
                      setError(null)
                      const retryData = JSON.parse(pendingRetry)
                      const { fileKey, photoRecordId } = retryData
                      
                      // Try to create download token again
                      const tokenRes = await fetch('/api/download/create-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileKey, photoRecordId })
                      })
                      
                      if (tokenRes.ok) {
                        const tokenData = await tokenRes.json()
                        if (tokenData?.success && tokenData?.token) {
                          sessionStorage.removeItem('pendingRetry')
                          sessionStorage.setItem("paymentCompleted", "true")
                          setDownloadToken(tokenData.token)
                          return
                        }
                      }
                      
                      // If still getting 403, show the error again
                      if (tokenRes.status === 403) {
                        setError("まだ支払い状態が更新されていません。もう少し待ってから再試行してください。")
                      } else {
                        setError("ダウンロードトークンの作成に失敗しました。")
                      }
                    } catch (retryError) {
                      setError("再試行中にエラーが発生しました。")
                    }
                  }} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  再試行
                </Button>
              )}
              <Button 
                onClick={() => window.history.back()} 
                className="w-full"
                variant={canRetry ? "outline" : "default"}
              >
                戻る
              </Button>
            </div>
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
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
                 <Loader2 className="w-5 h-5 text-white" />
               </div>
               <h1 className="text-xl font-bold text-gray-900">写真処理中</h1>
             </div>
                           <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // 清除所有session数据
                    sessionStorage.clear()
                    // 重置所有状态
                    setIsProcessing(false)
                    setProcessedImageUrl(null)
                    setOriginalImageUrl(null)
                    setWatermarkedImageUrl(null)
                    setError(null)
                    setShowCheckout(false)
                    setCheckoutClientSecret(null)
                    setUploadedFile(null)
                    setUploadPreview(null)
                    setUploadProgress(0)
                    setProgress(0)
                    setDownloadToken(null)
                    setShowEmailDialog(false)
                    setEmailInput("")
                    setPendingProcessRecordId(null)
                    // 重置refs
                    autoAdvanceTriedRef.current = false
                    triggerOnceRef.current = false
                  }}
                  className="text-emerald-600 hover:text-emerald-700 border-emerald-300 hover:border-emerald-400"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  重新上传处理
                </Button>
             <Button
               variant="outline"
               onClick={() => window.location.href = '/'}
               className="text-gray-600 hover:text-gray-900"
             >
               ホームに戻る
             </Button>
              </div>
           </div>
         </div>
       </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Unified Progress Steps (3 steps) */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1: アップロード */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  uploadedFile || originalImageUrl ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {uploadedFile || originalImageUrl ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className={`ml-2 font-semibold ${uploadedFile || originalImageUrl ? 'text-emerald-600' : 'text-gray-500'}`}>アップロード</span>
              </div>

              <div className={`w-8 h-px ${isProcessing || processedImageUrl ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>

              {/* Step 2: 処理・支払い */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isProcessing ? 'bg-emerald-600 text-white' : processedImageUrl ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : processedImageUrl ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className={`ml-2 font-semibold ${processedImageUrl ? 'text-emerald-600' : isProcessing ? 'text-emerald-600' : 'text-gray-500'}`}>処理・支払い</span>
              </div>

              <div className={`w-8 h-px ${downloadToken ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>

              {/* Step 3: ダウンロード */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  downloadToken ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {downloadToken ? <CheckCircle className="w-4 h-4" /> : '3'}
                </div>
                <span className={`ml-2 font-semibold ${downloadToken ? 'text-emerald-600' : 'text-gray-500'}`}>ダウンロード</span>
              </div>
            </div>
          </div>

      

          {!uploadedFile && !originalImageUrl && !pendingProcessRecordId ? (
            // 上传界面
            <Card>
              <CardHeader>
                <CardTitle className="text-center">写真をアップロード</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
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
              </CardContent>
            </Card>
          ) : isUploading ? (
            // 上传进度界面
            <Card>
              <CardHeader>
                <CardTitle className="text-center">写真をアップロード中...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">ファイルをサーバーにアップロード中です</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>アップロード進行状況</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                </div>

                {uploadPreview && (
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">アップロード中の写真</div>
                    <div className="relative w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center overflow-hidden mx-auto">
                      <Image
                        src={uploadPreview}
                        alt="アップロード中の写真"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          ) : pendingProcessRecordId && !isProcessing && !processedImageUrl ? (
            // 从主页上传完成后，直接显示Step 2界面（等待AI处理开始）
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-emerald-600">
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    写真処理の準備完了
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original Image */}
                    <div className="text-center">
                      <h3 className="font-semibold mb-4">アップロードされた写真</h3>
                      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        {originalImageUrl && (
                          <Image
                            src={originalImageUrl}
                            alt="アップロードされた写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        )}
                      </div>
                    </div>

                    {/* Processing Status */}
                    <div className="text-center">
                      <h3 className="font-semibold mb-4">処理状況</h3>
                      <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50 flex items-center justify-center h-[250px]">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                          <p className="text-emerald-700">AI処理の準備中...</p>
                          <p className="text-sm text-emerald-600 mt-2">メールアドレスを入力してください</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">次のステップ</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• メールアドレスを入力（任意）</p>
                      <p>• AI処理を開始</p>
                      <p>• 写真の調整と最適化</p>
                      <p>• お支払いとダウンロード</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : isProcessing ? (
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
                                         ) : downloadToken ? (
                       // Step 3: 下载界面（已支付）
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
                                    src={processedImageUrl || "/placeholder.svg?height=300&width=300"}
                                    alt="完成した写真"
                                    width={300}
                                    height={300}
                                    className="rounded object-cover"
                                  />
                                </div>
                               <p className="text-sm text-gray-600 mb-4">マイナンバーカード申請規格準拠・高画質JPEG</p>

                                                               <Button
                                                                     onClick={async () => {
                                     try {
                                       console.log('开始下载，token:', downloadToken)
                                       
                                       // 直接使用处理后的图片URL进行下载，避免API调用的复杂性
                                       if (processedImageUrl) {
                                         console.log('直接下载处理后的图片:', processedImageUrl)
                                         
                                         // 使用fetch下载文件内容，然后创建blob URL进行下载
                                         try {
                                           console.log('开始下载文件内容...')
                                           const fileResponse = await fetch(processedImageUrl)
                                           if (!fileResponse.ok) {
                                             throw new Error(`下载文件失败: ${fileResponse.status}`)
                                           }
                                           
                                           const blob = await fileResponse.blob()
                                           const blobUrl = URL.createObjectURL(blob)
                                           
                                           // 创建下载链接
                                           const link = document.createElement('a')
                                           link.href = blobUrl
                                           link.download = `processed-photo-${Date.now()}.jpg`
                                           document.body.appendChild(link)
                                           link.click()
                                           document.body.removeChild(link)
                                           
                                           // 清理blob URL
                                           setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                           
                                           console.log('文件下载完成')
                                           return
                                         } catch (downloadError) {
                                           console.error('下载文件内容失败:', downloadError)
                                           // 如果fetch下载失败，回退到直接链接下载
                                           const link = document.createElement('a')
                                           link.href = processedImageUrl
                                           link.download = `processed-photo-${Date.now()}.jpg`
                                           link.target = '_blank'
                                           link.rel = 'noopener noreferrer'
                                           document.body.appendChild(link)
                                           link.click()
                                           document.body.removeChild(link)
                                           return
                                         }
                                       }
                                       
                                       // 如果processedImageUrl不存在，尝试通过API获取
                                       console.log('processedImageUrl不存在，尝试通过API获取下载信息...')
                                       const res = await fetch(`/api/download/${downloadToken}`)
                                       console.log('下载API响应状态:', res.status)
                                       
                                       if (!res.ok) {
                                         console.error('下载API错误:', res.status, res.statusText)
                                         throw new Error(`下载失败: ${res.status}`)
                                       }
                                       
                                       const data = await res.json()
                                       console.log('下载API返回数据:', data)
                                       
                                       if (data.downloadUrl) {
                                         console.log('通过API获取到下载URL:', data.downloadUrl)
                                         
                                         // 使用fetch下载文件内容，然后创建blob URL进行下载
                                         try {
                                           console.log('开始下载文件内容...')
                                           const fileResponse = await fetch(data.downloadUrl)
                                           if (!fileResponse.ok) {
                                             throw new Error(`下载文件失败: ${fileResponse.status}`)
                                           }
                                           
                                           const blob = await fileResponse.blob()
                                           const blobUrl = URL.createObjectURL(blob)
                                           
                                           // 创建下载链接
                                           const link = document.createElement('a')
                                           link.href = blobUrl
                                           link.download = data.fileName || `processed-photo-${Date.now()}.jpg`
                                           document.body.appendChild(link)
                                           link.click()
                                           document.body.removeChild(link)
                                           
                                           // 清理blob URL
                                           setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                           
                                           console.log('文件下载完成')
                                         } catch (downloadError) {
                                           console.error('下载文件内容失败:', downloadError)
                                           // 如果fetch下载失败，回退到直接链接下载
                                           const link = document.createElement('a')
                                           link.href = data.downloadUrl
                                           link.download = data.fileName || `processed-photo-${Date.now()}.jpg`
                                           link.target = '_blank'
                                           link.rel = 'noopener noreferrer'
                                           document.body.appendChild(link)
                                           link.click()
                                           document.body.removeChild(link)
                                         }
                                       } else {
                                         throw new Error('下载URL未找到')
                                       }
                                     } catch (error) {
                                       console.error('下载过程中出错:', error)
                                       alert('下载失败，请重试')
                                     }
                                   }}
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
                                 <p className="text-sm text-gray-600 mb-2">
                                   {sessionStorage.getItem("email") || "ユーザー"} にダウンロードリンクをお送りしました。
                                 </p>
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
                                 <div className="text-lg font-mono font-bold text-orange-800">
                                   残り時間: 23:59:45
                                 </div>
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
                     ) : (
                       // Step 2: 处理完成但未支付
            <div className="space-y-6">
              {/* 调试信息 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs text-yellow-800">
                  <strong>调试信息:</strong> processedImageUrl = {String(processedImageUrl)}, 
                  isInitializing = {String(isInitializing)}, 
                  pendingProcessRecordId = {String(pendingProcessRecordId)}
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-emerald-600">
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    {processedImageUrl ? '処理完了' : '写真処理の準備完了'}
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

                    {/* Processed Image or Processing Status */}
                    <div className="text-center">
                      <h3 className="font-semibold mb-4">
                        {processedImageUrl ? '処理後の写真' : '処理状況'}
                      </h3>
                      <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50 relative">
                        {processedImageUrl ? (
                          watermarkedImageUrl && (
                            <Image
                              src={watermarkedImageUrl}
                              alt="処理後の写真"
                              width={250}
                              height={250}
                              className="mx-auto rounded object-cover"
                            />
                          )
                        ) : (
                          <div className="flex items-center justify-center h-[250px]">
                            <div className="text-center">
                              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                              <p className="text-emerald-700">AI処理の準備中...</p>
                              <p className="text-sm text-emerald-600 mt-2">メールアドレスを入力してください</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {processedImageUrl && (
                        <p className="text-sm text-gray-600 mt-2">※プレビューにはウォーターマークが表示されます</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">
                      {processedImageUrl ? '調整内容' : '次のステップ'}
                    </h4>
                    {processedImageUrl ? (
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
                    ) : (
                      <div className="text-sm text-emerald-700 space-y-1">
                        <p>• メールアドレスを入力（任意）</p>
                        <p>• AI処理を開始</p>
                        <p>• 写真の調整と最適化</p>
                        <p>• お支払いとダウンロード</p>
                      </div>
                    )}
                  </div>

                  {/* Email Dialog for Step 2 - AI处理前 */}
                  {showEmailDialog && !processedImageUrl && (
                    <div className="mt-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">メールアドレス（任意）</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            入力しなくても続行できます。入力すると決済用に自動入力されます。
                          </p>
                        </div>
                        <div className="space-y-4">
                          <Input
                            type="email"
                            placeholder="メールアドレスを入力（任意）"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => handleEmailDialogAction('cancel')}
                              className="flex-1"
                            >
                              入力せず続行
                            </Button>
                            <Button
                              onClick={() => handleEmailDialogAction('confirm')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              確認して続行
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Embedded Checkout inside main result card (Step 2) */}
                  {showCheckout && (
                    <div className="mt-6">
                      <h3 className="text-center font-semibold mb-3">お支払い</h3>
                      {checkoutInitLoading && (
                        <div className="text-center text-gray-600 mb-4">
                          <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                          決済を初期化しています...
                        </div>
                      )}
                      {checkoutError && (
                        <div className="text-center text-red-600 mb-4">{checkoutError}</div>
                      )}
                      {checkoutClientSecret && (
                        <CheckoutProvider
                          stripe={stripePromise}
                          options={{
                            fetchClientSecret: async () => checkoutClientSecret,
                            elementsOptions: { appearance: { theme: 'stripe' as const } }
                          }}
                        >
                          <CheckoutForm />
                        </CheckoutProvider>
                      )}
                    </div>
                  )}
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
