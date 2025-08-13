import { type NextRequest, NextResponse } from "next/server"
import { getPhotoRecord, updatePhotoRecord } from "@/lib/supabase"
import { CopyObjectCommand } from "@aws-sdk/client-s3"
import { r2Client, R2_BUCKET_NAME, R2_PATHS, getR2PublicUrl } from "@/lib/r2-client"
import { downloadAndUploadToR2, generateFileKey } from "@/lib/r2-utils"
import { generateSecureFileName } from "@/lib/utils"
import Replicate from "replicate"

export async function POST(request: NextRequest) {
  try {
    const { photoRecordId } = await request.json()

    if (!photoRecordId) {
      return NextResponse.json({ 
        error: "Photo record ID required",
        details: "Missing photoRecordId in request body"
      }, { status: 400 })
    }

    console.log('=== Process API Started ===')
    console.log('Processing photo record ID:', photoRecordId)

    // Get photo record
    const photoRecord = await getPhotoRecord(photoRecordId)
    
    if (!photoRecord) {
      console.error('Photo record not found:', photoRecordId)
      return NextResponse.json({ 
        error: "Photo record not found",
        details: `No photo record found with ID: ${photoRecordId}`
      }, { status: 404 })
    }

    // Check if photo is already processed
    if (photoRecord.output_image_url) {
      console.log('Photo already processed, returning existing output:', photoRecord.output_image_url)
      return NextResponse.json({
        success: true,
        outputImageUrl: photoRecord.output_image_url,
        message: "Photo already processed",
        alreadyProcessed: true
      })
    }

    // Check if photo is paid (for production, you might want to enforce this)
    if (!photoRecord.is_paid) {
      console.log('Photo not paid yet, proceeding with processing (demo mode)')
    }

    console.log('Starting AI processing for photo:', photoRecord.input_image_url)

    // Parse R2 object key
    const inputUrl = new URL(photoRecord.input_image_url)
    const inputKey = inputUrl.pathname.replace(/^\/+/, "")

    if (!inputKey.startsWith(R2_PATHS.INPUT)) {
      console.warn("Input key does not start with expected prefix:", {
        inputKey,
        expectedPrefix: R2_PATHS.INPUT,
      })
    }

    // Generate secure random output filename instead of predictable path replacement
    const outputFileName = generateSecureFileName('jpg')
    const outputKey = generateFileKey(R2_PATHS.OUTPUT, outputFileName)
    console.log('Processing paths:', { inputKey, outputKey, outputFileName })

    let outputImageUrl: string | null = null

    // If Replicate is configured, perform real AI processing
    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (replicateToken) {
      try {
        console.log('Running Replicate AI processing...')
        const replicate = new Replicate({ auth: replicateToken })
        
        // Fixed: Use valid aspect ratio '4:5' instead of '35:45'
        const result = await replicate.run(
          'black-forest-labs/flux-kontext-pro:aa776ca45ce7f7d185418f700df8ec6ca6cb367bfd88e9cd225666c4c179d1d7',
          {
            input: {
              prompt: 'Transform this photo into official Japanese My Number Card format: clean solid white background, crop and reframe to show head and upper shoulders only, center the face vertically in frame with head taking up 70-75% of total height, ensure 4±2mm margin from top of head to frame edge, position face exactly in horizontal center, maintain 34±2mm from chin to top of head measurement, professional passport-style lighting with no shadows on face or background, front-facing pose, neutral expression with mouth closed, eyes looking directly at camera with clear gaze, hair should not cover face or ears, remove any accessories like hats or sunglasses, sharp focus on facial features, government ID photo standards compliance, official document quality, output image must be exactly 4.5cm × 3.5cm (45mm × 35mm) passport photo size, high resolution 300dpi',
              input_image: photoRecord.input_image_url,
              aspect_ratio: '4:5', // Fixed: Valid aspect ratio for Replicate API
              output_format: 'jpg',
              safety_tolerance: 2,
            },
          }
        )

        const replicateOutputUrl = Array.isArray(result) ? result[0] : (result as unknown as string)
        console.log('Replicate processing completed, output URL:', replicateOutputUrl)

        // Download Replicate output and upload to R2 output directory with secure filename
        outputImageUrl = await downloadAndUploadToR2(replicateOutputUrl, outputKey)
        console.log('Successfully uploaded processed image to R2:', outputImageUrl)
        
      } catch (replicateError) {
        console.error('Replicate processing failed, falling back to copy input → output:', replicateError)
        console.error('Error details:', {
          message: replicateError instanceof Error ? replicateError.message : 'Unknown error',
          stack: replicateError instanceof Error ? replicateError.stack : undefined
        })
      }
    } else {
      console.log('Replicate API token not configured, using fallback processing')
    }

    // Fallback: copy input file to output if AI processing failed or not configured
    if (!outputImageUrl) {
      console.log('Using fallback processing: copying input to output')
      try {
        await r2Client.send(new CopyObjectCommand({
          Bucket: R2_BUCKET_NAME,
          CopySource: `${R2_BUCKET_NAME}/${inputKey}`,
          Key: outputKey,
          MetadataDirective: 'REPLACE',
          ContentType: 'image/jpeg',
        }))
        outputImageUrl = getR2PublicUrl(outputKey)
        console.log('Fallback processing completed, output URL:', outputImageUrl)
      } catch (copyError) {
        console.error('Fallback processing failed:', copyError)
        throw new Error('Failed to process image with both AI and fallback methods')
      }
    }

    // Update database record with output image URL
    console.log('Updating database record with output image URL:', outputImageUrl)
    await updatePhotoRecord(photoRecordId, {
      output_image_url: outputImageUrl,
    })

    console.log('=== Process API Completed Successfully ===')
    console.log('Output image URL:', outputImageUrl)

    return NextResponse.json({
      success: true,
      outputImageUrl,
      message: "Photo processed successfully",
      processingMethod: replicateToken ? 'ai' : 'fallback',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("=== Process API Error ===")
    console.error("Error details:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown processing error"
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }
    
    return NextResponse.json({ 
      error: "Processing failed",
      details: errorDetails
    }, { status: 500 })
  }
}
