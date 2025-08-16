export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ImageMetadata {
  width: number
  height: number
  fileSize: number
  format: string
  colorMode: string
}

/**
 * 验证图片是否符合日本证件照官方要求
 */
export function validateImageForJapaneseID(metadata: ImageMetadata): ImageValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查文件格式
  if (metadata.format.toLowerCase() !== 'jpeg' && metadata.format.toLowerCase() !== 'jpg') {
    errors.push('ファイル形式はJPEGである必要があります')
  }

  // 检查颜色模式
  if (metadata.colorMode.toLowerCase() !== 'rgb') {
    errors.push('カラーモードはRGBである必要があります（CMYKは不可）')
  }

  // 检查文件大小 (20KB ~ 7MB)
  const fileSizeKB = metadata.fileSize / 1024
  const fileSizeMB = fileSizeKB / 1024
  
  if (fileSizeKB < 20) {
    errors.push('ファイルサイズは20KB以上である必要があります')
  } else if (fileSizeMB > 7) {
    errors.push('ファイルサイズは7MB以下である必要があります')
  }

  // 检查像素尺寸 (480~6000px)
  if (metadata.width < 480 || metadata.width > 6000) {
    errors.push('画像の幅は480~6000ピクセルである必要があります')
  }
  
  if (metadata.height < 480 || metadata.height > 6000) {
    errors.push('画像の高さは480~6000ピクセルである必要があります')
  }

  // 检查宽高比 (应该是 35:45 或接近的证件照比例)
  const aspectRatio = metadata.width / metadata.height
  const expectedRatio = 35 / 45 // 0.778 (标准证件照比例)
  const threeFourRatio = 3 / 4 // 0.75 (3:4比例)
  
  // 检查是否接近标准证件照比例或3:4比例
  const isCloseToStandard = Math.abs(aspectRatio - expectedRatio) < 0.05
  const isCloseToThreeFour = Math.abs(aspectRatio - threeFourRatio) < 0.05
  
  if (!isCloseToStandard && !isCloseToThreeFour) {
    warnings.push('画像の縦横比が標準的な証明写真の比率と異なります（推奨：35:45または3:4）')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 获取图片元数据
 */
export async function getImageMetadata(imageUrl: string): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    
    img.onload = () => {
      // 创建一个canvas来获取更多信息
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      // 获取文件大小（这里只能估算）
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const fileSize = Math.round((dataUrl.length * 3) / 4) // Base64 to bytes
      
      resolve({
        width: img.width,
        height: img.height,
        fileSize,
        format: 'jpeg',
        colorMode: 'rgb' // 假设是RGB，实际需要更复杂的检测
      })
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
  })
} 