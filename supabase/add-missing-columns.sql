-- Add missing columns to listings table to match API expectations
-- This will make the API work without retry fallbacks

-- Add segment_id column (crucial for car segments)
-- Using INTEGER type to match car_segments.id
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS segment_id INTEGER REFERENCES car_segments(id) ON DELETE SET NULL;

-- Add metadata column for storing extra structured data (car specifications, etc.)
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add price range columns for compatibility
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS price_range_min INTEGER;

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS price_range_max INTEGER;

-- Add storage columns for file management
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS storage_paths JSONB DEFAULT '[]'::jsonb;

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100) DEFAULT 'listings';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_segment_id ON listings(segment_id);
CREATE INDEX IF NOT EXISTS idx_listings_price_range ON listings(price_range_min, price_range_max);

-- Update existing records to set price_range from existing price fields
UPDATE listings 
SET 
  price_range_min = COALESCE(price_per_day, 0),
  price_range_max = COALESCE(price_per_week, price_per_month, price_per_day, 0)
WHERE price_range_min IS NULL OR price_range_max IS NULL;

-- Optional: Set a default segment for existing car listings if you have a default segment
-- UPDATE listings 
-- SET segment_id = (SELECT id FROM car_segments WHERE slug = 'mid-class' LIMIT 1)
-- WHERE service_id = (SELECT id FROM services WHERE slug = 'rent-a-car' LIMIT 1) 
-- AND segment_id IS NULL;