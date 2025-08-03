import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2, generateFileKey } from "@/lib/r2-utils"
import { R2_PATHS } from "@/lib/r2-client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (7MB limit)
    if (file.size > 7 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Generate file ID
    const fileId = Math.random().toString(36).substring(2, 15)
    
    // Upload to R2
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${fileId}.${fileExtension}`
    const fileKey = generateFileKey(R2_PATHS.INPUT, fileName)
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to R2
    const imageUrl = await uploadToR2(
      fileBuffer,
      fileKey,
      file.type
    )

    return NextResponse.json({
      success: true,
      fileId,
      imageUrl,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? 'Set' : 'Not set',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Not set',
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'number-card-photos'
      }
    })
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
