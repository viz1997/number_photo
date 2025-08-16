import { NextRequest, NextResponse } from "next/server"
import { getPhotoRecord } from "@/lib/supabase"
import { getR2Object } from "@/lib/r2-client"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: "Download token is required" }, { status: 400 })
    }

    // 解析我们的token格式: dl_{secureId}_{timestamp}
    if (!token.startsWith('dl_')) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 })
    }

    const tokenParts = token.split('_')
    if (tokenParts.length !== 3) {
      return NextResponse.json({ error: "Invalid token structure" }, { status: 400 })
    }

    const [, secureId, timestamp] = tokenParts
    
    // 验证timestamp是否在合理范围内（24小时内）
    const tokenTime = parseInt(timestamp, 36)
    const currentTime = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时
    
    if (currentTime - tokenTime > maxAge) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // 从URL参数中获取photoRecordId
    const url = new URL(request.url)
    const photoRecordId = url.searchParams.get('photoRecordId')
    
    if (!photoRecordId) {
      return NextResponse.json({ error: "Photo record ID is required" }, { status: 400 })
    }

    // 获取照片记录以验证支付状态
    const photoRecord = await getPhotoRecord(photoRecordId)
    if (!photoRecord) {
      return NextResponse.json({ error: "Photo record not found" }, { status: 404 })
    }

    // 检查支付状态
    if (!photoRecord.is_paid) {
      return NextResponse.json({ 
        error: "Payment required",
        details: "Please complete payment to download the processed photo"
      }, { status: 403 })
    }

    // 检查是否有处理后的图片
    if (!photoRecord.output_image_url) {
      return NextResponse.json({ error: "Processed image not found" }, { status: 404 })
    }

    // 直接从R2获取文件对象
    const fileKey = photoRecord.output_image_url
    const fileObject = await getR2Object(fileKey)
    
    if (!fileObject) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    // 生成文件名
    const fileName = `my-number-photo-${Date.now()}.jpg`

    // 设置响应头，强制下载
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    headers.set('Content-Type', 'image/jpeg')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    // 直接返回文件流
    return new NextResponse(fileObject, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ 
      error: "Failed to download file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
