-- Supabase database tam kurulum
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- UUID extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services tablosunu oluştur (varsa atla)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services i18n tablosunu oluştur
CREATE TABLE IF NOT EXISTS services_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, locale)
);

-- Listings tablosu (ürün/ilan detayları için)
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  location VARCHAR(200),
  price_per_day INTEGER,
  price_per_week INTEGER,
  min_rental_days INTEGER DEFAULT 1,
  max_guests INTEGER,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, slug)
);

-- Listings i18n tablosu
CREATE TABLE IF NOT EXISTS listings_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  features_text TEXT,
  location_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, locale)
);

-- Önce var olan reservations tablosunu kaldır (eğer varsa)
DROP TABLE IF EXISTS reservations CASCADE;

-- Reservations tablosu - UUID tipleri ile
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price INTEGER,
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing availability tablosu da kaldır ve yeniden oluştur
DROP TABLE IF EXISTS listing_availability CASCADE;

-- Listing availability tablosu - UUID tipleri ile
CREATE TABLE listing_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price INTEGER,
  min_nights INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, date)
);

-- Admin users tablosunu oluştur
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_i18n_updated_at BEFORE UPDATE ON services_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_i18n_updated_at BEFORE UPDATE ON listings_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listing_availability_updated_at BEFORE UPDATE ON listing_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Services data insert
INSERT INTO services (id, name, slug, description, icon, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Rent a Car', 'rent-a-car', 'Car rental services', 'car', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'VIP Transfer', 'vip-transfer', 'VIP transfer services', 'plane', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Boat Rental', 'boat-rental', 'Boat and yacht rental', 'anchor', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Villa Rental', 'villa-rental', 'Villa rental services', 'home', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Properties for Sale', 'properties-for-sale', 'Real estate sales services', 'building', 5)
ON CONFLICT (slug) DO NOTHING;

-- Services i18n data - Turkish
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'tr', 'Araç Kiralama', 'arac-kiralama', 
   'Ekonomik, orta sınıf, üst segment ve ATV/Jeep seçenekleri ile ihtiyacınıza uygun araç kiralayın.',
   'Antalya''da araç kiralama konusunda uzman ekibimizle, geniş araç filomuzdan size en uygun seçeneği sunuyoruz.',
   'Antalya Araç Kiralama | RentBuy Antalya',
   'Antalya''da güvenilir araç kiralama hizmeti. Ekonomik fiyatlar, geniş araç filosu.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'tr', 'VIP Transfer', 'vip-transfer',
   'Havalimanı karşılama, şehir içi ve bölgesel transferleriniz için VIP hizmet.',
   'Antalya Havalimanı''ndan otel ve konaklama yerinize kadar konforlu ve güvenli VIP transfer hizmeti sunuyoruz.',
   'Antalya VIP Transfer | Havalimanı Transfer',
   'Antalya Havalimanı VIP transfer hizmeti. 7/24 güvenli ve konforlu ulaşım.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'tr', 'Tekne Kiralama', 'tekne-kiralama',
   'Günlük turlar ve lüks yat kiralama ile denizin tadını çıkarın.',
   'Antalya''nın muhteşem koylarını keşfetmek için günlük tekne turları ve özel yat kiralama hizmetimiz var.',
   'Antalya Tekne Kiralama | Yat Turu',
   'Antalya tekne kiralama ve yat turu hizmetleri. Günlük turlar, özel yat kiralama.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'tr', 'Villa Kiralama', 'villa-kiralama',
   'Antalya, Kaş, Bodrum ve Fethiye''de lüks villa kiralama seçenekleri.',
   'Muhteşem manzaralı, özel havuzlu lüks villalarımızda unutulmaz bir tatil geçirin.',
   'Antalya Villa Kiralama | Lüks Tatil Villaları',
   'Antalya, Kaş, Bodrum ve Fethiye''de lüks villa kiralama.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'tr', 'Satılık Konutlar', 'satilik-konutlar',
   'Antalya ve çevresinde satılık daire, villa ve arsa seçenekleri.',
   'Antalya''nın en değerli lokasyonlarında yatırım fırsatları ve yaşamak için ideal konutlar.',
   'Antalya Satılık Konut | Emlak Yatırım Fırsatları',
   'Antalya satılık daire, villa ve arsa. Deniz manzaralı konutlar, yatırım fırsatları.'
  )
ON CONFLICT (service_id, locale) DO NOTHING;

-- Sample listings ekle
INSERT INTO listings (id, service_id, name, slug, description, images, features, location, price_per_day, price_per_week, max_guests, active, sort_order) VALUES 
  -- Villa Rental listings
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440004', 'Luxury Villa with Sea View', 'luxury-villa-sea-view', 
   'Beautiful 4-bedroom villa with private pool and stunning sea views', 
   '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
   '["private_pool", "sea_view", "wifi", "air_conditioning", "kitchen", "parking", "garden", "bbq"]',
   'Antalya, Lara Beach', 1500, 9000, 8, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440004', 'Cozy Mountain Villa', 'cozy-mountain-villa',
   'Peaceful 3-bedroom villa nestled in the mountains with panoramic views',
   '["https://images.unsplash.com/photo-1502175353174-a7a70e4264f2?w=800", "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800"]',
   '["mountain_view", "fireplace", "wifi", "kitchen", "parking", "terrace", "hiking"]',
   'Antalya, Kemer', 800, 5000, 6, true, 2
  ),
  -- Car Rental listings
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'BMW 3 Series', 'bmw-3-series',
   'Luxury sedan perfect for business trips and comfortable city driving',
   '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800"]',
   '["automatic", "gps", "bluetooth", "leather_seats", "sunroof", "cruise_control"]',
   'Antalya Airport', 350, 2100, 5, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Fiat Egea', 'fiat-egea',
   'Economic and reliable car for daily city driving',
   '["https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"]',
   '["manual", "air_conditioning", "radio", "fuel_efficient"]',
   'Antalya City Center', 150, 900, 5, true, 2
  ),
  -- Boat Rental listings
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', 'Luxury Yacht Charter', 'luxury-yacht-charter',
   'Premium yacht with professional crew for unforgettable sea experience',
   '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800"]',
   '["professional_crew", "catering", "snorkeling", "fishing", "sundeck", "cabin"]',
   'Antalya Marina', 2500, 15000, 12, true, 1
  )
ON CONFLICT (service_id, slug) DO NOTHING;

-- Sample listing i18n - Turkish
INSERT INTO listings_i18n (listing_id, locale, title, slug, description, features_text, location_details) VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'tr', 'Deniz Manzaralı Lüks Villa', 'deniz-manzarali-luks-villa',
   'Özel havuzlu ve muhteşem deniz manzaralı 4 yatak odalı güzel villa',
   'Özel havuz, deniz manzarası, WiFi, klima, mutfak, otopark, bahçe, barbekü',
   'Antalya, Lara Plajı yakınında, plaja 5 dakika mesafede'
  ),
  ('550e8400-e29b-41d4-a716-446655440102', 'tr', 'Dağ Evi Villası', 'dag-evi-villasi',
   'Panoramik manzaralı dağlarda sakin 3 yatak odalı villa',
   'Dağ manzarası, şömine, WiFi, mutfak, otopark, teras, doğa yürüyüşü',
   'Antalya, Kemer bölgesinde doğanın içinde'
  ),
  ('550e8400-e29b-41d4-a716-446655440201', 'tr', 'BMW 3 Serisi', 'bmw-3-serisi',
   'İş seyahatleri ve konforlu şehir içi sürüş için lüks sedan',
   'Otomatik vites, GPS, Bluetooth, deri koltuk, sunroof, hız sabitleyici',
   'Antalya Havalimanı teslim noktası'
  ),
  ('550e8400-e29b-41d4-a716-446655440202', 'tr', 'Fiat Egea', 'fiat-egea',
   'Günlük şehir içi sürüş için ekonomik ve güvenilir araç',
   'Manuel vites, klima, radyo, yakıt tasarruflu',
   'Antalya şehir merkezi teslim noktası'
  ),
  ('550e8400-e29b-41d4-a716-446655440301', 'tr', 'Lüks Yat Kiralama', 'luks-yat-kiralama',
   'Unutulmaz deniz deneyimi için profesyonel mürettebatlı premium yat',
   'Profesyonel mürettebat, catering, şnorkel, balık tutma, güneşlenme güvertesi, kabin',
   'Antalya Marina''dan hareket'
  )
ON CONFLICT (listing_id, locale) DO NOTHING;

-- Admin user ekle
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES 
  ('admin@rentbuyantalya.com', '$2b$10$kqlcQg7iVeusoT3md6wBzORzqzSSwkGJXYYY6lZ/HrsSfDA0VsA9m', 'Admin User', 'super_admin')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = true,
  updated_at = NOW();

-- Indexes oluştur
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_i18n_locale ON services_i18n(locale);
CREATE INDEX IF NOT EXISTS idx_services_i18n_slug ON services_i18n(slug);
CREATE INDEX IF NOT EXISTS idx_listings_service ON listings(service_id);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(active);
CREATE INDEX IF NOT EXISTS idx_listings_i18n_locale ON listings_i18n(locale);
CREATE INDEX IF NOT EXISTS idx_listings_i18n_slug ON listings_i18n(slug);
CREATE INDEX IF NOT EXISTS idx_reservations_listing ON reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_availability_listing ON listing_availability(listing_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON listing_availability(date);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Kontrol sorguları
SELECT 'Services' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'Services i18n', COUNT(*) FROM services_i18n  
UNION ALL
SELECT 'Listings', COUNT(*) FROM listings
UNION ALL
SELECT 'Listings i18n', COUNT(*) FROM listings_i18n
UNION ALL
SELECT 'Admin users', COUNT(*) FROM admin_users;