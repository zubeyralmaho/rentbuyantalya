-- Supabase Storage setup for RentBuy Antalya
-- Bu dosya storage bucket'larını ve politikalarını kurar

-- 1. Storage bucket'larını oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listings', 'listings', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('services', 'services', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('pages', 'pages', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('blog', 'blog', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Public access için storage policies
-- Herkes okuyabilir
CREATE POLICY "Public read access for listings"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Public read access for services"
ON storage.objects FOR SELECT
USING (bucket_id = 'services');

CREATE POLICY "Public read access for pages"
ON storage.objects FOR SELECT
USING (bucket_id = 'pages');

CREATE POLICY "Public read access for blog"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

-- 3. Admin upload/delete permissions
-- Admin kullanıcıları upload edebilir
CREATE POLICY "Authenticated users can upload listings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Authenticated users can upload services"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'services' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Authenticated users can upload pages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pages' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Authenticated users can upload blog"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- 4. Admin delete permissions
CREATE POLICY "Admins can delete listings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can delete services"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'services'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can delete pages"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pages'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can delete blog"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- 5. Admin update permissions
CREATE POLICY "Admins can update listings"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update services"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'services'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update pages"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pages'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admins can update blog"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog'
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid() AND is_active = true
  )
);