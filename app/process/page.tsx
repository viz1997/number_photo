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
  const [processedImageKey, setProcessedImageKey] = useState<string | null>(null) // 存储R2 key用于下载
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null) // 存储预览图URL（水印版本）
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
    console.log('=== useEffect 开始执行 ===')
    const initializePage = async () => {
      // 检查是否从首页上传了文件
      const uploadedFileInfo = sessionStorage.getItem("uploadedFileInfo")
      const uploadInfoRaw = sessionStorage.getItem("uploadInfo")
      const photoRecordId = sessionStorage.getItem("photoRecordId")
      const processedImageUrlFromStorage = sessionStorage.getItem("processedImageUrl")
      
      console.log('useEffect 检查到的数据:', {
        uploadedFileInfo: !!uploadedFileInfo,
        uploadInfoRaw: !!uploadInfoRaw,
        photoRecordId: !!photoRecordId,
        processedImageUrlFromStorage: !!processedImageUrlFromStorage
      })
      
      if (uploadedFileInfo && uploadInfoRaw && photoRecordId) {
        console.log('检测到从首页上传的文件')
        
        // 设置原图URL - 使用私有桶的预签名URL
        try {
          const uploadInfo = JSON.parse(uploadInfoRaw)
          console.log('解析的uploadInfo:', uploadInfo)
          
          if (uploadInfo?.objectKey) {
            console.log('开始设置原图URL，objectKey:', uploadInfo.objectKey)
            
            // 使用私有桶的预签名URL，避免CORS问题
            try {
              const encodedFileKey = encodeURIComponent(uploadInfo.objectKey)
              console.log('编码后的fileKey:', encodedFileKey)
              
              const originalImageRes = await fetch(`/api/original-image/${encodedFileKey}`)
              console.log('API响应状态:', originalImageRes.status)
              
              if (originalImageRes.ok) {
                const originalImageData = await originalImageRes.json()
                console.log('API返回数据:', originalImageData)
                
                if (originalImageData?.success && originalImageData?.imageUrl) {
                  setOriginalImageUrl(originalImageData.imageUrl)
                  console.log('✅ 设置原图预签名URL成功:', originalImageData.imageUrl)
          } else {
                  console.warn('API返回数据格式不正确:', originalImageData)
                }
              } else {
                const errorText = await originalImageRes.text()
                console.warn('获取原图URL失败:', originalImageRes.status, errorText)
              }
            } catch (presignedError) {
              console.error('生成原图预签名URL失败:', presignedError)
            }
          } else {
            console.warn('无法获取原图信息:', { objectKey: uploadInfo?.objectKey })
          }
        } catch (e) {
          console.error('解析 uploadInfo 失败:', e)
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
        
        console.log('条件判断详情:', {
          processedImageUrlFromStorage: processedImageUrlFromStorage,
          storedPhotoRecordId: storedPhotoRecordId,
          currentPhotoRecordId: currentPhotoRecordId,
          condition1: !!processedImageUrlFromStorage,
          condition2: storedPhotoRecordId === currentPhotoRecordId,
          finalCondition: !!(processedImageUrlFromStorage && storedPhotoRecordId === currentPhotoRecordId)
        })
        
        if (processedImageUrlFromStorage && storedPhotoRecordId === currentPhotoRecordId) {
          console.log('✅ 进入IF分支：检测到当前上传文件的处理结果，恢复状态')
          setProcessedImageUrl(processedImageUrlFromStorage)
          setIsProcessing(false)
          setProgress(100)
          
          // 尝试恢复预览图URL（水印版本）
          const previewImageUrlFromStorage = sessionStorage.getItem("previewImageUrl")
          if (previewImageUrlFromStorage) {
            console.log('✅ 恢复预览图URL（水印版本）:', previewImageUrlFromStorage)
            setPreviewImageUrl(previewImageUrlFromStorage)
            setWatermarkedImageUrl(previewImageUrlFromStorage)
          } else {
            // 如果没有预览图，使用AI处理后的图片作为备选
            console.log('⚠️ 没有预览图，使用AI处理后的图片作为备选')
            setWatermarkedImageUrl(processedImageUrlFromStorage)
          }
          
          // 恢复processedImageKey
          const processedImageKeyFromStorage = sessionStorage.getItem("processedImageKey")
          if (processedImageKeyFromStorage) {
            console.log('✅ 恢复processedImageKey:', processedImageKeyFromStorage)
            setProcessedImageKey(processedImageKeyFromStorage)
          }
          
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
          console.log('✅ 进入ELSE分支：清除之前的处理结果，开始新的处理流程')
          console.log('准备设置邮箱弹窗状态...')
          
          sessionStorage.removeItem("processedImageUrl")
          sessionStorage.removeItem("processedPhotoRecordId")
          sessionStorage.removeItem("processedImageKey")
          sessionStorage.removeItem("paymentCompleted")
          sessionStorage.removeItem("pendingDownloadFileKey")
          sessionStorage.removeItem("pendingRetry")
          // 清除邮箱状态，确保每次都显示邮箱弹窗
          sessionStorage.removeItem("email")
          
          // 重置所有状态，确保每次都是全新的开始
          setProcessedImageUrl(null)
          setProcessedImageKey(null)
          setWatermarkedImageUrl(null)
          setError(null)
          setShowCheckout(false)
          setCheckoutClientSecret(null)
          setCheckoutError(null)
          setDownloadToken(null)
          setIsCreatingDownloadToken(false)
          autoAdvanceTriedRef.current = false
          
          // 按照原来的流程：上传成功后直接显示邮箱弹窗，然后开始AI处理
          console.log('=== 开始设置邮箱弹窗 ===')
          console.log('设置前 showEmailDialog:', showEmailDialog)
            setShowEmailDialog(true)
          console.log('✅ showEmailDialog状态设置为true')
          
            // 设置pendingProcessRecordId，这样邮箱弹窗关闭后可以继续处理
            setPendingProcessRecordId(photoRecordId)
          console.log('✅ pendingProcessRecordId设置为:', photoRecordId)
          
          // 设置初始化完成
          setIsInitializing(false)
          console.log('✅ isInitializing设置为false')
          
          // 延迟检查状态，确保设置成功
          setTimeout(() => {
            console.log('延迟检查 - 当前状态:', {
              showEmailDialog: true, // 直接使用设置的值
              isInitializing: false,
              pendingProcessRecordId: photoRecordId
            })
            console.log('延迟检查 - 实际状态:', {
              showEmailDialog: showEmailDialog,
              isInitializing: isInitializing,
              pendingProcessRecordId: pendingProcessRecordId
            })
          }, 100)
          
          console.log('=== 邮箱弹窗设置完成 ===')
        }
      } else {
        // 如果没有从首页上传的文件，重定向到首页
        console.log('没有检测到从首页上传的文件，重定向到首页')
        window.location.href = '/'
        return
      }
    }

    console.log('=== 准备调用 initializePage ===')
    initializePage()
    console.log('=== useEffect 执行完成 ===')
  }, [])



  // 新增：检查支付状态并创建下载token的函数
  const checkPaymentStatusAndCreateToken = async (photoRecordId: string) => {
    try {
      console.log('检查支付状态并尝试创建下载token...')
      
      const tokenRes = await fetch('/api/download/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoRecordId })
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
                      const photoRecordId = sessionStorage.getItem("photoRecordId")
            if (photoRecordId) {
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
            
            // 获取fileKey用于下载
            console.log('🔍 获取fileKey - processedImageKey:', processedImageKey)
            console.log('🔍 获取fileKey - processedImageUrl:', processedImageUrl)
            
            // 从sessionStorage恢复processedImageKey
            const processedImageKeyFromStorage = sessionStorage.getItem("processedImageKey")
            if (processedImageKeyFromStorage && !processedImageKey) {
              console.log('🔍 从sessionStorage恢复processedImageKey:', processedImageKeyFromStorage)
              setProcessedImageKey(processedImageKeyFromStorage)
            }
            
            let fileKey = processedImageKey || processedImageKeyFromStorage
            if (!fileKey) {
              console.log('⚠️ processedImageKey为空，尝试从URL解析')
              // 如果没有保存的key，从URL解析
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
              if (processedImageUrl) {
                fileKey = resolveFileKey(processedImageUrl)
                console.log('🔍 从URL解析的fileKey:', fileKey)
              } else {
                console.log('❌ processedImageUrl也为空')
              }
            }
            
            console.log('🔍 最终fileKey:', fileKey)
            
            const tryCreateToken = async (attempt = 1): Promise<boolean> => {
              if (!fileKey) {
                console.error('fileKey is null, cannot create download token')
                return false
              }
              
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
            if (fileKey) {
              sessionStorage.setItem('pendingRetry', JSON.stringify({ fileKey, photoRecordId }))
            } else {
            sessionStorage.setItem('pendingRetry', JSON.stringify({ photoRecordId }))
            }
            
            // 5秒后自动重试一次
            setTimeout(async () => {
              try {
                setIsCreatingDownloadToken(true)
                // 在setTimeout中重新获取fileKey，因为闭包中的fileKey可能为null
                let retryFileKey = processedImageKey
                if (!retryFileKey) {
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
                  if (processedImageUrl) {
                    if (processedImageUrl) {
                    retryFileKey = resolveFileKey(processedImageUrl)
                  }
                  }
                }
                
                if (!retryFileKey) {
                  console.error('fileKey is null in retry, cannot create download token')
                  return
                }
                
                const retryRes = await fetch('/api/download/create-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ fileKey: retryFileKey, photoRecordId })
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
        const photoRecordId = sessionStorage.getItem('photoRecordId') || undefined
        if (!photoRecordId) return
        
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
        
        // 获取fileKey用于下载
        let fileKey = processedImageKey
        if (!fileKey) {
          // 如果没有保存的key，从URL解析
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
          if (processedImageUrl) {
            fileKey = resolveFileKey(processedImageUrl)
          }
        }
        
        if (!fileKey) {
          console.error('fileKey is null, cannot create download token')
          return
        }
        
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
              
              // 在setTimeout中重新获取fileKey
              let retryFileKey = processedImageKey
              if (!retryFileKey) {
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
                if (processedImageUrl) {
                  retryFileKey = resolveFileKey(processedImageUrl)
                }
              }
              
              if (!retryFileKey) {
                console.error('fileKey is null in retry, cannot create download token')
                return
              }
              
              const retryRes = await fetch('/api/download/create-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileKey: retryFileKey, photoRecordId })
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

  // 调试：监控originalImageUrl状态变化
  useEffect(() => {
    console.log('originalImageUrl状态变化:', {
      originalImageUrl,
      hasValue: !!originalImageUrl
    })
  }, [originalImageUrl])

  // 调试：监控下载token创建状态
  useEffect(() => {
    console.log('下载token创建状态变化:', {
      isCreatingDownloadToken,
      downloadToken: !!downloadToken,
      downloadTokenValue: downloadToken,
    })
  }, [isCreatingDownloadToken, downloadToken])

  // 调试：监控showEmailDialog状态变化
  useEffect(() => {
    console.log('showEmailDialog状态变化:', showEmailDialog)
  }, [showEmailDialog])

  // 调试：监控支付状态变化
  useEffect(() => {
    console.log('支付状态变化:', {
      showCheckout,
      checkoutInitLoading,
      checkoutClientSecret: !!checkoutClientSecret,
      checkoutError
    })
  }, [showCheckout, checkoutInitLoading, checkoutClientSecret, checkoutError])

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
    console.log('🔥 支付流程useEffect触发:', {
      processedImageUrl: !!processedImageUrl,
      processedImageUrlValue: processedImageUrl,
      showCheckout,
      checkoutClientSecret: !!checkoutClientSecret,
      autoAdvanceTried: autoAdvanceTriedRef.current,
      isInitializing
    })
    
    // 只有在有处理结果时才执行支付流程逻辑
    if (!processedImageUrl) {
      console.log('❌ 没有processedImageUrl，退出支付流程')
      return
    }
    if (isInitializing) {
      console.log('❌ isInitializing为true，退出支付流程')
      return
    }
    
    // 如果已经有clientSecret，说明支付界面已经初始化完成，不需要再处理
    if (checkoutClientSecret) return
    
    // 如果showCheckout为true但还没有clientSecret，说明正在初始化中，等待完成
    if (showCheckout && !checkoutClientSecret) return
    
    // 如果已经尝试过但失败了，允许重试
    if (autoAdvanceTriedRef.current && !showCheckout) return

    const isPaymentCompleted = sessionStorage.getItem("paymentCompleted")
    console.log('支付状态检查:', { isPaymentCompleted })

    // 如果已经支付完成，直接尝试创建下载token
    if (isPaymentCompleted === "true") {
      const attempt = async () => {
        autoAdvanceTriedRef.current = true
        // 优先使用保存的R2 key
        let fileKey = processedImageKey
        if (!fileKey) {
          // 如果没有保存的key，从URL解析
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
          fileKey = resolveFileKey(processedImageUrl)
        }
        
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
    if (pendingProcessRecordId) {
      console.log('邮箱弹窗关闭，开始AI处理，photoRecordId:', pendingProcessRecordId)
      // 清除pendingProcessRecordId，因为AI处理即将开始
      setPendingProcessRecordId(null)
      // 开始AI处理
      setIsProcessing(true)
      setProgress(0)
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
         
                           // 保存R2 key用于后续下载
                  if (data.outputImageKey) {
                    setProcessedImageKey(data.outputImageKey)
                    sessionStorage.setItem("processedImageKey", data.outputImageKey)
                    console.log('保存R2 key用于下载:', data.outputImageKey)
                  }
                  
                  // 保存预览图URL（水印版本）
                  if (data.previewImageUrl) {
                    setPreviewImageUrl(data.previewImageUrl)
                    console.log('保存预览图URL（水印版本）:', data.previewImageUrl)
                  }
         
         // 保存处理后的图片URL和对应的photoRecordId到 sessionStorage，避免重复处理
         sessionStorage.setItem("processedImageUrl", data.outputImageUrl)
         sessionStorage.setItem("processedPhotoRecordId", photoRecordId)
                  
                  // 保存预览图URL到sessionStorage
                  if (data.previewImageUrl) {
                    sessionStorage.setItem("previewImageUrl", data.previewImageUrl)
                  }
         // 标记初始化完成，以便触发展示 Stripe 或下载的后续逻辑
         setIsInitializing(false)
        
                 // 设置水印版本为预览图URL，确保未支付用户看到的是水印版本
                 if (data.previewImageUrl) {
                   console.log('✅ 设置水印预览图:', data.previewImageUrl)
                   setWatermarkedImageUrl(data.previewImageUrl)
                 } else {
                   // 如果没有预览图，使用AI处理后的图片作为备选
                   console.log('⚠️ 没有预览图，使用AI处理后的图片作为备选')
                   setWatermarkedImageUrl(data.outputImageUrl)
                 }
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
    console.log('🎨 开始生成水印图片，使用URL:', imageUrl)
    
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
    
    // 使用传入的imageUrl（私有桶预签名URL）
    // 预签名URL已经包含了必要的CORS头信息
           img.src = imageUrl
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
      console.log('最终状态:', {
        showCheckout: true,
        checkoutInitLoading: false,
        checkoutClientSecret: !!checkoutClientSecret,
        checkoutError: null
      })
    }
  }

  const downloadImage = async () => {
    if (!processedImageUrl) return

    // 优先使用保存的R2 key，如果没有则从URL解析
    let fileKey = processedImageKey
    if (!fileKey) {
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
      fileKey = resolveFileKey(processedImageUrl)
    }

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
        // 直接调用下载API，让后端处理文件流
        const downloadRes = await fetch(`/api/download/${tokenData.token}?photoRecordId=${photoRecordId}`)
        if (downloadRes.ok) {
          // 获取文件内容
          const blob = await downloadRes.blob()
          console.log('获取到文件blob:', blob.size, 'bytes')
          
          // 创建下载链接
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = `processed-photo-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // 清理blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
          return
        }
      }

      // If failed with 403 (Payment required), show embedded checkout on this page
      if (tokenRes.status === 403) {
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
        // 直接调用水印下载API，让后端处理文件流
        const wmRes = await fetch(`/api/download/watermarked/${wmTokenData.token}?fileKey=${encodeURIComponent(fileKey)}`)
        if (wmRes.ok) {
          // 获取文件内容
          const blob = await wmRes.blob()
          console.log('获取到水印文件blob:', blob.size, 'bytes')
          
          // 创建下载链接
          const blobUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = `my-number-photo-preview-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // 清理blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
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
                       const { photoRecordId } = retryData
                       
                       // Try to create download token again
                       const tokenRes = await fetch('/api/download/create-token', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ photoRecordId })
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
                        alt="完成した写真（高画質版）"
                                    width={300}
                                    height={300}
                                    className="rounded object-cover"
                                  />
                                </div>
                    <p className="text-sm text-gray-600 mb-4">マイナンバーカード申請規格準拠・4:5比例・高画質JPEG（ウォーターマークなし）</p>

                    <Button
                      onClick={async () => {
                        try {
                          console.log('开始下载，token:', downloadToken)
                          
                          // 直接调用下载API，让后端处理文件流
                          const photoRecordId = sessionStorage.getItem('photoRecordId')
                          if (!photoRecordId) {
                            throw new Error('缺少照片记录ID')
                          }
                          
                          console.log('调用下载API...')
                          const res = await fetch(`/api/download/${downloadToken}?photoRecordId=${photoRecordId}`)
                          console.log('下载API响应状态:', res.status)
                          
                          if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}))
                            console.error('下载API错误:', res.status, errorData)
                            throw new Error(`下载失败: ${res.status} - ${errorData.error || res.statusText}`)
                          }
                          
                          // 获取文件内容
                          const blob = await res.blob()
                          console.log('获取到文件blob:', blob.size, 'bytes')
                          
                          // 创建下载链接
                          const blobUrl = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = blobUrl
                          link.download = `my-number-photo-${Date.now()}.jpeg`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          
                          // 清理blob URL
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                          
                          console.log('文件下载完成')
                        } catch (error) {
                          console.error('下载失败:', error)
                          alert('下载失败，请重试')
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="lg"
                    >
                      高画質写真をダウンロード
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : processedImageUrl ? (
            // Step 2: 处理完成，显示支付界面
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-emerald-600">
                  <CheckCircle className="w-6 h-6 inline mr-2" />
                  処理完了
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="font-semibold mb-4">処理結果</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 原图 */}
                    <div>
                      <h4 className="font-semibold mb-4">元の写真</h4>
                      <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                        {originalImageUrl ? (
                          <Image
                            src={originalImageUrl}
                            alt="元の写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        ) : (
                          <div className="w-[250px] h-[250px] mx-auto bg-gray-100 rounded flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Upload className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">アップロード済み</p>
                              <p className="text-xs">（セキュリティのため非表示）</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 处理后图片 */}
                    <div>
                      <h4 className="font-semibold mb-4">処理後の写真</h4>
                      <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
                        {watermarkedImageUrl ? (
                          <Image
                            src={watermarkedImageUrl}
                            alt="処理後の写真（プレビュー）"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        ) : (
                          <div className="w-[250px] h-[250px] mx-auto bg-gray-100 rounded flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
                              <p className="text-sm">処理中...</p>
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-2">※プレビューにはウォーターマークが表示されます</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">処理内容</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 背景を無地に調整</li>
                    <li>• サイズを規格に合わせて調整</li>
                    <li>• 明度・コントラストの最適化</li>
                    <li>• ファイル形式の最適化</li>
                  </ul>
                </div>

                {/* 支付界面会自动显示，不需要按钮 */}
                
                {/* Embedded Checkout inside main result card (Step 2) */}
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
                  
                  {/* 如果没有显示支付界面，显示提示 */}
                  {!checkoutClientSecret && !checkoutInitLoading && !checkoutError && (
                    <div className="text-center text-gray-600 mb-4">
                      <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                      決済を準備中...
                    </div>
                  )}
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
                                    alt="完成した写真（高画質版）"
                                    width={300}
                                    height={300}
                                    className="rounded object-cover"
                                  />
                                </div>
                               <p className="text-sm text-gray-600 mb-4">マイナンバーカード申請規格準拠・4:5比例・高画質JPEG（ウォーターマークなし）</p>

                                                               <Button
                                                                     onClick={async () => {
                                     try {
                                       console.log('开始下载，token:', downloadToken)
                                       
                                       // 直接调用下载API，让后端处理文件流
                                       const photoRecordId = sessionStorage.getItem('photoRecordId')
                                       if (!photoRecordId) {
                                         throw new Error('缺少照片记录ID')
                                       }
                                       
                                       console.log('调用下载API...')
                                       const res = await fetch(`/api/download/${downloadToken}?photoRecordId=${photoRecordId}`)
                                       console.log('下载API响应状态:', res.status)
                                       
                                       if (!res.ok) {
                                         const errorData = await res.json().catch(() => ({}))
                                         console.error('下载API错误:', res.status, errorData)
                                         throw new Error(`下载失败: ${res.status} - ${errorData.error || res.statusText}`)
                                       }
                                       
                                       // 获取文件内容
                                       const blob = await res.blob()
                                       console.log('获取到文件blob:', blob.size, 'bytes')
                                       
                                       // 创建下载链接
                                       const blobUrl = URL.createObjectURL(blob)
                                       const link = document.createElement('a')
                                       link.href = blobUrl
                                       link.download = `my-number-photo-${Date.now()}.jpeg`
                                       document.body.appendChild(link)
                                       link.click()
                                       document.body.removeChild(link)
                                       
                                       // 清理blob URL
                                       setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                       
                                       console.log('文件下载完成')
                                     } catch (error) {
                                       console.error('下载失败:', error)
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
                        {originalImageUrl ? (
                          <Image
                            src={originalImageUrl}
                            alt="元の写真"
                            width={250}
                            height={250}
                            className="mx-auto rounded object-cover"
                          />
                        ) : (
                          <div className="w-[250px] h-[250px] mx-auto bg-gray-100 rounded flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Upload className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">アップロード済み</p>
                              <p className="text-xs">（セキュリティのため非表示）</p>
                            </div>
                          </div>
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
