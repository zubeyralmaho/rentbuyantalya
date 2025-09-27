-- Database şemasını storage kullanımı için güncelle (Fixed)
-- image_url alanlarını storage_path'e çevir
-- admin_users tablosunu kullanır

-- 1. Services tablosu güncelle
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'services';

-- 2. Listings tabloları güncelle  
ALTER TABLE villa_rental_listings 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'listings';

ALTER TABLE car_rental_listings 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'listings';

ALTER TABLE boat_rental_listings 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'listings';

ALTER TABLE vip_transfer_listings 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'listings';

ALTER TABLE properties_for_sale_listings 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'listings';

-- 3. Pages tablosu güncelle
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'pages';

-- 4. Campaigns tablosu güncelle
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'pages';

-- 5. Blog posts tablosu güncelle
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS storage_bucket TEXT DEFAULT 'blog';

-- 6. Çoklu resim desteği için images tablosu oluştur
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL,
  listing_type TEXT NOT NULL, -- 'villa_rental', 'car_rental', etc.
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'listings',
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Content images tablosu (pages, blog, campaigns için)
CREATE TABLE IF NOT EXISTS content_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'page', 'blog', 'campaign'
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. İndeksler ekle
CREATE INDEX IF NOT EXISTS idx_listing_images_listing 
ON listing_images(listing_id, listing_type);

CREATE INDEX IF NOT EXISTS idx_listing_images_featured 
ON listing_images(listing_id, is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_content_images_content 
ON content_images(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_content_images_featured 
ON content_images(content_id, is_featured) WHERE is_featured = true;

-- 9. Updated_at trigger'ları ekle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listing_images_updated_at 
  BEFORE UPDATE ON listing_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_images_updated_at 
  BEFORE UPDATE ON content_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. RLS policies ekle
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_images ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Public read access for listing images"
ON listing_images FOR SELECT
USING (true);

CREATE POLICY "Public read access for content images"
ON content_images FOR SELECT
USING (true);

-- Sadece adminler değiştirebilir
CREATE POLICY "Admin full access for listing images"
ON listing_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' AND active = true
  )
);

CREATE POLICY "Admin full access for content images"
ON content_images FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' AND active = true
  )
);