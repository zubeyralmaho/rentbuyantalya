-- Disable Storage RLS Completely
-- Run this in Supabase Dashboard > SQL Editor

-- Disable RLS for storage tables
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public read access for listings" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for services" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pages" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog" ON storage.objects;

DROP POLICY IF EXISTS "Allow upload to listings" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to services" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to pages" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload to blog" ON storage.objects;

DROP POLICY IF EXISTS "Allow update in listings" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in services" ON storage.objects; 
DROP POLICY IF EXISTS "Allow update in pages" ON storage.objects;
DROP POLICY IF EXISTS "Allow update in blog" ON storage.objects;

DROP POLICY IF EXISTS "Allow delete in listings" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in services" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in pages" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete in blog" ON storage.objects;