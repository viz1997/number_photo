import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function createUploadedFile(data: {
  fileId: string
  originalFilename: string
  fileSize: number
  mimeType: string
  storagePath: string
  uploadIp?: string
}) {
  const result = await sql`
    INSERT INTO uploaded_files (file_id, original_filename, file_size, mime_type, storage_path, upload_ip)
    VALUES (${data.fileId}, ${data.originalFilename}, ${data.fileSize}, ${data.mimeType}, ${data.storagePath}, ${data.uploadIp})
    RETURNING *
  `
  return result[0]
}

export async function createProcessedImage(data: {
  processedImageId: string
  originalFileId: string
  storagePath: string
  previewPath?: string
}) {
  const result = await sql`
    INSERT INTO processed_images (processed_image_id, original_file_id, storage_path, preview_path, processing_status)
    VALUES (${data.processedImageId}, ${data.originalFileId}, ${data.storagePath}, ${data.previewPath}, 'completed')
    RETURNING *
  `
  return result[0]
}

export async function createPayment(data: {
  paymentId: string
  processedImageId: string
  email: string
  amount: number
}) {
  const result = await sql`
    INSERT INTO payments (payment_id, processed_image_id, email, amount, payment_status)
    VALUES (${data.paymentId}, ${data.processedImageId}, ${data.email}, ${data.amount}, 'completed')
    RETURNING *
  `
  return result[0]
}

export async function createDownloadToken(data: {
  downloadToken: string
  paymentId: string
  processedImageId: string
  email: string
  expiresAt: Date
}) {
  const result = await sql`
    INSERT INTO download_tokens (download_token, payment_id, processed_image_id, email, expires_at)
    VALUES (${data.downloadToken}, ${data.paymentId}, ${data.processedImageId}, ${data.email}, ${data.expiresAt.toISOString()})
    RETURNING *
  `
  return result[0]
}

export async function getDownloadToken(token: string) {
  const result = await sql`
    SELECT dt.*, pi.storage_path, p.email
    FROM download_tokens dt
    JOIN processed_images pi ON dt.processed_image_id = pi.processed_image_id
    JOIN payments p ON dt.payment_id = p.payment_id
    WHERE dt.download_token = ${token} AND dt.expires_at > NOW()
  `
  return result[0]
}

export async function incrementDownloadCount(token: string) {
  await sql`
    UPDATE download_tokens 
    SET download_count = download_count + 1, last_downloaded_at = NOW()
    WHERE download_token = ${token}
  `
}
