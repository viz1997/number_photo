import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成安全的随机文件名
 * 使用crypto.randomUUID()生成UUID，然后转换为base64格式，确保文件名安全且不可预测
 */
export function generateSecureFileName(extension: string = 'jpg'): string {
  // 使用crypto.randomUUID()生成UUID
  const uuid = crypto.randomUUID()
  
  // 将UUID转换为base64格式，移除特殊字符，只保留字母数字
  const base64 = Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64')
  const cleanBase64 = base64.replace(/[^a-zA-Z0-9]/g, '')
  
  // 取前16个字符作为文件名，确保长度合适
  const fileName = cleanBase64.substring(0, 16)
  
  // 添加时间戳前缀，增加唯一性
  const timestamp = Date.now().toString(36)
  
  return `${timestamp}-${fileName}.${extension}`
}

/**
 * 生成安全的随机文件ID（不包含扩展名）
 * 用于数据库记录和内部引用
 */
export function generateSecureFileId(): string {
  const uuid = crypto.randomUUID()
  const base64 = Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('base64')
  const cleanBase64 = base64.replace(/[^a-zA-Z0-9]/g, '')
  
  // 取前20个字符，确保唯一性
  return cleanBase64.substring(0, 20)
}
