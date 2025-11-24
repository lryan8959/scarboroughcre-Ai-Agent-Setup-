-- Create a default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password, full_name, phone, role) VALUES
  ('admin@scarboroughcre.com', '$2a$10$rK8qVXJ.3yZJ3lX2Z5xmkOYJ5xJ3lX2Z5xmkOYJ5xJ3lX2Z5xmkOY', 'Admin User', '903-827-3112', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create sample agent user
-- Password: agent123 (hashed with bcrypt)
INSERT INTO users (email, password, full_name, phone, role) VALUES
  ('agent@scarboroughcre.com', '$2a$10$rK8qVXJ.3yZJ3lX2Z5xmkOYJ5xJ3lX2Z5xmkOYJ5xJ3lX2Z5xmkOY', 'Sample Agent', '903-827-3113', 'agent')
ON CONFLICT (email) DO NOTHING;

-- Insert default form fields for Office category
INSERT INTO form_fields (category_id, field_name, field_label, field_type, is_required, display_order)
SELECT 
  id,
  'building_class',
  'Building Class',
  'select',
  true,
  1
FROM listing_categories WHERE name = 'Office';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT 
  id,
  'building_class_type',
  'Building Class Type',
  'select',
  '["Class A", "Class B", "Class C"]'::jsonb,
  true,
  2
FROM listing_categories WHERE name = 'Office';

-- Insert default form fields for Retail category
INSERT INTO form_fields (category_id, field_name, field_label, field_type, is_required, display_order)
SELECT 
  id,
  'parking_spaces',
  'Parking Spaces',
  'number',
  false,
  1
FROM listing_categories WHERE name = 'Retail';

-- Insert default form fields for Industrial category
INSERT INTO form_fields (category_id, field_name, field_label, field_type, is_required, display_order)
SELECT 
  id,
  'dock_doors',
  'Number of Dock Doors',
  'number',
  false,
  1
FROM listing_categories WHERE name = 'Industrial';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, is_required, display_order)
SELECT 
  id,
  'ceiling_height',
  'Ceiling Height (ft)',
  'number',
  false,
  2
FROM listing_categories WHERE name = 'Industrial';
