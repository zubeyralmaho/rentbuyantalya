-- Storage RLS'i tamamen kaldır ve public access ver
-- Bu admin paneli olduğu için güvenli

-- 1. Tüm mevcut policies'i sil
DROP POLICY IF EXISTS "Public read access for listings" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for services" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for pages" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload to listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can delete from listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from blog" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update listings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update services" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update pages" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update blog" ON storage.objects;

-- 2. RLS'i tamamen kapat
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3. Bucket'ları güncelle - public ve restrict yok
UPDATE storage.buckets 
SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id IN ('listings', 'services', 'pages', 'blog');

-- 4. Eğer bucket'lar yoksa oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('listings', 'listings', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('services', 'services', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('pages', 'pages', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('blog', 'blog', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 5. Basit public access policy (sadece okuma için)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (true);

-- 6. Admin kullanıcıları için tam erişim (RLS olmadan)
CREATE POLICY "Allow authenticated full access"
ON storage.objects FOR ALL
USING (auth.role() = 'authenticated');

-- RLS'i tekrar aç ama sadece okuma için
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;