-- Comprehensive seed data for all listing categories with proper form fields

-- CAR WASH FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'wash_bays', 'Number of Wash Bays', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Car Wash';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'vacuum_stations', 'Vacuum Stations', 'number', NULL, false, 2
FROM listing_categories WHERE name = 'Car Wash';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'car_wash_type', 'Car Wash Type', 'select', '["Automatic", "Self-Service", "Full-Service", "Touchless"]'::jsonb, true, 3
FROM listing_categories WHERE name = 'Car Wash';

-- GAS STATION FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'fuel_pumps', 'Number of Fuel Pumps', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Gas Station';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'convenience_store', 'Convenience Store Included', 'select', '["Yes", "No"]'::jsonb, true, 2
FROM listing_categories WHERE name = 'Gas Station';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'tank_capacity', 'Underground Tank Capacity (gallons)', 'number', NULL, false, 3
FROM listing_categories WHERE name = 'Gas Station';

-- HOSPITALITY FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'total_rooms', 'Total Number of Rooms', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Hospitality';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'hotel_type', 'Hotel Type', 'select', '["Full-Service Hotel", "Limited-Service Hotel", "Extended Stay", "Motel", "Resort"]'::jsonb, true, 2
FROM listing_categories WHERE name = 'Hospitality';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'amenities', 'Key Amenities', 'textarea', NULL, false, 3
FROM listing_categories WHERE name = 'Hospitality';

-- INDUSTRIAL FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'dock_doors', 'Number of Dock Doors', 'number', NULL, false, 1
FROM listing_categories WHERE name = 'Industrial';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'ceiling_height', 'Clear Ceiling Height (ft)', 'number', NULL, true, 2
FROM listing_categories WHERE name = 'Industrial';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'crane_capacity', 'Crane Capacity (tons)', 'number', NULL, false, 3
FROM listing_categories WHERE name = 'Industrial';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'power_supply', 'Power Supply (voltage)', 'text', NULL, false, 4
FROM listing_categories WHERE name = 'Industrial';

-- LAND FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'frontage_feet', 'Frontage (feet)', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Land';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'utilities_available', 'Utilities Available', 'select', '["Water", "Sewer", "Electric", "Gas", "All", "None"]'::jsonb, false, 2
FROM listing_categories WHERE name = 'Land';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'topography', 'Topography', 'select', '["Flat", "Gently Sloping", "Steep", "Rolling"]'::jsonb, false, 3
FROM listing_categories WHERE name = 'Land';

-- OFFICE FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'building_class', 'Building Class', 'select', '["Class A", "Class B", "Class C"]'::jsonb, true, 1
FROM listing_categories WHERE name = 'Office';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'parking_ratio', 'Parking Ratio (spaces per 1,000 SF)', 'number', NULL, false, 2
FROM listing_categories WHERE name = 'Office';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'floors', 'Number of Floors', 'number', NULL, true, 3
FROM listing_categories WHERE name = 'Office';

-- RETAIL FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'parking_spaces', 'Total Parking Spaces', 'number', NULL, false, 1
FROM listing_categories WHERE name = 'Retail';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'anchor_tenant', 'Anchor Tenant', 'text', NULL, false, 2
FROM listing_categories WHERE name = 'Retail';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'retail_type', 'Retail Type', 'select', '["Strip Center", "Shopping Mall", "Standalone", "Mixed-Use"]'::jsonb, true, 3
FROM listing_categories WHERE name = 'Retail';

-- RESTAURANT FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'seating_capacity', 'Seating Capacity', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Restaurant';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'kitchen_equipment', 'Kitchen Equipment Included', 'select', '["Yes - Fully Equipped", "Partial", "None"]'::jsonb, false, 2
FROM listing_categories WHERE name = 'Restaurant';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'liquor_license', 'Liquor License', 'select', '["Included", "Available", "Not Available"]'::jsonb, false, 3
FROM listing_categories WHERE name = 'Restaurant';

-- MULTI-FAMILY FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'total_units', 'Total Number of Units', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Multi-Family';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'unit_mix', 'Unit Mix', 'textarea', NULL, false, 2
FROM listing_categories WHERE name = 'Multi-Family';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'occupancy_rate', 'Current Occupancy Rate (%)', 'number', NULL, false, 3
FROM listing_categories WHERE name = 'Multi-Family';

-- STORAGE FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'total_units_storage', 'Total Storage Units', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Storage';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'climate_controlled', 'Climate Controlled Units', 'number', NULL, false, 2
FROM listing_categories WHERE name = 'Storage';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'rv_boat_storage', 'RV/Boat Storage Available', 'select', '["Yes", "No"]'::jsonb, false, 3
FROM listing_categories WHERE name = 'Storage';

-- MIXED USE FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'commercial_sf', 'Commercial Square Footage', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'Mixed Use';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'residential_units_mixed', 'Residential Units', 'number', NULL, true, 2
FROM listing_categories WHERE name = 'Mixed Use';

-- RV/MOBILE HOME PARK FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'total_spaces', 'Total Spaces/Lots', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'RV/Mobile Home Park';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'hookups', 'Utility Hookups', 'select', '["Full (Water/Sewer/Electric)", "Partial", "None"]'::jsonb, false, 2
FROM listing_categories WHERE name = 'RV/Mobile Home Park';

-- SFR (Single Family Residence) FIELDS
INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'bedrooms', 'Number of Bedrooms', 'number', NULL, true, 1
FROM listing_categories WHERE name = 'SFR';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'bathrooms', 'Number of Bathrooms', 'number', NULL, true, 2
FROM listing_categories WHERE name = 'SFR';

INSERT INTO form_fields (category_id, field_name, field_label, field_type, field_options, is_required, display_order)
SELECT id, 'garage_spaces', 'Garage Spaces', 'number', NULL, false, 3
FROM listing_categories WHERE name = 'SFR';
