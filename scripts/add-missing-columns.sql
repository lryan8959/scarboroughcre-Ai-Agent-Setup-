-- Add missing columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zoning TEXT,
ADD COLUMN IF NOT EXISTS square_footage INTEGER,
ADD COLUMN IF NOT EXISTS lot_size NUMERIC(10, 2);

-- Optional: Copy data from old columns to new ones if they exist
UPDATE listings
SET square_footage = building_sf
WHERE building_sf IS NOT NULL AND square_footage IS NULL;

UPDATE listings
SET lot_size = lot_acres  
WHERE lot_acres IS NOT NULL AND lot_size IS NULL;

-- Add comment
COMMENT ON COLUMN listings.description IS 'Property description';
COMMENT ON COLUMN listings.zoning IS 'Zoning information';
COMMENT ON COLUMN listings.square_footage IS 'Square footage (duplicate of building_sf for compatibility)';
COMMENT ON COLUMN listings.lot_size IS 'Lot size in acres (duplicate of lot_acres for compatibility)';
