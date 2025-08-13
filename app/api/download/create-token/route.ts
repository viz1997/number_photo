import { NextRequest, NextResponse } from "next/server"
import { getPhotoRecord, updatePhotoRecord } from "@/lib/supabase"
import { generateSecureFileId } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const { fileKey, photoRecordId } = await request.json()

    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 })
    }

    if (!photoRecordId) {
      return NextResponse.json({ error: "Photo record ID is required" }, { status: 400 })
    }

    // Get photo record to check payment status
    const photoRecord = await getPhotoRecord(photoRecordId)
    if (!photoRecord) {
      return NextResponse.json({ error: "Photo record not found" }, { status: 404 })
    }

    // Check if payment is completed
    if (!photoRecord.is_paid) {
      return NextResponse.json({ 
        error: "Payment required",
        details: "Please complete payment to download the processed photo"
      }, { status: 403 })
    }

    // Generate a secure download token using secure random generation
    const secureId = generateSecureFileId()
    const timestamp = Date.now().toString(36)
    const token = `dl_${secureId}_${timestamp}`

    // Store token in session storage or database (for demo, we'll use a simple approach)
    // In production, you should store this in a database with expiration

    return NextResponse.json({
      success: true,
      token,
      message: "Download token created successfully"
    })
  } catch (error) {
    console.error("Create download token error:", error)
    return NextResponse.json({ 
      error: "Failed to create download token",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
