import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET_NAME, R2_PATHS, getR2FileUrl } from './r2-client'
import { generateSecureFileId } from './utils'

/**
 * 上传文件到R2
 */
export async function uploadToR2(
  file: Buffer | string,
  key: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  try {
    console.log('R2 upload attempt:', {
      bucket: R2_BUCKET_NAME,
      key,
      contentType,
      fileSize: file instanceof Buffer ? file.length : file.length,
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    })

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    const result = await r2Client.send(command)
    console.log('R2 upload success:', result)
    
    // 使用新的URL生成函数
    const fileUrl = getR2FileUrl(key)
    console.log('Generated file URL:', fileUrl)
    return fileUrl
  } catch (error) {
    console.error('R2 upload error:', error)
    console.error('R2 client config:', {
      endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      bucket: R2_BUCKET_NAME,
      hasCredentials: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY)
    })
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 从URL下载图片并上传到R2
 */
export async function downloadAndUploadToR2(
  imageUrl: string,
  key: string
): Promise<string> {
  try {
    // 下载图片
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to download image')
    }
    
    const imageBuffer = await response.arrayBuffer()
    
    // 上传到R2
    return await uploadToR2(
      Buffer.from(imageBuffer),
      key,
      'image/jpeg'
    )
  } catch (error) {
    console.error('Download and upload error:', error)
    throw new Error('Failed to download and upload image')
  }
}

/**
 * 生成唯一的文件键名
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now()
  const secureId = generateSecureFileId()
  return `${prefix}${timestamp}-${secureId}-${filename}`
} 