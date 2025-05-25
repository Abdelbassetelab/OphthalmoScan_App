-- Add image_url column to scan_requests table
ALTER TABLE scan_requests ADD COLUMN IF NOT EXISTS image_url TEXT;
