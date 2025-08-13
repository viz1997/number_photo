import { NextRequest, NextResponse } from "next/server"
import { getR2PublicUrl } from "@/lib/r2-client"

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

    // 从sessionStorage或其他地方获取fileKey
    // 由于这是API路由，我们需要从请求中获取fileKey
    // 或者我们可以从URL参数中获取
    const url = new URL(request.url)
    const fileKey = url.searchParams.get('fileKey')
    
    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 })
    }

    // 获取R2公共URL
    const downloadUrl = getR2PublicUrl(fileKey)
    
    // 生成文件名
    const fileName = `processed-photo-${Date.now()}.jpg`

    // 返回下载信息
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName,
      fileKey,
      secureId,
      timestamp,
      message: "Download URL generated successfully"
    })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ 
      error: "Failed to generate download URL",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
