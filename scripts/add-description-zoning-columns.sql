-- Add description and zoning columns to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS zoning VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN listings.description IS 'Detailed description of the property';
COMMENT ON COLUMN listings.zoning IS 'Zoning classification (e.g., Commercial, Residential)';
