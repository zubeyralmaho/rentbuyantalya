-- Fix listings table schema - Add all missing columns that the API expects
-- This will resolve the "column listings.daily_price does not exist" error

-- Add pricing columns
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS daily_price INTEGER;

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS price_per_day INTEGER;

-- Add location and description columns  
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS location VARCHAR(200);

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add storage columns if they don't exist
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS storage_paths JSONB DEFAULT '[]'::jsonb;

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100) DEFAULT 'listings';

-- Update existing records to populate the new columns with sensible defaults
UPDATE listings 
SET 
  daily_price = COALESCE(price_range_min, 0),
  price_per_day = COALESCE(price_range_min, 0),
  location = 'Antalya',
  description = COALESCE(name, 'No description available')
WHERE daily_price IS NULL OR price_per_day IS NULL OR location IS NULL OR description IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_daily_price ON listings(daily_price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);

-- Add a comment to track this migration
COMMENT ON COLUMN listings.daily_price IS 'Daily rental price - added to fix API compatibility';
COMMENT ON COLUMN listings.price_per_day IS 'Alternative daily price field - added to fix API compatibility';
COMMENT ON COLUMN listings.location IS 'Location of the listing - added to fix API compatibility';
COMMENT ON COLUMN listings.description IS 'Description of the listing - added to fix API compatibility';