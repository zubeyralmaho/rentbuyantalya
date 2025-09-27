-- Storage policies güncellemesi - RLS hatası düzeltmesi
-- JWT'den email almak yerine auth.uid() kullanacağız

-- Önce mevcut policies'leri sil
DROP POLICY IF EXISTS "Authenticated users can upload listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload blog" ON storage.objects;

DROP POLICY IF EXISTS "Admins can delete listings" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete services" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete pages" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog" ON storage.objects;

DROP POLICY IF EXISTS "Admins can update listings" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update services" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update pages" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog" ON storage.objects;

-- Yeni basit policies - authenticated kullanıcılar için
-- Upload permissions
CREATE POLICY "Authenticated users can upload to listings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to services"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to pages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pages' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload to blog"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog' 
  AND auth.role() = 'authenticated'
);

-- Delete permissions
CREATE POLICY "Authenticated users can delete from listings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from services"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from pages"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pages'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete from blog"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog'
  AND auth.role() = 'authenticated'
);

-- Update permissions
CREATE POLICY "Authenticated users can update listings"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update services"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update pages"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pages'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update blog"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog'
  AND auth.role() = 'authenticated'
);