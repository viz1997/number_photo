-- Create database schema for My Number Card Photo Service

-- Users table (optional, for future user accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    file_id VARCHAR(50) UNIQUE NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    upload_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processed images table
CREATE TABLE IF NOT EXISTS processed_images (
    id SERIAL PRIMARY KEY,
    processed_image_id VARCHAR(50) UNIQUE NOT NULL,
    original_file_id VARCHAR(50) REFERENCES uploaded_files(file_id),
    storage_path VARCHAR(500) NOT NULL,
    preview_path VARCHAR(500),
    processing_status VARCHAR(20) DEFAULT 'pending',
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    processed_image_id VARCHAR(50) REFERENCES processed_images(processed_image_id),
    email VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 500, -- Amount in yen
    currency VARCHAR(3) DEFAULT 'JPY',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    polar_payment_id VARCHAR(100), -- Polar.sh payment ID
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Download tokens table
CREATE TABLE IF NOT EXISTS download_tokens (
    id SERIAL PRIMARY KEY,
    download_token VARCHAR(100) UNIQUE NOT NULL,
    payment_id VARCHAR(50) REFERENCES payments(payment_id),
    processed_image_id VARCHAR(50) REFERENCES processed_images(processed_image_id),
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Download logs table
CREATE TABLE IF NOT EXISTS download_logs (
    id SERIAL PRIMARY KEY,
    download_token VARCHAR(100) REFERENCES download_tokens(download_token),
    download_ip VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_files_file_id ON uploaded_files(file_id);
CREATE INDEX IF NOT EXISTS idx_processed_images_processed_image_id ON processed_images(processed_image_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(download_token);
CREATE INDEX IF NOT EXISTS idx_download_tokens_expires_at ON download_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Add some sample data for testing (optional)
-- INSERT INTO uploaded_files (file_id, original_filename, file_size, mime_type, storage_path) 
-- VALUES ('test123', 'sample.jpg', 1024000, 'image/jpeg', '/uploads/test123.jpg');
