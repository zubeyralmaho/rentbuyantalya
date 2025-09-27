-- Only try to drop policies (no table alterations)
-- Run this in Supabase Dashboard > SQL Editor

-- Drop storage object policies if they exist
DO $$
BEGIN
    -- Drop policies one by one, ignore errors
    BEGIN
        DROP POLICY "Public read access for listings" ON storage.objects;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY "Authenticated users can upload listings" ON storage.objects;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY "Allow upload to listings" ON storage.objects;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    -- Show remaining policies
    RAISE NOTICE 'Remaining policies dropped successfully';
END
$$;