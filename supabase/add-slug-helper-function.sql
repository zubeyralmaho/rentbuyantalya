-- Helper function to generate next available numbered slug for a service
-- This will be useful for admin panel when adding new listings

CREATE OR REPLACE FUNCTION get_next_listing_slug(service_slug TEXT)
RETURNS TEXT AS $$
DECLARE
    service_prefix TEXT;
    next_number INTEGER;
    result_slug TEXT;
BEGIN
    -- Map service slugs to prefixes
    CASE service_slug
        WHEN 'villa-rental' THEN service_prefix := 'villa';
        WHEN 'rent-a-car' THEN service_prefix := 'car';
        WHEN 'boat-rental' THEN service_prefix := 'yacht';
        WHEN 'vip-transfer' THEN service_prefix := 'transfer';
        WHEN 'properties-for-sale' THEN service_prefix := 'property';
        ELSE service_prefix := 'item';
    END CASE;
    
    -- Find the next available number
    SELECT COALESCE(MAX(
        CASE 
            WHEN slug ~ ('^' || service_prefix || '-[0-9]+$') 
            THEN CAST(SPLIT_PART(slug, '-', 2) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM listings l
    JOIN services s ON l.service_id = s.id
    WHERE s.slug = service_slug;
    
    result_slug := service_prefix || '-' || next_number;
    
    RETURN result_slug;
END;
$$ LANGUAGE plpgsql;

-- Test the function
-- SELECT get_next_listing_slug('villa-rental'); -- Should return 'villa-3'
-- SELECT get_next_listing_slug('rent-a-car'); -- Should return 'car-3'
-- SELECT get_next_listing_slug('boat-rental'); -- Should return 'yacht-2'