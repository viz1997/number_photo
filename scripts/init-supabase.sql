-- Create photo_records table for Supabase
CREATE TABLE IF NOT EXISTS photo_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    input_image_url TEXT NOT NULL,
    output_image_url TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_photo_records_id ON photo_records(id);
CREATE INDEX IF NOT EXISTS idx_photo_records_created_at ON photo_records(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE photo_records ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (you can modify this based on your security requirements)
CREATE POLICY "Allow public read access" ON photo_records
    FOR SELECT USING (true);

-- Create policy for public insert access
CREATE POLICY "Allow public insert access" ON photo_records
    FOR INSERT WITH CHECK (true);

-- Create policy for public update access
CREATE POLICY "Allow public update access" ON photo_records
    FOR UPDATE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_photo_records_updated_at
    BEFORE UPDATE ON photo_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO photo_records (input_image_url, is_paid) 
-- VALUES ('https://example.com/sample.jpg', false);
