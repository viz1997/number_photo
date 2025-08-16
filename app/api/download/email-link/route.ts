import { NextRequest, NextResponse } from "next/server"
import { getPhotoRecord } from "@/lib/supabase"
import { generatePresignedUrl } from "@/lib/r2-client"

export async function POST(request: NextRequest) {
  try {
    const { photoRecordId } = await request.json()

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
        details: "Please complete payment to generate download link"
      }, { status: 403 })
    }

    // 检查是否有处理后的图片
    if (!photoRecord.output_image_url) {
      return NextResponse.json({ error: "Processed image not found" }, { status: 404 })
    }

    // 生成30天有效期的预签名URL（2592000秒 = 30天）
    // 这样用户有足够的时间查看邮件并下载图片
    const downloadUrl = await generatePresignedUrl(photoRecord.output_image_url, 2592000)

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 2592000,
      expiresAt: new Date(Date.now() + 2592000 * 1000).toISOString(),
      message: "Email download link generated successfully"
    })
  } catch (error) {
    console.error("Generate email download link error:", error)
    return NextResponse.json({ 
      error: "Failed to generate email download link",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
