-- Fix column types from INTEGER[] to UUID[]
-- Run this to fix the existing columns

-- First, drop the existing columns if they have wrong type
ALTER TABLE contacts 
DROP COLUMN IF EXISTS selected_properties CASCADE,
DROP COLUMN IF EXISTS interested_properties CASCADE,
DROP COLUMN IF EXISTS hold_properties CASCADE;

-- Add columns with correct UUID[] type
ALTER TABLE contacts 
ADD COLUMN selected_properties UUID[] DEFAULT '{}',
ADD COLUMN interested_properties UUID[] DEFAULT '{}',
ADD COLUMN hold_properties UUID[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN contacts.selected_properties IS 'Array of property IDs (UUID) selected for site visit';
COMMENT ON COLUMN contacts.interested_properties IS 'Array of property IDs (UUID) customer is interested in';
COMMENT ON COLUMN contacts.hold_properties IS 'Array of property IDs (UUID) customer wants to hold decision on';

-- Verify the changes
SELECT column_name, data_type, udt_name
FROM information_schema.columns 
WHERE table_name = 'contacts' 
AND column_name IN ('selected_properties', 'interested_properties', 'hold_properties');
