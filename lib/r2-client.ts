import { S3Client } from '@aws-sdk/client-s3'

// R2客户端配置
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// R2存储桶名称
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'number-card-photos'

// 文件路径配置
export const R2_PATHS = {
  INPUT: 'mynumber/input/',
  OUTPUT: 'mynumber/output/',
} as const

// 生成R2文件URL
export function getR2FileUrl(key: string): string {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`
} 