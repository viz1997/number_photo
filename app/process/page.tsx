"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowRight, CheckCircle, Download, Upload, X, AlertCircle, Mail, Clock, Star, ExternalLink } from "lucide-react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutProvider } from "@stripe/react-stripe-js"
import CheckoutForm from "@/components/payment/checkout/CheckoutForm"

import { getAccessibleR2FileUrl } from "@/lib/r2-client"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

function ProcessPageContent() {
  const [isProcessing, setIsProcessing] = useState(false)
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
  const autoAdvanceTriedRef = useRef(false)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [pendingProcessRecordId, setPendingProcessRecordId] = useState<string | null>(null)
  const triggerOnceRef = useRef(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isCreatingDownloadToken, setIsCreatingDownloadToken] = useState(false)

    useEffect(() => {
    const initializePage = async () => {
      // 检查是否从首页上传了文件
      const uploadedFileInfo = sessionStorage.getItem("uploadedFileInfo")
      const uploadInfoRaw = sessionStorage.getItem("uploadInfo")
      const photoRecordId = sessionStorage.getItem("photoRecordId")
      const processedImageUrlFromStorage = sessionStorage.getItem("processedImageUrl")
      
      if (uploadedFileInfo && uploadInfoRaw && photoRecordId) {
        console.log('检测到从首页上传的文件')
        
        // 设置原图URL
        try {
          const uploadInfo = JSON.parse(uploadInfoRaw)
          const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
          if (publicDomain && uploadInfo?.objectKey) {
            const r2Url = `${publicDomain}/${uploadInfo.objectKey}`
            setOriginalImageUrl(r2Url)
            console.log('设置原图URL:', r2Url)
          } else {
            console.warn('无法设置原图URL，缺少配置:', { publicDomain, objectKey: uploadInfo?.objectKey })
          }
        } catch (e) {
          console.warn('解析 uploadInfo 失败:', e)
        }
        
        // 设置虚拟的uploadedFile状态
        try {
          const fileInfo = JSON.parse(uploadedFileInfo)
          const virtualFile = new File([], fileInfo.name || 'uploaded-file.jpg', { type: fileInfo.type || 'image/jpeg' })
          setUploadedFile(virtualFile)
        } catch (e) {
          console.warn('创建虚拟File对象失败:', e)
        }
        
        // 检查是否已经有处理结果，但需要确保是当前这次上传的处理结果
        const currentPhotoRecordId = sessionStorage.getItem("photoRecordId")
        const storedPhotoRecordId = sessionStorage.getItem("processedPhotoRecordId") // 新增：存储处理结果对应的photoRecordId
        
        console.log('检查处理结果匹配:', {
          currentPhotoRecordId,
          storedPhotoRecordId,
          hasProcessedImageUrl: !!processedImageUrlFromStorage,
          isMatch: storedPhotoRecordId === currentPhotoRecordId
        })
        
        if (processedImageUrlFromStorage && storedPhotoRecordId === currentPhotoRecordId) {
          console.log('检测到当前上传文件的处理结果，恢复状态')
          setProcessedImageUrl(processedImageUrlFromStorage)
          setIsProcessing(false)
          setProgress(100)
          
          // 生成水印版本
          setTimeout(() => {
            generateWatermarkedImage(processedImageUrlFromStorage)
          }, 500)
          
          // 直接设置初始化完成，让后续的useEffect能够触发支付流程
          setIsInitializing(false)
          
          // 延迟一点时间后手动触发支付流程，确保useEffect能正确执行
          setTimeout(() => {
            console.log('手动触发支付流程检查')
            const isPaymentCompleted = sessionStorage.getItem("paymentCompleted")
            if (isPaymentCompleted !== "true") {
              console.log('未支付，手动调用initEmbeddedCheckout')
              initEmbeddedCheckout()
            }
          }, 100)
        } else {
          // 清除之前的所有处理结果，确保每次都是重新开始
          console.log('清除之前的处理结果，开始新的处理流程')
          sessionStorage.removeItem("processedImageUrl")
          sessionStorage.removeItem("processedPhotoRecordId")
          sessionStorage.removeItem("paymentCompleted")
          sessionStorage.removeItem("pendingDownloadFileKey")
          sessionStorage.removeItem("pendingRetry")
          // 清除邮箱状态，确保每次都显示邮箱弹窗
          sessionStorage.removeItem("email")
          
          // 重置所有状态，确保每次都是全新的开始
          setProcessedImageUrl(null)
          setWatermarkedImageUrl(null)
          setError(null)
          setShowCheckout(false)
          setCheckoutClientSecret(null)
          setCheckoutError(null)
          setDownloadToken(null)
          setIsCreatingDownloadToken(false)
          autoAdvanceTriedRef.current = false
          // 如果没有处理结果，开始新的AI处理流程
          console.log('没有检测到处理结果，开始新的AI处理流程')
          
          // 在开始AI处理之前，先显示邮箱弹窗
          if (!sessionStorage.getItem('email')) {
            console.log('显示邮箱弹窗，等待用户输入')
            setShowEmailDialog(true)
            console.log('showEmailDialog状态设置为true')
            // 设置pendingProcessRecordId，这样邮箱弹窗关闭后可以继续处理
            setPendingProcessRecordId(photoRecordId)
          } else {
            // 如果已有邮箱，直接开始AI处理
            console.log('已有邮箱，直接开始AI处理，photoRecordId:', photoRecordId)
            setIsProcessing(true)
            setProgress(0)
            await processImage(photoRecordId)
          }
        }
      } else {
        // 如果没有从首页上传的文件，重定向到首页
        console.log('没有检测到从首页上传的文件，重定向到首页')
        window.location.href = '/'
        return
      }
      
      setIsInitializing(false)
    }

    initializePage()
  }, [])



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
            // 如果已经有下载token，不需要再处理
            if (downloadToken) {
              console.log('已有下载token，跳过支付返回处理')
              return
            }
            
            // 立即设置支付完成标志，给用户即时反馈
            sessionStorage.setItem("paymentCompleted", "true")
            
            // 立即隐藏支付界面，显示成功状态
            setShowCheckout(false)
            setCheckoutClientSecret(null)
            
         
            setTimeout(() => {
         
              // 如果还没有下载token，保持加载状态
              if (!downloadToken) {
                setIsCreatingDownloadToken(true)
              }
            }, 3000)
            
            // 开始创建下载token的加载状态
            setIsCreatingDownloadToken(true)
            
            // 发送支付成功邮件
            const email = sessionStorage.getItem('email')
            if (email) {
              try {
                console.log('发送支付成功邮件:', { email, photoRecordId })
                const emailRes = await fetch('/api/payment/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email,
                    photoRecordId,
                    orderId: data?.session?.id,
                    amount: data?.session?.amount_total ? data.session.amount_total / 100 : undefined
                  })
                })
                
                if (emailRes.ok) {
                  const emailData = await emailRes.json()
                  console.log('邮件发送成功:', emailData)
                } else {
                  console.error('邮件发送失败:', emailRes.status)
                }
              } catch (emailError) {
                console.error('发送邮件时出错:', emailError)
              }
            }
            
            // 支付完成后创建下载 token，优化重试策略
            setIsCreatingDownloadToken(true)
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
                  setIsCreatingDownloadToken(false)
                  return true
                }
              }
              if (tokenRes.status === 403 && attempt < 5) {
                // 减少等待时间，增加重试次数
                await new Promise(r => setTimeout(r, 300))
                return tryCreateToken(attempt + 1)
              }
              return false
            }

            const ok = await tryCreateToken(1)
            if (ok) return
            
            // 如果重试后仍然失败，显示自动重试提示
            setError("支付已完成！系统正在准备下载链接，请稍等片刻...")
            setIsCreatingDownloadToken(false)
            // 存储重试信息，并设置自动重试
            sessionStorage.setItem('pendingRetry', JSON.stringify({ fileKey, photoRecordId }))
            
            // 5秒后自动重试一次
            setTimeout(async () => {
              try {
                setIsCreatingDownloadToken(true)
                const retryRes = await fetch('/api/download/create-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileKey, photoRecordId })
                })
                if (retryRes.ok) {
                  const retryData = await retryRes.json()
                  if (retryData?.success && retryData?.token) {
                    sessionStorage.removeItem('pendingRetry')
                    setError(null)
                    setDownloadToken(retryData.token)
                    setIsCreatingDownloadToken(false)
                    return
                  }
                }
                // 如果自动重试也失败，显示手动重试选项
                setError("支付已完成，但系统需要一点时间来更新状态。请点击重试按钮。")
                setIsCreatingDownloadToken(false)
              } catch (retryError) {
                setError("支付已完成，但系统需要一点时间来更新状态。请点击重试按钮。")
                setIsCreatingDownloadToken(false)
              }
            }, 5000)
          } else {
            // 如果没有获取到必要信息，显示错误
            setError("支付完成但缺少必要信息，请联系客服")
          }
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

  // Listen to payment-completed event from embedded checkout and try to create download token immediately
  useEffect(() => {
    const handler = async () => {
      try {
        console.log('收到支付完成事件，立即处理...')
        const fileKey = sessionStorage.getItem('pendingDownloadFileKey') || undefined
        const photoRecordId = sessionStorage.getItem('photoRecordId') || undefined
        if (!fileKey || !photoRecordId) return
        
        // 如果已经有下载token，不需要再处理
        if (downloadToken) {
          console.log('已有下载token，跳过处理')
          return
        }
        
        // 立即设置支付完成状态
        sessionStorage.setItem('paymentCompleted', 'true')
        setShowCheckout(false)
        setCheckoutClientSecret(null)
        
        // 显示支付成功提示
 
        setTimeout(() => {
        
          // 如果还没有下载token，保持加载状态
          if (!downloadToken) {
            setIsCreatingDownloadToken(true)
          }
        }, 3000)
        
        // 开始创建下载token的加载状态
        setIsCreatingDownloadToken(true)
        
        // 发送支付成功邮件
        const email = sessionStorage.getItem('email')
        if (email) {
          try {
            console.log('支付完成事件 - 发送邮件:', { email, photoRecordId })
            const emailRes = await fetch('/api/payment/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                photoRecordId,
                downloadUrl: window.location.href
              })
            })
            
            if (emailRes.ok) {
              const emailData = await emailRes.json()
              console.log('支付完成事件 - 邮件发送成功:', emailData)
            } else {
              console.error('支付完成事件 - 邮件发送失败:', emailRes.status)
            }
          } catch (emailError) {
            console.error('支付完成事件 - 发送邮件时出错:', emailError)
          }
        }
        
        // 立即尝试创建下载token
        setIsCreatingDownloadToken(true)
        const tokenRes = await fetch('/api/download/create-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey, photoRecordId })
        })
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json()
          if (tokenData?.success && tokenData?.token) {
            console.log('支付完成事件处理成功，设置下载token')
            setDownloadToken(tokenData.token)
            setIsCreatingDownloadToken(false)
            return
          }
        }
        
                 // 如果立即创建失败，显示准备中的提示
         if (tokenRes.status === 403) {
           setError("支付已完成！系统正在准备下载链接，请稍等片刻...")
           setIsCreatingDownloadToken(false)
          // 3秒后自动重试
          setTimeout(async () => {
            try {
              setIsCreatingDownloadToken(true)
              const retryRes = await fetch('/api/download/create-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileKey, photoRecordId })
              })
              if (retryRes.ok) {
                const retryData = await retryRes.json()
                if (retryData?.success && retryData?.token) {
                  setError(null)
                  setDownloadToken(retryData.token)
                  setIsCreatingDownloadToken(false)
                }
              }
            } catch {}
          }, 3000)
        }
      } catch (error) {
        console.error('处理支付完成事件时出错:', error)
      }
    }
    window.addEventListener('payment-completed', handler)
    return () => window.removeEventListener('payment-completed', handler)
  }, [])

  // If a download token is obtained, clear any previous error and hide checkout
  useEffect(() => {
    if (downloadToken) {
      setError(null)
      setShowCheckout(false)
    }
  }, [downloadToken])



  // 调试：监控processedImageUrl状态变化
  useEffect(() => {
    console.log('processedImageUrl状态变化:', {
      processedImageUrl,
      isInitializing,
      photoRecordId: sessionStorage.getItem('photoRecordId')
    })
  }, [processedImageUrl, isInitializing])

  // 调试：监控下载token创建状态
  useEffect(() => {
    console.log('下载token创建状态变化:', {
      isCreatingDownloadToken,
      downloadToken: !!downloadToken,
    })
  }, [isCreatingDownloadToken, downloadToken])

  // 调试：监控showEmailDialog状态变化
  useEffect(() => {
    console.log('showEmailDialog状态变化:', showEmailDialog)
  }, [showEmailDialog])

  // 清理函数：组件卸载时重置加载状态
  useEffect(() => {
    return () => {
      setIsCreatingDownloadToken(false)
    }
  }, [])

  useEffect(() => {
    // 当处理完成时，自动判断应进入步骤二还是步骤三：
    // - 若已支付（服务器允许创建下载 token），直接跳到下载页（步骤三）
    // - 若未支付（403），展示结账（步骤二）
    console.log('支付流程useEffect触发:', {
      processedImageUrl: !!processedImageUrl,
      showCheckout,
      checkoutClientSecret: !!checkoutClientSecret,
      autoAdvanceTried: autoAdvanceTriedRef.current,
      isInitializing
    })
    
    if (!processedImageUrl) return
    if (showCheckout || checkoutClientSecret) return
    if (autoAdvanceTriedRef.current) return
    if (isInitializing) return

    const isPaymentCompleted = sessionStorage.getItem("paymentCompleted")
    console.log('支付状态检查:', { isPaymentCompleted })

    // 如果已经支付完成，直接尝试创建下载token
    if (isPaymentCompleted === "true") {
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
          setIsCreatingDownloadToken(true)
          const tokenRes = await fetch('/api/download/create-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileKey, photoRecordId })
          })
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json()
            if (tokenData?.success && tokenData?.token) {
              setDownloadToken(tokenData.token)
              setIsCreatingDownloadToken(false)
              return
            }
          }
          if (tokenRes.status === 403) {
            // 支付状态不一致，清理标记并展示结账
            sessionStorage.removeItem('paymentCompleted')
            setIsCreatingDownloadToken(false)
            await initEmbeddedCheckout()
          }
        } catch {
          // 忽略网络错误，停留在当前页面
          setIsCreatingDownloadToken(false)
        }
      }

      attempt()
    } else {
      // 未支付，直接显示支付界面
      autoAdvanceTriedRef.current = true
      initEmbeddedCheckout()
    }
  }, [processedImageUrl, showCheckout, checkoutClientSecret, isInitializing])











  // 处理邮箱弹窗的函数
  const handleEmailDialogAction = (action: 'confirm' | 'cancel' | 'close') => {
    console.log('=== handleEmailDialogAction 开始 ===', { action })
    
    const email = emailInput.trim()
    if (email) {
      sessionStorage.setItem('email', email)
    }
    setShowEmailDialog(false)
    
    // 如果pendingProcessRecordId存在，说明需要继续AI处理
    if (pendingProcessRecordId && !processedImageUrl) {
      console.log('邮箱弹窗关闭，继续AI处理，photoRecordId:', pendingProcessRecordId)
      // 清除pendingProcessRecordId，因为AI处理即将开始
      setPendingProcessRecordId(null)
      // 开始AI处理
      processImage(pendingProcessRecordId)
    }
    
    console.log('=== handleEmailDialogAction 结束 ===')
  }



  const processImage = async (photoRecordId: string) => {
    console.log('=== processImage 开始 ===')
    console.log('处理记录 ID:', photoRecordId)
    
    // 设置处理状态
    setIsProcessing(true)
    setProgress(0)
    
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
         
         // 保存处理后的图片URL和对应的photoRecordId到 sessionStorage，避免重复处理
         sessionStorage.setItem("processedImageUrl", data.outputImageUrl)
         sessionStorage.setItem("processedPhotoRecordId", photoRecordId)
         // 标记初始化完成，以便触发展示 Stripe 或下载的后续逻辑
         setIsInitializing(false)
        
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
      // 防止初始化标志阻塞后续 useEffect
      setIsInitializing(false)
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
       
       // Watermark text - draw three labels along diagonal
       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
       ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
       ctx.lineWidth = 2
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
         // 先绘制黑色描边，再绘制白色文字，确保在任何背景下都清晰可见
         ctx.strokeText('Preview', 0, 0)
         ctx.fillText('Preview', 0, 0)
         ctx.restore()
       }
      
      ctx.restore()
      
      // Convert to data URL with JPEG format
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
         // 检查URL是否有效
         if (accessibleUrl && !accessibleUrl.includes('undefined')) {
           img.src = accessibleUrl
         } else {
           console.warn('Invalid accessible URL, using original:', accessibleUrl)
           img.src = imageUrl
         }
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
      // 记录本次会话是否在创建 Checkout Session 时就携带了 email
      try {
        if (email) {
          sessionStorage.setItem('emailProvidedAtCheckoutSession', 'true')
        } else {
          sessionStorage.removeItem('emailProvidedAtCheckoutSession')
        }
      } catch {}
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
      console.log('=== initEmbeddedCheckout 结束 ===')
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
          link.download = wmData.fileName || `my-number-photo-preview-${Date.now()}.jpg`
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
    
    // 如果有错误，确保加载状态被重置
    if (isCreatingDownloadToken) {
      setIsCreatingDownloadToken(false)
    }
    
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
                       setError("正在准备下载链接，请稍等...")
                       setIsCreatingDownloadToken(true)
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
                           setError(null)
                           setDownloadToken(tokenData.token)
                           setIsCreatingDownloadToken(false)
                           return
                         }
                       }
                       
                       // If still getting 403, show the error again
                       if (tokenRes.status === 403) {
                         setError("支付已完成！系统正在准备下载链接，请稍等片刻后再次点击重试。")
                       } else {
                         setError("下载链接创建失败，请重试。")
                       }
                       setIsCreatingDownloadToken(false)
                     } catch (retryError) {
                       setError("重试过程中出现错误，请重试。")
                       setIsCreatingDownloadToken(false)
                     }
                   }} 
                   className="w-full bg-emerald-600 hover:bg-emerald-700"
                 >
                   重试下载
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
             <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                 <Image
                   src="/favicon-32x32.png"
                   alt="Logo"
                   width={32}
                   height={32}
                   className="rounded"
                 />
                 <h1 className="text-xl font-bold text-gray-900">マイナンバーカード写真</h1>
               </div>
               <Button
                 variant="outline"
                 onClick={() => window.location.href = '/'}
                 className="text-gray-600 hover:text-gray-900"
               >
                 ホーム
               </Button>
             </div>
             <div className="flex items-center space-x-2">
               {/* 右侧可以放置其他元素，目前为空 */}
             </div>
           </div>
         </div>
       </header>

             <div className="container mx-auto px-4 py-8">
         <div className="max-w-4xl mx-auto">
        
           
           {/* Unified Progress Steps (2 steps) */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Step 1: 処理・支払い */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isProcessing ? 'bg-emerald-600 text-white' : processedImageUrl ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : processedImageUrl ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className={`ml-2 font-semibold ${processedImageUrl ? 'text-emerald-600' : isProcessing ? 'text-emerald-600' : 'text-gray-500'}`}>AI処理</span>
              </div>

              <div className={`w-8 h-px ${downloadToken ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>

              {/* Step 2: ダウンロード */}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  downloadToken ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {downloadToken ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className={`ml-2 font-semibold ${downloadToken ? 'text-emerald-600' : 'text-gray-500'}`}>支払い・ダウンロード</span>
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
                      <span>処理中...</span>
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
                                            link.download = `my-number-photo-${Date.now()}.jpeg`
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
                                            link.download = `my-number-photo-${Date.now()}.jpeg`
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
                                            link.download = (data.fileName ? data.fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.jpeg') : `my-number-photo-${Date.now()}.jpeg`)
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
                                            link.download = (data.fileName ? data.fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.jpeg') : `my-number-photo-${Date.now()}.jpeg`)
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
                                   <p>• サイズ: 3.5cm × 4.5cm</p>
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
                     ) : processedImageUrl ? (
                       // Step 2: 处理完成但未支付
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
                      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 h-80 flex flex-col justify-center">
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
                      <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50 relative h-80 flex flex-col justify-center">
                        {watermarkedImageUrl && (
                          <Image
                            src={watermarkedImageUrl}
                            alt="処理後の写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        )}
                        <p className="text-sm text-gray-600 mt-2">※プレビューにはウォーターマークが表示されます</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">調整内容</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-700">
                      <div>
                        <p>• 背景: 無地白色に調整</p>
                        <p>• サイズ: 3.5cm × 4.5cm (規格準拠)</p>
                      </div>
                      <div>
                        <p>• 解像度: 300dpi (高画質)</p>
                        <p>• ファイル形式: JPEG</p>
                      </div>
                    </div>
                  </div>

                  {/* オンライン申請方法 */}
                  <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">マイナンバーカード オンライン申請方法</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Step 1 */}
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">1</span>
                            </div>
                          </div>
                        </div>
                        <h5 className="font-semibold text-sm mb-2 text-gray-900">メールアドレス登録</h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-xl">📧</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">オンライン申請サイトにアクセス</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• 申請書ID（23桁）</p>
                            <p>• メール連絡用氏名</p>
                            <p>• メールアドレス</p>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">2</span>
                            </div>
                          </div>
                        </div>
                        <h5 className="font-semibold text-sm mb-2 text-gray-900">顔写真登録</h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-xl">📷</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">申請者専用WEBサイトで写真登録</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• 顔写真登録</p>
                            <p>• 顔写真登録確認</p>
                            <p>• スマホ撮影も可能</p>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">3</span>
                            </div>
                          </div>
                        </div>
                        <h5 className="font-semibold text-sm mb-2 text-gray-900">申請情報登録</h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-xl">📝</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">その他申請に必要な情報を入力</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• 生年月日（必須）</p>
                            <p>• 電子証明書発行希望</p>
                            <p>• 氏名の点字表記希望</p>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="text-center">
                        <div className="mb-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
                            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">4</span>
                            </div>
                          </div>
                        </div>
                        <h5 className="font-semibold text-sm mb-2 text-gray-900">申請完了</h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-2">
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-xl">✅</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">必要事項を入力して送信</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>• 申請完了メール受信</p>
                            <p>• 申請状況確認可能</p>
                            <p>• 交付準備完了</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* オンライン申請リンク */}
                    <div className="text-center">
                      <a 
                        href="https://net.kojinbango-card.go.jp/SS_SERVICE_OUT/FA01S001Action.do" 
                        target="_blank" 
                        rel="nofollow noopener noreferrer"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 underline text-sm"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        オンライン申請サイトへ
                      </a>
                    </div>
                  </div>

                  {/* 価格表示 */}
                  <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <span className="text-gray-600 text-lg">今だけ</span>
                      <span className="text-3xl font-bold text-emerald-600">799円</span>
                      <span className="text-xl text-red-500 line-through">1499円</span>
                    </div>
                    <p className="text-sm text-gray-500">高画質・規格準拠のマイナンバーカード写真</p>
                  </div>

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
                      ) : null
          }
        </div>
      </div>
      
      {/* Email Dialog as modal over step 2 processing background */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => { if (!open) handleEmailDialogAction('close') }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>写真受信用メールアドレスを入力してください</DialogTitle>
            <DialogDescription>メールアドレスを入力すると、処理後のマイナンバーカードの写真をお送りします。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="メールアドレスを入力してください..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleEmailDialogAction('cancel')}>キャンセル</Button>
            <Button onClick={() => handleEmailDialogAction('confirm')} className="bg-emerald-600 hover:bg-emerald-700 text-white">送信</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for watermark generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Loading Overlay for Download Token Creation */}
      {isCreatingDownloadToken && !downloadToken && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative mb-6">
              <Loader2 className="w-20 h-20 text-emerald-600 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ダウンロード準備中</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              支払い完了後、ダウンロードリンクを作成しています。<br />
              しばらくお待ちください...
            </p>
            <div className="space-y-4">
              <div className="w-64 bg-gray-200 rounded-full h-4 overflow-hidden mx-auto">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ProcessPageContent />
    </Suspense>
  )
}
