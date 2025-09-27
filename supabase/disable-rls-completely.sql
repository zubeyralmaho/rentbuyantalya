-- Disable RLS completely for storage.objects (development only)
-- Bu geçici bir çözüm, production'da güvenlik riski

-- RLS'i devre dışı bırak
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Tüm mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Public read access for listings" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for services" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pages" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog" ON storage.objects;

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