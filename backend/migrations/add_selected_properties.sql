-- Add columns to store selected, interested, and hold properties for clients
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS selected_properties UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interested_properties UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hold_properties UUID[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN contacts.selected_properties IS 'Array of property IDs (UUID) selected for site visit';
COMMENT ON COLUMN contacts.interested_properties IS 'Array of property IDs (UUID) customer is interested in';
COMMENT ON COLUMN contacts.hold_properties IS 'Array of property IDs (UUID) customer wants to hold decision on';
