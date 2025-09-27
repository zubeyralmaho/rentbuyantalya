-- Update listings table to support apart rental features
-- Run this before add-apart-rental-listings.sql

-- Add new columns to listings table for apart rental
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS price_per_day INTEGER,
ADD COLUMN IF NOT EXISTS price_per_week INTEGER, 
ADD COLUMN IF NOT EXISTS price_per_month INTEGER,
ADD COLUMN IF NOT EXISTS max_guests INTEGER,
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update listings_i18n table to include location details
ALTER TABLE listings_i18n 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location_details TEXT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'listings' 
ORDER BY ordinal_position;