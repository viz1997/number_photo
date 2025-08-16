import { type NextRequest, NextResponse } from "next/server"
import { createPhotoRecord } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Image URL required",
        details: "Missing imageUrl in request body"
      }, { status: 400 })
    }

    
    

    // Create photo record in database
    const photoRecord = await createPhotoRecord({
      user_id: `demo_${Date.now()}`, // Demo user ID
      email: `demo_${Date.now()}@example.com`, // Demo email
      input_image_url: imageUrl,
      is_paid: false, // Default to false for demo
    })

    if (!photoRecord) {
      console.error('Failed to create photo record')
      return NextResponse.json({ 
        error: "Failed to create photo record",
        details: "Database operation failed"
      }, { status: 500 })
    }

    const photoRecordId = photoRecord.id

    
    

    return NextResponse.json({
      success: true,
      photoRecordId,
      message: "Photo record created successfully",
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("=== Create Record API Error ===")
    console.error("Error details:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }
    
    return NextResponse.json({ 
      error: "Record creation failed",
      details: errorDetails
    }, { status: 500 })
  }
}
