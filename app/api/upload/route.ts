import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2, generateFileKey } from "@/lib/r2-utils"
import { R2_PATHS } from "@/lib/r2-client"
import { createPhotoRecord } from "@/lib/supabase"
import { generateSecureFileName, generateSecureFileId } from "@/lib/utils"

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

    // Generate secure random file ID and name
    const fileId = generateSecureFileId()
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = generateSecureFileName(fileExtension)
    const fileKey = generateFileKey(R2_PATHS.INPUT, fileName)
    
    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    console.log('Uploading to R2:', {
      bucket: process.env.R2_BUCKET_NAME,
      key: fileKey,
      fileName: fileName,
      fileSize: fileBuffer.length,
      endpoint: process.env.R2_ENDPOINT
    })
    
    // Upload to R2
    const imageUrl = await uploadToR2(
      fileBuffer,
      fileKey,
      file.type
    )

    // Create photo record in Supabase
    let photoRecordId: string | null = null
    try {
      console.log('=== 开始创建数据库记录 ===')
      console.log('Environment check:', {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      })
      
      // 生成用户ID
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const userId = `user-${timestamp}-${random}`
      
      console.log('调用 createPhotoRecord 参数:', {
        user_id: userId,
        email: "",
        input_image_url: imageUrl,
        is_paid: false
      })
      
      photoRecordId = await createPhotoRecord({
        user_id: userId,
        email: "", // 邮箱不再必填
        input_image_url: imageUrl,
        is_paid: false, // Default to false for demo
      })
      
      console.log('createPhotoRecord 返回值:', photoRecordId)
      
      if (photoRecordId) {
        console.log('Photo record created successfully:', photoRecordId)
      } else {
        console.error('createPhotoRecord returned null')
      }
    } catch (dbError) {
      console.error('Failed to create photo record in database:', dbError)
      console.error('Error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        name: dbError instanceof Error ? dbError.name : 'Unknown'
      })
      // Don't fail the upload if database creation fails
    }

    return NextResponse.json({
      success: true,
      fileId,
      fileName,
      imageUrl,
      photoRecordId, // Include the photo record ID
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
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'test',
        R2_ENDPOINT: process.env.R2_ENDPOINT ? 'Set' : 'Not set'
      }
    })
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
