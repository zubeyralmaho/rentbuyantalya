-- Temporary fix for storage RLS policies
-- Bu dosya authentication kontrolleri olmadan storage access sağlar

-- Mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Authenticated users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can delete listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete blog" ON storage.objects;

-- Basit upload policy'leri (geçici, development için)
CREATE POLICY "Allow upload to listings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Allow upload to services"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'services');

CREATE POLICY "Allow upload to pages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pages');

CREATE POLICY "Allow upload to blog"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog');

-- Update policy'leri
CREATE POLICY "Allow update in listings"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listings')
WITH CHECK (bucket_id = 'listings');

CREATE POLICY "Allow update in services"
ON storage.objects FOR UPDATE
USING (bucket_id = 'services')
WITH CHECK (bucket_id = 'services');

CREATE POLICY "Allow update in pages"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pages')
WITH CHECK (bucket_id = 'pages');

CREATE POLICY "Allow update in blog"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog')
WITH CHECK (bucket_id = 'blog');

-- Delete policy'leri
CREATE POLICY "Allow delete in listings"
ON storage.objects FOR DELETE
USING (bucket_id = 'listings');

CREATE POLICY "Allow delete in services"
ON storage.objects FOR DELETE
USING (bucket_id = 'services');

CREATE POLICY "Allow delete in pages"
ON storage.objects FOR DELETE
USING (bucket_id = 'pages');

CREATE POLICY "Allow delete in blog"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog');

-- RLS'i etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;