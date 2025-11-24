-- Add thumbnail_url column to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Ensure all necessary columns exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zoning TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Update listing_files table to ensure file_path exists
ALTER TABLE listing_files
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- The file_path column will be populated when files are uploaded through the app
