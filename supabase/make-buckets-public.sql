-- Update storage buckets to be completely public
-- Run this in Supabase Dashboard > SQL Editor

-- Make all buckets public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('listings', 'services', 'pages', 'blog');

-- Show bucket status
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('listings', 'services', 'pages', 'blog');