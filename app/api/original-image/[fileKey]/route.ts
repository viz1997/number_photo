import { NextRequest, NextResponse } from "next/server"
import { generatePresignedUrl } from "@/lib/r2-client"

export async function GET(
  request: NextRequest,
  { params }: { params: { fileKey: string } }
) {
  try {
    const { fileKey } = params

    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 })
    }

    // 解码URL编码的文件键
    const decodedFileKey = decodeURIComponent(fileKey)
    
    console.log('Generating presigned URL for original image:', decodedFileKey)

    // 生成预签名URL，有效期2小时（7200秒）
    // 这样用户有足够时间查看图片，同时保持安全性
    const presignedUrl = await generatePresignedUrl(decodedFileKey, 7200)

    return NextResponse.json({
      success: true,
      imageUrl: presignedUrl,
      message: "Original image presigned URL generated successfully"
    })
  } catch (error) {
    console.error("Original image presigned URL error:", error)
    return NextResponse.json({ 
      error: "Failed to generate original image URL",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
