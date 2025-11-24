-- Add thumbnail_url field to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN listings.thumbnail_url IS 'URL to the main thumbnail image for the listing';
