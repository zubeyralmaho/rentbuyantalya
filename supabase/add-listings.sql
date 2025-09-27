-- Sample listings ekleme scripti
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- Listings tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  price_range_min INTEGER,
  price_range_max INTEGER,
  daily_price INTEGER,
  location VARCHAR(200),
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, slug)
);

-- Update trigger ekle
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample listings ekle
INSERT INTO listings (service_id, name, slug, images, features, price_range_min, price_range_max, daily_price, location, description) VALUES 

-- Rent a Car listings
('550e8400-e29b-41d4-a716-446655440001', 'Ekonomik Araç - Fiat Egea', 'fiat-egea', 
 '["https://example.com/fiat-egea-1.jpg", "https://example.com/fiat-egea-2.jpg"]'::jsonb,
 '["klimali", "manuel_vites", "4_kapi", "yakit_tasarruflu"]'::jsonb,
 150, 250, 200, 'Antalya Merkez', 
 'Şehir içi kullanım için ideal, yakıt tasarruflu ekonomik araç. Kliması ve tüm konfor özellikleri mevcut.'),

('550e8400-e29b-41d4-a716-446655440001', 'Lüks SUV - BMW X3', 'bmw-x3',
 '["https://example.com/bmw-x3-1.jpg", "https://example.com/bmw-x3-2.jpg"]'::jsonb,
 '["otomatik_vites", "deri_koltuk", "gps", "bluetooth", "sunroof"]'::jsonb,
 800, 1200, 1000, 'Antalya Havalimanı',
 'Premium SUV deneyimi yaşamak isteyenler için mükemmel seçim. Tam donanımlı lüks araç.'),

-- VIP Transfer listings  
('550e8400-e29b-41d4-a716-446655440002', 'Havalimanı VIP Transfer', 'havalimani-vip-transfer',
 '["https://example.com/vip-transfer-1.jpg", "https://example.com/vip-transfer-2.jpg"]'::jsonb,
 '["profesyonel_sofor", "luks_arac", "24_7", "karsilama_servisi"]'::jsonb,
 200, 400, 300, 'Antalya Havalimanı - Oteller',
 'Antalya Havalimanından otel veya konaklama yerinize kadar konforlu ve güvenli VIP transfer hizmeti.'),

('550e8400-e29b-41d4-a716-446655440002', 'Özel Şehir Turu', 'ozel-sehir-turu',
 '["https://example.com/city-tour-1.jpg", "https://example.com/city-tour-2.jpg"]'::jsonb,
 '["rehber", "klima", "su_ikram", "esnek_program"]'::jsonb,
 500, 800, 650, 'Antalya Merkezi Yerler',
 'Antalyanın tarihi ve turistik yerlerini gezmek için özel araç ve rehber eşliğinde şehir turu.'),

-- Boat Rental listings
('550e8400-e29b-41d4-a716-446655440003', 'Günlük Tekne Turu', 'gunluk-tekne-turu',
 '["https://example.com/boat-tour-1.jpg", "https://example.com/boat-tour-2.jpg"]'::jsonb,
 '["kaptan", "yakit_dahil", "yemek", "snorkel", "muzik_sistemi"]'::jsonb,
 2500, 4000, 3200, 'Antalya Marina',
 'Antalyanın muhteşem koylarını keşfedin. Kaptan eşliğinde günlük tekne turu, yemek ve aktiviteler dahil.'),

('550e8400-e29b-41d4-a716-446655440003', 'Lüks Yat Kiralama', 'luks-yat-kiralama',
 '["https://example.com/yacht-1.jpg", "https://example.com/yacht-2.jpg"]'::jsonb,
 '["luks_kabinler", "jakuzi", "chef", "bar", "su_sporlari"]'::jsonb,
 8000, 15000, 12000, 'Antalya Marina',
 'Lüks yat ile unutulmaz bir deniz tatili. Chef eşliğinde özel menüler, jakuzi, bar ve su sporları imkanı.'),

-- Villa Rental listings
('550e8400-e29b-41d4-a716-446655440004', 'Deniz Manzaralı Villa - Kaş', 'kas-deniz-manzarali-villa',
 '["https://example.com/kas-villa-1.jpg", "https://example.com/kas-villa-2.jpg"]'::jsonb,
 '["ozel_havuz", "deniz_manzarasi", "wifi", "klima", "mutfak", "bahce"]'::jsonb,
 3000, 5000, 4000, 'Kaş, Antalya',
 'Kaş merkezinde, muhteşem deniz manzaralı 4 yatak odalı lüks villa. Özel havuz, bahçe ve tam mutfak.'),

('550e8400-e29b-41d4-a716-446655440004', 'Luxury Villa Antalya', 'luxury-villa-antalya',
 '["https://example.com/antalya-villa-1.jpg", "https://example.com/antalya-villa-2.jpg"]'::jsonb,
 '["infinity_havuz", "spa", "fitness", "chef_mutfagi", "deniz_manzarasi"]'::jsonb,
 5000, 8000, 6500, 'Lara, Antalya',
 'Ultra lüks villa kompleksi. Infinity havuz, spa, fitness center ve özel chef mutfağı. 6 yatak odası.'),

-- Properties for Sale listings
('550e8400-e29b-41d4-a716-446655440005', 'Denize Sıfır Daire - Lara', 'lara-denize-sifir-daire',
 '["https://example.com/lara-apartment-1.jpg", "https://example.com/lara-apartment-2.jpg"]'::jsonb,
 '["deniz_manzarasi", "2+1", "site_icinde", "otopark", "asansor"]'::jsonb,
 800000, 1200000, NULL, 'Lara Plajı, Antalya',
 'Lara plajına yürüme mesafesinde, deniz manzaralı 2+1 daire. Site içinde havuz, spor salonu mevcut.'),

('550e8400-e29b-41d4-a716-446655440005', 'Yatırımlık Villa - Belek', 'belek-yatirimlik-villa',
 '["https://example.com/belek-villa-1.jpg", "https://example.com/belek-villa-2.jpg"]'::jsonb,
 '["golf_sahasi", "4+1", "ozel_havuz", "bahce", "otopark"]'::jsonb,
 2500000, 3500000, NULL, 'Belek, Antalya',
 'Golf sahası yakınında yatırımlık villa. 4+1, özel havuz, büyük bahçe. Yüksek kira getirisi.')

ON CONFLICT (service_id, slug) DO NOTHING;

-- Listings tablosu için index ekle
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_service_slug ON listings(service_id, slug);

-- Kontrol sorgusu
SELECT 
  s.name as service_name,
  l.name as listing_name,
  l.slug,
  l.daily_price,
  l.location
FROM listings l
JOIN services s ON l.service_id = s.id
ORDER BY s.sort_order, l.sort_order;