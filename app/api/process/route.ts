import { type NextRequest, NextResponse } from "next/server"
import Replicate from 'replicate'
import { v4 as uuidv4 } from 'uuid'
import { downloadAndUploadToR2, generateFileKey } from "@/lib/r2-utils"
import { R2_PATHS } from "@/lib/r2-client"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileId = uuidv4()

    // Replicate API configuration
    const model = 'black-forest-labs/flux-kontext-pro:aa776ca45ce7f7d185418f700df8ec6ca6cb367bfd88e9cd225666c4c179d1d7'
    const input = {
      prompt: 'Transform this photo into official Japanese ID card format: clean solid white background, crop and reframe to show head and upper shoulders only, center the face vertically in frame with head taking up 70-75% of total height, ensure 4±2mm margin from top of head to frame edge, position face exactly in horizontal center, maintain 34±2mm from chin to top of head measurement, professional passport-style lighting with no shadows on face or background, front-facing pose, gentle subtle smile with slight upward curve of lips - natural and pleasant expression, eyes looking directly at camera with warm friendly gaze, hair should not cover face or ears, remove any accessories like hats or sunglasses, sharp focus on facial features, government ID photo standards compliance, official document quality, maintain the original warm and kind facial expression, output image must be exactly 4.5cm × 3.5cm (45mm × 35mm) passport photo size',
      input_image: imageUrl,
      aspect_ratio: '35:45', // 3.5:4.5 ratio for passport photo
      output_format: 'jpg',
      safety_tolerance: 2,
    }

    console.log('Processing image with Replicate API...')
    console.log('Model:', model)
    console.log('Input:', input)

    // Call Replicate API with retry logic
    let output
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        output = await replicate.run(model, { input })
        break
      } catch (error) {
        retryCount++
        console.error(`Replicate API call failed (attempt ${retryCount}):`, error)
        
        if (retryCount >= maxRetries) {
          throw new Error(`Replicate API failed after ${maxRetries} attempts: ${error}`)
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
      }
    }

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('No output received from Replicate API')
    }

    const replicateImageUrl = output[0]

    // Download from Replicate and upload to R2
    const outputFileName = `${fileId}-${timestamp}.jpg`
    const outputFileKey = generateFileKey(R2_PATHS.OUTPUT, outputFileName)
    
    const processedImageUrl = await downloadAndUploadToR2(
      replicateImageUrl,
      outputFileKey
    )

    return NextResponse.json({
      success: true,
      processedImageUrl,
      fileId,
      outputFileName,
      message: "Image processed successfully",
    })
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json({ 
      error: "Processing failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
