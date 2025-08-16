import { NextRequest, NextResponse } from "next/server"
import { getR2Object } from "@/lib/r2-client"
import sharp from "sharp"

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: "Watermarked download token is required" }, { status: 400 })
    }

    // 从URL参数中获取fileKey
    const url = new URL(request.url)
    const fileKey = url.searchParams.get('fileKey')
    
    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 })
    }

    // 直接从R2获取原图文件对象
    const fileObject = await getR2Object(fileKey)
    
    if (!fileObject) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 })
    }

    // 使用Sharp将图片转换为4:5比例
    // マイナンバーカード规格：3.5cm × 4.5cm，即4:5比例
    const processedImage = await sharp(fileObject)
      .resize(800, 1000, { // 4:5比例，800x1000像素
        fit: 'cover', // 保持比例，裁剪多余部分
        position: 'center' // 居中裁剪
      })
      .jpeg({ 
        quality: 90, // 预览图质量稍低
        progressive: true // 渐进式JPEG
      })
      .toBuffer()

    // 生成文件名
    const fileName = `my-number-photo-preview-${Date.now()}.jpg`

    // 设置响应头，强制下载
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    headers.set('Content-Type', 'image/jpeg')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    // 返回处理后的4:5比例图片
    return new NextResponse(processedImage, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("Watermarked download error:", error)
    return NextResponse.json({ 
      error: "Failed to download watermarked file",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
