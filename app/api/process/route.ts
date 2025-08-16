import { type NextRequest, NextResponse } from "next/server"
import { getPhotoRecord, updatePhotoRecord } from "@/lib/supabase"
import { CopyObjectCommand } from "@aws-sdk/client-s3"
import { r2Client, R2_BUCKET_NAME, R2_PATHS, getR2PublicUrl, generatePresignedUrl } from "@/lib/r2-client"
import { downloadAndUploadToR2, generateFileKey, generateWatermarkedPreview } from "@/lib/r2-utils"
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

    // Derive input object key and an accessible URL (presigned if needed)
    const inputValue = photoRecord.input_image_url
    let inputKey: string
    let inputUrlForExternalAccess: string | null = null
    if (/^https?:\/\//.test(inputValue)) {
      const parsed = new URL(inputValue)
      inputKey = parsed.pathname.replace(/^\/+/, "")
      inputUrlForExternalAccess = inputValue
    } else {
      inputKey = inputValue.replace(/^\/+/, "")
      try {
        inputUrlForExternalAccess = await generatePresignedUrl(inputKey, 3600)
      } catch (e) {
        console.warn('Failed to presign input image URL, will rely on fallback copy:', e)
      }
    }

    if (!inputKey.startsWith(R2_PATHS.INPUT)) {
      console.warn("Input key does not start with expected prefix:", {
        inputKey,
        expectedPrefix: R2_PATHS.INPUT,
      })
    }

    // Generate secure random output filename
    const outputFileName = generateSecureFileName('jpg')
    const outputKey = generateFileKey(R2_PATHS.OUTPUT, outputFileName)
    console.log('Processing paths:', { inputKey, outputKey, outputFileName })

    let processedImageKey: string | null = null
    let previewImageUrl: string | null = null

    // If Replicate is configured and we have an accessible input URL, perform real AI processing
    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (replicateToken && inputUrlForExternalAccess) {
      try {
        console.log('Running Replicate AI processing...')
        const replicate = new Replicate({ auth: replicateToken })
        
        // Fixed: Use valid aspect ratio '3:4' for Japanese My Number Card format
        const result = await replicate.run(
          'black-forest-labs/flux-kontext-pro:aa776ca45ce7f7d185418f700df8ec6ca6cb367bfd88e9cd225666c4c179d1d7',
          {
            input: {

              prompt: 'Transform this photo into official Japanese My Number Card format: clean solid white background, crop and reframe to show head and upper shoulders only, center the face vertically in frame with head taking up 70-75% of total height, ensure 4±2mm margin from top of head to frame edge, position face exactly in horizontal center, maintain 34±2mm from chin to top of head measurement, professional passport-style lighting with no shadows on face or background, front-facing pose, neutral expression with mouth closed, eyes looking directly at camera with clear gaze, hair should not cover face or ears, remove any accessories like hats or sunglasses, sharp focus on facial features, government ID photo standards compliance, official document quality, output image must be exactly 3.5cm × 4.5cm (35mm × 45mm) passport photo size with 3:4 aspect ratio, high resolution 300dpi, JPEG format',
              input_image: inputUrlForExternalAccess,
              aspect_ratio: '3:4', // Fixed: Valid aspect ratio for Replicate API
              output_format: 'jpg', // Ensure JPEG output format
              safety_tolerance: 2,
            },
          }
        )

        const replicateOutputUrl = Array.isArray(result) ? result[0] : (result as unknown as string)
        console.log('Replicate processing completed, output URL:', replicateOutputUrl)

        // Download Replicate output and upload to R2私有桶
        // 注意：Replicate输出是3:4比例，但我们需要4:5比例用于最终输出
        processedImageKey = await downloadAndUploadToR2(replicateOutputUrl, outputKey, R2_BUCKET_NAME)
        console.log('Successfully uploaded processed image to private R2 bucket:', processedImageKey)
        
        // 生成带水印的预览图并上传到私有桶
        try {
          // 从私有桶获取原图URL用于生成预览图
          const originalImageUrl = await generatePresignedUrl(processedImageKey, 3600) // 1小时有效期
          const previewImageKey = await generateWatermarkedPreview(originalImageUrl, outputKey)
          console.log('Successfully generated watermarked preview, key:', previewImageKey)
          
          // 为预览图生成预签名URL（2小时有效期，用于前端显示）
          previewImageUrl = await generatePresignedUrl(previewImageKey, 7200)
          console.log('Generated presigned URL for preview:', previewImageUrl)
        } catch (previewError) {
          console.warn('Failed to generate watermarked preview, using fallback:', previewError)
          // 如果生成预览图失败，使用原图作为预览（在实际生产环境中应该避免）
          previewImageUrl = await generatePresignedUrl(processedImageKey, 3600)
        }
        
      } catch (replicateError) {
        console.error('Replicate processing failed, falling back to copy input → output:', replicateError)
        console.error('Error details:', {
          message: replicateError instanceof Error ? replicateError.message : 'Unknown error',
          stack: replicateError instanceof Error ? replicateError.stack : undefined
        })
      }
    } else {
      if (!replicateToken) {
        console.log('Replicate API token not configured, using fallback processing')
      } else if (!inputUrlForExternalAccess) {
        console.log('No accessible input URL for AI (presign failed), using fallback processing')
      }
    }

    // Fallback: copy input file to output if AI processing failed or not configured
    if (!processedImageKey) {
      console.log('Using fallback processing: copying input to output')
      try {
        await r2Client.send(new CopyObjectCommand({
          Bucket: R2_BUCKET_NAME,
          CopySource: `${R2_BUCKET_NAME}/${inputKey}`,
          Key: outputKey,
          MetadataDirective: 'REPLACE',
          ContentType: 'image/jpeg', // Ensure JPEG format
        }))
        processedImageKey = outputKey
        console.log('Fallback processing completed, output key:', processedImageKey)
        
        // 为fallback处理也生成预览图
        try {
          const originalImageUrl = await generatePresignedUrl(processedImageKey, 3600)
          const previewImageKey = await generateWatermarkedPreview(originalImageUrl, outputKey)
          console.log('Fallback: Successfully generated watermarked preview, key:', previewImageKey)
          
          // 为预览图生成预签名URL（2小时有效期，用于前端显示）
          previewImageUrl = await generatePresignedUrl(previewImageKey, 7200)
          console.log('Fallback: Generated presigned URL for preview:', previewImageUrl)
        } catch (previewError) {
          console.warn('Fallback: Failed to generate watermarked preview:', previewError)
          previewImageUrl = await generatePresignedUrl(processedImageKey, 3600)
        }
      } catch (copyError) {
        console.error('Fallback processing failed:', copyError)
        throw new Error('Failed to process image with both AI and fallback methods')
      }
    }

    // 确保我们有预览图URL
    if (!previewImageUrl) {
      console.warn('No preview image URL generated, creating one from processed image')
      previewImageUrl = await generatePresignedUrl(processedImageKey!, 7200)
    }

    // Update database record with output image key (私有桶的key) and preview URL
    console.log('Updating database record with:', {
      outputImageKey: processedImageKey,
      previewImageUrl: previewImageUrl
    })
    
    await updatePhotoRecord(photoRecordId, {
      output_image_url: processedImageKey, // 存储私有桶的key（用于后端处理）
      preview_image_url: previewImageUrl, // 存储预览图URL
    })

    console.log('=== Process API Completed Successfully ===')
    console.log('Processed image key (private):', processedImageKey)
    console.log('Preview image URL (public):', previewImageUrl)

    // 为前端返回可访问的URL
    const accessibleOutputUrl = await generatePresignedUrl(processedImageKey!, 7200) // 2小时有效期
    
    return NextResponse.json({
      success: true,
      outputImageUrl: accessibleOutputUrl, // 返回可访问的预签名URL
      outputImageKey: processedImageKey, // 同时返回R2 key供后端使用
      previewImageUrl: previewImageUrl, // 返回预览图URL
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
