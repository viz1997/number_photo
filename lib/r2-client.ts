import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'

// R2客户端配置
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// R2存储桶配置（仅从环境变量读取，必须显式设置）
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
export const R2_PUBLIC_BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!

// 文件路径配置
export const R2_PATHS = {
  INPUT: 'mynumber/input/',
  OUTPUT: 'mynumber/output/',
  PREVIEW: 'mynumber/preview/', // 新增：预览图路径
} as const

// 生成R2文件URL - 使用公共域名（公开桶）
export function getR2FileUrl(key: string): string {
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
  if (publicDomain) {
    // 确保URL格式正确
    const cleanDomain = publicDomain.replace(/\/$/, '') // 移除末尾的斜杠
    const cleanKey = key.replace(/^\//, '') // 移除开头的斜杠
    return `${cleanDomain}/${cleanKey}`
  }
  
  // Fallback to direct R2 endpoint
  const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const cleanEndpoint = endpoint.replace(/\/$/, '') // 移除末尾的斜杠
  const cleanKey = key.replace(/^\//, '') // 移除开头的斜杠
  return `${cleanEndpoint}/${R2_PUBLIC_BUCKET_NAME}/${cleanKey}`
}

// 生成R2公共URL - エイリアス関数
export function getR2PublicUrl(key: string): string {
  return getR2FileUrl(key)
}

// 生成预签名URL用于访问私有桶中的原图
export async function generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
    
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn })
    return presignedUrl
  } catch (error) {
    console.error('Failed to generate presigned URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

// 测试URL是否可访问，如果公共域名失败则使用直接端点
export async function getAccessibleR2FileUrl(key: string): Promise<string> {
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
  if (publicDomain) {
    const cleanDomain = publicDomain.replace(/\/$/, '') // 移除末尾的斜杠
    const cleanKey = key.replace(/^\//, '') // 移除开头的斜杠
    const publicUrl = `${cleanDomain}/${cleanKey}`
    
    try {
      // 测试公共域名是否可访问
      const response = await fetch(publicUrl, { 
        method: 'HEAD',
        // 添加超时设置
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        return publicUrl
      }
    } catch (error) {
      console.warn('Public domain not accessible, falling back to direct endpoint:', error)
    }
  }
  
  // 使用直接R2端点作为后备
  const endpoint = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  const cleanEndpoint = endpoint.replace(/\/$/, '') // 移除末尾的斜杠
  const cleanKey = key.replace(/^\//, '') // 移除开头的斜杠
  return `${cleanEndpoint}/${R2_PUBLIC_BUCKET_NAME}/${cleanKey}`
}

// 新增：检查R2配置是否有效
export function validateR2Config(): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!process.env.R2_ACCOUNT_ID) {
    issues.push('R2_ACCOUNT_ID is not set')
  }
  
  if (!process.env.R2_ACCESS_KEY_ID) {
    issues.push('R2_ACCESS_KEY_ID is not set')
  }
  
  if (!process.env.R2_SECRET_ACCESS_KEY) {
    issues.push('R2_SECRET_ACCESS_KEY is not set')
  }
  
  if (!process.env.R2_BUCKET_NAME) {
    issues.push('R2_BUCKET_NAME is not set')
  }
  
  if (!process.env.R2_PUBLIC_BUCKET_NAME) {
    issues.push('R2_PUBLIC_BUCKET_NAME is not set')
  }
  
  if (!process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN) {
    issues.push('NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN is not set')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
} 

// 新增：直接从R2获取文件对象
export async function getR2Object(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
    
    const response = await r2Client.send(command)
    
    if (!response.Body) {
      return null
    }
    
    // 将流转换为Buffer
    const chunks: Uint8Array[] = []
    const reader = response.Body.transformToWebStream().getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    // 合并所有chunks为Buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const buffer = Buffer.concat(chunks, totalLength)
    
    return buffer
  } catch (error) {
    console.error('Failed to get R2 object:', error)
    return null
  }
} 