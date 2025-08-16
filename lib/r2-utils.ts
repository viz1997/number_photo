import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { createCanvas, loadImage } from 'canvas'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_BUCKET_NAME, R2_PATHS, getR2FileUrl } from './r2-client'
import { generateSecureFileId } from './utils'

/**
 * 上传文件到R2私有桶
 */
export async function uploadToR2(
  file: Buffer | string,
  key: string,
  contentType: string = 'image/jpeg',
  bucket: string = R2_BUCKET_NAME
): Promise<string> {
  try {
    console.log('R2 upload attempt:', {
      bucket,
      key,
      contentType,
      fileSize: file instanceof Buffer ? file.length : file.length,
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    })

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    const result = await r2Client.send(command)
    console.log('R2 upload success:', result)
    
    // 根据存储桶类型返回不同的URL
    if (bucket === R2_PUBLIC_BUCKET_NAME) {
      // 公开桶使用公共域名
      const fileUrl = getR2FileUrl(key)
      console.log('Generated public file URL:', fileUrl)
      return fileUrl
    } else {
      // 私有桶返回对象键，用于后续生成预签名URL
      console.log('Uploaded to private bucket, key:', key)
      return key
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    console.error('R2 client config:', {
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      bucket,
      hasCredentials: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
    })
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 上传文件到R2公开桶（用于预览图）
 */
export async function uploadToPublicR2(
  file: Buffer | string,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  return uploadToR2(file, key, contentType, R2_PUBLIC_BUCKET_NAME)
}

/**
 * 从URL下载图片并上传到R2
 */
export async function downloadAndUploadToR2(
  imageUrl: string,
  key: string,
  bucket: string = R2_BUCKET_NAME
): Promise<string> {
  try {
    console.log('Downloading image from URL:', imageUrl)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    console.log('Downloaded image size:', buffer.length, 'bytes')
    
    // 获取Content-Type
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // 上传到R2
    return await uploadToR2(buffer, key, contentType, bucket)
  } catch (error) {
    console.error('Download and upload error:', error)
    throw new Error(`Failed to download and upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 生成带水印的预览图并上传到私有桶
 */
export async function generateWatermarkedPreview(
  originalImageUrl: string,
  outputKey: string
): Promise<string> {
  try {
    console.log('Generating watermarked preview for:', originalImageUrl)
    
    // 下载原图
    const response = await fetch(originalImageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download original image: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 使用canvas库加载图片并添加水印
    const image = await loadImage(buffer)
    
    // 创建canvas
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    
    // 绘制原图
    ctx.drawImage(image, 0, 0)
    
    // 添加水印
    ctx.save()
    
    // 水印文字样式
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.lineWidth = 2
    const baseFont = Math.max(canvas.width * 0.08, 24)
    ctx.font = `${baseFont}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 在三个位置添加水印
    const positions = [
      { x: canvas.width * 0.25, y: canvas.height * 0.25 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5 },
      { x: canvas.width * 0.75, y: canvas.height * 0.75 },
    ]
    
    for (const pos of positions) {
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.rotate(-0.2) // 稍微倾斜水印
      
      // 先绘制黑色描边，再绘制白色文字，确保在任何背景下都清晰可见
      ctx.strokeText('Preview', 0, 0)
      ctx.fillText('Preview', 0, 0)
      
      ctx.restore()
    }
    
    ctx.restore()
    
    // 将canvas转换为buffer
    const watermarkedBuffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    
    console.log('Watermark added successfully, watermarked image size:', watermarkedBuffer.length, 'bytes')
    
    // 上传到私有桶
    const previewKey = outputKey.replace(R2_PATHS.OUTPUT, R2_PATHS.PREVIEW)
    return await uploadToR2(watermarkedBuffer, previewKey, 'image/jpeg', R2_BUCKET_NAME)
  } catch (error) {
    console.error('Failed to generate watermarked preview:', error)
    throw new Error(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 生成文件键
 */
export function generateFileKey(path: string, fileName: string): string {
  return `${path}${fileName}`
} 