-- Add preview_image_url column to photos table
ALTER TABLE photos ADD COLUMN IF NOT EXISTS preview_image_url TEXT;

-- Add comment to explain the column purpose
COMMENT ON COLUMN photos.preview_image_url IS 'URL to watermarked preview image stored in public bucket';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photos_preview_image_url ON photos(preview_image_url);
