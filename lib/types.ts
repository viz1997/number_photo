export interface UploadedFile {
  id: string
  fileId: string
  originalFilename: string
  fileSize: number
  mimeType: string
  storagePath: string
  uploadIp?: string
  createdAt: string
}

export interface ProcessedImage {
  id: string
  processedImageId: string
  originalFileId: string
  storagePath: string
  previewPath?: string
  processingStatus: "pending" | "processing" | "completed" | "failed"
  processingStartedAt?: string
  processingCompletedAt?: string
  createdAt: string
}

export interface Payment {
  id: string
  paymentId: string
  processedImageId: string
  email: string
  amount: number
  currency: string
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  paymentMethod?: string
  polarPaymentId?: string
  paidAt?: string
  createdAt: string
}

export interface DownloadToken {
  id: string
  downloadToken: string
  paymentId: string
  processedImageId: string
  email: string
  expiresAt: string
  downloadCount: number
  lastDownloadedAt?: string
  createdAt: string
}

export interface MyNumberPhotoSpecs {
  width: number // 4.5cm at 300dpi = 531px
  height: number // 3.5cm at 300dpi = 413px
  dpi: number
  format: "jpeg"
  backgroundColor: "#ffffff"
  quality: number
}

export const MYNUMBER_PHOTO_SPECS: MyNumberPhotoSpecs = {
  width: 531,
  height: 413,
  dpi: 300,
  format: "jpeg",
  backgroundColor: "#ffffff",
  quality: 95,
}
