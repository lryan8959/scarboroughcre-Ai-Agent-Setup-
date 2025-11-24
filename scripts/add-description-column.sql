-- Add description column to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN listings.description IS 'Detailed property description';
