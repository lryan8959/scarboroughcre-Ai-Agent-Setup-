-- ============================================
-- COMPREHENSIVE DATABASE SETUP FOR LISTINGS
-- Run this script to ensure all tables are properly configured
-- ============================================

-- 1. Ensure listings table has all necessary columns
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zoning TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT;

-- 2. Create or update listing_files table for storing uploaded documents
CREATE TABLE IF NOT EXISTS listing_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  folder_name TEXT NOT NULL DEFAULT 'Documents',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listing_files_listing_id ON listing_files(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_files_folder ON listing_files(folder_name);

-- 4. Ensure all listing fields are properly typed
-- Fix any existing data type issues
ALTER TABLE listings 
ALTER COLUMN building_sf TYPE INTEGER USING building_sf::INTEGER,
ALTER COLUMN lot_acres TYPE NUMERIC(10,2) USING lot_acres::NUMERIC,
ALTER COLUMN year_built TYPE INTEGER USING year_built::INTEGER,
ALTER COLUMN list_price TYPE NUMERIC(15,2) USING list_price::NUMERIC;

-- 5. Add comments for documentation
COMMENT ON COLUMN listings.thumbnail_url IS 'Main listing image shown in search results';
COMMENT ON COLUMN listings.description IS 'Detailed property description';
COMMENT ON COLUMN listings.zoning IS 'Property zoning classification';
COMMENT ON COLUMN listings.property_type IS 'Type of property (e.g., Office Building, Retail)';

COMMENT ON TABLE listing_files IS 'Stores all uploaded files for listings organized by folders';
COMMENT ON COLUMN listing_files.folder_name IS 'Folder organization (Documents, Photos, Reports, etc.)';

-- 6. Verify the schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'listing_files'
ORDER BY ordinal_position;
