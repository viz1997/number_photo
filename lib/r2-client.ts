import { S3Client } from '@aws-sdk/client-s3'

// R2客户端配置
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// R2存储桶名称
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'test'

// 文件路径配置
export const R2_PATHS = {
  INPUT: 'mynumber/input/',
  OUTPUT: 'mynumber/output/',
} as const

// 生成R2文件URL - 使用公共域名
export function getR2FileUrl(key: string): string {
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
  if (publicDomain) {
    return `${publicDomain}/${key}`
  }
  // Fallback to direct R2 endpoint
  return `${process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`}/${R2_BUCKET_NAME}/${key}`
}

// 生成R2公共URL - エイリアス関数
export function getR2PublicUrl(key: string): string {
  return getR2FileUrl(key)
}

// 测试URL是否可访问，如果公共域名失败则使用直接端点
export async function getAccessibleR2FileUrl(key: string): Promise<string> {
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_DOMAIN
  if (publicDomain) {
    const publicUrl = `${publicDomain}/${key}`
    try {
      // 测试公共域名是否可访问
      const response = await fetch(publicUrl, { method: 'HEAD' })
      if (response.ok) {
        return publicUrl
      }
    } catch (error) {
      console.warn('Public domain not accessible, falling back to direct endpoint:', error)
    }
  }
  
  // 使用直接R2端点作为后备
  return `${process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`}/${R2_BUCKET_NAME}/${key}`
} 