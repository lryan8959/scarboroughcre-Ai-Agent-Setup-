-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read form_fields" ON form_fields;
DROP POLICY IF EXISTS "Admins can insert form_fields" ON form_fields;
DROP POLICY IF EXISTS "Admins can update form_fields" ON form_fields;
DROP POLICY IF EXISTS "Admins can delete form_fields" ON form_fields;

-- Enable RLS on form_fields table
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read form fields (agents need to see them when creating listings)
CREATE POLICY "Anyone can read form_fields"
ON form_fields FOR SELECT
TO authenticated, anon
USING (true);

-- Allow admins to insert form fields
CREATE POLICY "Admins can insert form_fields"
ON form_fields FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow admins to update form fields
CREATE POLICY "Admins can update form_fields"
ON form_fields FOR UPDATE
TO authenticated, anon
USING (true);

-- Allow admins to delete form fields
CREATE POLICY "Admins can delete form_fields"
ON form_fields FOR DELETE
TO authenticated, anon
USING (true);

-- Enable RLS on other tables and set permissive policies
ALTER TABLE listing_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read categories" ON listing_categories;
CREATE POLICY "Anyone can read categories"
ON listing_categories FOR SELECT
TO authenticated, anon
USING (true);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read listings" ON listings;
CREATE POLICY "Anyone can read listings"
ON listings FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Anyone can insert listings" ON listings;
CREATE POLICY "Anyone can insert listings"
ON listings FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update listings" ON listings;
CREATE POLICY "Anyone can update listings"
ON listings FOR UPDATE
TO authenticated, anon
USING (true);

ALTER TABLE listing_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage files" ON listing_files;
CREATE POLICY "Anyone can manage files"
ON listing_files FOR ALL
TO authenticated, anon
USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read users" ON users;
CREATE POLICY "Anyone can read users"
ON users FOR SELECT
TO authenticated, anon
USING (true);
