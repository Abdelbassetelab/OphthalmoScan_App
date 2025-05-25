-- Add has_image column to scan_requests table
ALTER TABLE scan_requests ADD COLUMN IF NOT EXISTS has_image BOOLEAN DEFAULT false;

-- Update existing rows
UPDATE scan_requests SET has_image = false WHERE has_image IS NULL;
