import { NextRequest, NextResponse } from "next/server"
import { generateSecureFileId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { fileKey } = await request.json()

    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 })
    }

    // Generate a secure download token for watermarked version
    // This version doesn't require payment verification
    const secureId = generateSecureFileId()
    const timestamp = Date.now().toString(36)
    const token = `wm_${secureId}_${timestamp}`

    return NextResponse.json({
      success: true,
      token,
      message: "Watermarked download token created successfully"
    })
  } catch (error) {
    console.error("Create watermarked download token error:", error)
    return NextResponse.json({ 
      error: "Failed to create watermarked download token",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
