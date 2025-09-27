-- Supabase'de gerekli tabloları oluştur ve admin kullanıcı ekle
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- UUID extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services tablosunu oluştur
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

-- Update trigger function oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update trigger'ları ekle
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_i18n_updated_at BEFORE UPDATE ON services_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Temel servisleri ekle
INSERT INTO services (id, name, slug, description, icon, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Rent a Car', 'rent-a-car', 'Car rental services', 'car', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'VIP Transfer', 'vip-transfer', 'VIP transfer services', 'plane', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Boat Rental', 'boat-rental', 'Boat and yacht rental', 'anchor', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Villa Rental', 'villa-rental', 'Villa rental services', 'home', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Properties for Sale', 'properties-for-sale', 'Real estate sales services', 'building', 5)
ON CONFLICT (slug) DO NOTHING;

-- Türkçe servis çevirileri ekle
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

-- Admin kullanıcı ekle (eğer yoksa)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES 
  ('admin@rentbuyantalya.com', '$2b$10$kqlcQg7iVeusoT3md6wBzORzqzSSwkGJXYYY6lZ/HrsSfDA0VsA9m', 'Admin User', 'super_admin')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = true,
  updated_at = NOW();

-- Sonuçları kontrol et
SELECT 'Services:' as table_name, COUNT(*) as count FROM services
UNION ALL
SELECT 'Services i18n:', COUNT(*) FROM services_i18n  
UNION ALL
SELECT 'Admin users:', COUNT(*) FROM admin_users;