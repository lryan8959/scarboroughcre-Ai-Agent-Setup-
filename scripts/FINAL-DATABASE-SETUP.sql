-- ============================================
-- FINAL COMPREHENSIVE DATABASE SETUP
-- Run this script in your Supabase SQL Editor
-- ============================================

-- Step 1: Clean existing data before type conversions
-- Clean invalid numeric values to prevent conversion errors
UPDATE listings SET building_sf = NULL WHERE building_sf = '' OR building_sf !~ '^[0-9]+$';
UPDATE listings SET lot_acres = NULL WHERE lot_acres = '' OR lot_acres !~ '^[0-9]+(\.[0-9]+)?$';
UPDATE listings SET year_built = NULL WHERE year_built = '' OR year_built !~ '^[0-9]+$';
UPDATE listings SET list_price = NULL WHERE list_price = '' OR list_price !~ '^[0-9]+(\.[0-9]+)?$';

-- Step 2: Ensure listings table has all required columns
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zoning TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Step 3: Ensure correct data types for listings table
-- Using NULLIF with cleaned data
ALTER TABLE listings 
ALTER COLUMN building_sf TYPE INTEGER USING building_sf::INTEGER,
ALTER COLUMN lot_acres TYPE NUMERIC(10,2) USING lot_acres::NUMERIC,
ALTER COLUMN year_built TYPE INTEGER USING year_built::INTEGER,
ALTER COLUMN list_price TYPE NUMERIC(15,2) USING list_price::NUMERIC;

-- Step 4: Create or replace listing_files table
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

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_files_listing_id ON listing_files(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_files_folder ON listing_files(folder_name);
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);

-- Step 6: Enable RLS on listing_files
-- Added RLS policies for proper security
ALTER TABLE listing_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view listing files" ON listing_files;
DROP POLICY IF EXISTS "Users can upload listing files" ON listing_files;
DROP POLICY IF EXISTS "Users can delete listing files" ON listing_files;

CREATE POLICY "Users can view listing files" ON listing_files
FOR SELECT USING (
  listing_id IN (SELECT id FROM listings WHERE agent_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can upload listing files" ON listing_files
FOR INSERT WITH CHECK (
  listing_id IN (SELECT id FROM listings WHERE agent_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can delete listing files" ON listing_files
FOR DELETE USING (
  listing_id IN (SELECT id FROM listings WHERE agent_id = auth.uid())
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Step 7: Add helpful comments
COMMENT ON COLUMN listings.thumbnail_url IS 'Main listing image URL from Vercel Blob';
COMMENT ON COLUMN listings.description IS 'Detailed property description';
COMMENT ON COLUMN listings.zoning IS 'Zoning classification (e.g., Commercial, Residential)';
COMMENT ON COLUMN listings.property_type IS 'Property type (e.g., Office Building, Retail Space)';
COMMENT ON TABLE listing_files IS 'Stores uploaded files organized by folders (Photos, Documents, Reports)';

-- Step 8: Verify schema is correct
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'listings'
  AND column_name IN ('thumbnail_url', 'description', 'zoning', 'property_type', 'building_sf', 'lot_acres', 'year_built', 'list_price')
ORDER BY column_name;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'listing_files'
ORDER BY ordinal_position;

-- Success message
SELECT 'Database setup complete! All tables and columns are properly configured.' AS status;
