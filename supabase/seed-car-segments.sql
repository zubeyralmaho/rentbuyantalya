-- Seed car segments with consistent slugs matching the admin form and public page
-- This ensures the segment dropdown in admin matches what's displayed on the public car rental page

-- Create car_segments table if it doesn't exist
CREATE TABLE IF NOT EXISTS car_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add optional columns if they don't exist (graceful schema evolution)
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE car_segments ADD COLUMN active BOOLEAN DEFAULT true;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN name VARCHAR(100);
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN icon VARCHAR(100);
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN price_range_min INTEGER;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN price_range_max INTEGER;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN features JSONB DEFAULT '[]'::jsonb;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
  
  BEGIN
    ALTER TABLE car_segments ADD COLUMN sort_order INTEGER DEFAULT 0;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Column already exists, do nothing
  END;
END $$;

-- Insert base segments with only guaranteed columns first (slug only, let id auto-generate)
-- This avoids type conflicts between UUID and INTEGER id columns
INSERT INTO car_segments (slug) 
VALUES 
  ('economic'),
  ('mid-class'),
  ('comfort'),
  ('premium'),
  ('atv-jeep')
ON CONFLICT (slug) DO NOTHING;

-- Try to update with extended columns if they exist
DO $$
BEGIN
  -- Try to update with active column
  BEGIN
    UPDATE car_segments SET 
      active = true
    WHERE slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep');
  EXCEPTION
    WHEN undefined_column THEN
      -- active column doesn't exist, skip
  END;

  -- Try to update with name column
  BEGIN
    UPDATE car_segments SET 
      name = CASE slug
        WHEN 'economic' THEN 'Economic'
        WHEN 'mid-class' THEN 'Mid-Class'
        WHEN 'comfort' THEN 'Comfort'
        WHEN 'premium' THEN 'Premium'
        WHEN 'atv-jeep' THEN 'ATV JEEP'
      END
    WHERE slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep');
  EXCEPTION
    WHEN undefined_column THEN
      -- name column doesn't exist, skip
  END;

  -- Try to update with other optional columns
  BEGIN
    UPDATE car_segments SET 
      icon = CASE slug
        WHEN 'economic' THEN '💰'
        WHEN 'mid-class' THEN '🚗'
        WHEN 'comfort' THEN '✨'
        WHEN 'premium' THEN '🏎️'
        WHEN 'atv-jeep' THEN '🛻'
      END,
      price_range_min = CASE slug
        WHEN 'economic' THEN 20
        WHEN 'mid-class' THEN 40
        WHEN 'comfort' THEN 70
        WHEN 'premium' THEN 100
        WHEN 'atv-jeep' THEN 80
      END,
      price_range_max = CASE slug
        WHEN 'economic' THEN 50
        WHEN 'mid-class' THEN 80
        WHEN 'comfort' THEN 120
        WHEN 'premium' THEN 200
        WHEN 'atv-jeep' THEN 150
      END,
      sort_order = CASE slug
        WHEN 'economic' THEN 1
        WHEN 'mid-class' THEN 2
        WHEN 'comfort' THEN 3
        WHEN 'premium' THEN 4
        WHEN 'atv-jeep' THEN 5
      END
    WHERE slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep');
  EXCEPTION
    WHEN undefined_column THEN
      -- Optional columns don't exist, skip
  END;

  -- Try to update features if jsonb column exists
  BEGIN
    UPDATE car_segments SET 
      features = CASE slug
        WHEN 'economic' THEN '["fuel_efficient", "compact", "budget_friendly"]'::jsonb
        WHEN 'mid-class' THEN '["automatic_transmission", "gps", "bluetooth"]'::jsonb
        WHEN 'comfort' THEN '["comfort", "wide_body", "large_trunk"]'::jsonb
        WHEN 'premium' THEN '["leather_seats", "premium_sound", "sunroof"]'::jsonb
        WHEN 'atv-jeep' THEN '["4wd", "off_road", "adventure"]'::jsonb
      END
    WHERE slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep');
  EXCEPTION
    WHEN undefined_column THEN
      -- features column doesn't exist, skip
  END;
END $$;

-- Create car_segments_i18n table if it doesn't exist
CREATE TABLE IF NOT EXISTS car_segments_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  segment_id UUID REFERENCES car_segments(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(segment_id, locale)
);

-- Insert Turkish translations
INSERT INTO car_segments_i18n (segment_id, locale, title, slug, summary, body) 
SELECT cs.id, 'tr', 
  CASE cs.slug
    WHEN 'economic' THEN 'Ekonomik'
    WHEN 'mid-class' THEN 'Orta Sınıf'
    WHEN 'comfort' THEN 'Konforlu'
    WHEN 'premium' THEN 'Premium'
    WHEN 'atv-jeep' THEN 'ATV JEEP'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'ekonomik'
    WHEN 'mid-class' THEN 'orta-sinif'
    WHEN 'comfort' THEN 'konforlu'
    WHEN 'premium' THEN 'premium'
    WHEN 'atv-jeep' THEN 'atv-jeep'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Şehir içi ve kısa seyahatler için en uygun fiyatlı araçlar'
    WHEN 'mid-class' THEN 'Konfor ve ekonomi dengesini sunan modeller'
    WHEN 'comfort' THEN 'Üst düzey konfor ve teknolojiye sahip araçlar'
    WHEN 'premium' THEN 'Lüks ve prestij segmenti'
    WHEN 'atv-jeep' THEN 'Macera ve off-road deneyimi için ATV ve Jeep'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Yakıt tasarruflu ve kompakt araçlar'
    WHEN 'mid-class' THEN 'Otomatik vites, GPS ve Bluetooth özellikli araçlar'
    WHEN 'comfort' THEN 'Geniş bagaj ve konfor özellikleri'
    WHEN 'premium' THEN 'Deri koltuk, premium ses sistemi ve sunroof'
    WHEN 'atv-jeep' THEN '4x4 ve off-road macera araçları'
  END
FROM car_segments cs
WHERE cs.slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep')
ON CONFLICT (segment_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body;

-- Insert English translations
INSERT INTO car_segments_i18n (segment_id, locale, title, slug, summary, body) 
SELECT cs.id, 'en', 
  CASE cs.slug
    WHEN 'economic' THEN 'Economic'
    WHEN 'mid-class' THEN 'Mid-Class'
    WHEN 'comfort' THEN 'Comfort'
    WHEN 'premium' THEN 'Premium'
    WHEN 'atv-jeep' THEN 'ATV JEEP'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'economic'
    WHEN 'mid-class' THEN 'mid-class'
    WHEN 'comfort' THEN 'comfort'
    WHEN 'premium' THEN 'premium'
    WHEN 'atv-jeep' THEN 'atv-jeep'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Most affordable cars for city and short trips'
    WHEN 'mid-class' THEN 'Balance of comfort and economy'
    WHEN 'comfort' THEN 'High-level comfort and technology'
    WHEN 'premium' THEN 'Luxury and prestige segment'
    WHEN 'atv-jeep' THEN 'Adventure and off-road experience'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Fuel-efficient and compact vehicles'
    WHEN 'mid-class' THEN 'Cars with automatic transmission, GPS and Bluetooth'
    WHEN 'comfort' THEN 'Spacious with comfort features'
    WHEN 'premium' THEN 'Leather seats, premium sound system and sunroof'
    WHEN 'atv-jeep' THEN '4x4 and off-road adventure vehicles'
  END
FROM car_segments cs
WHERE cs.slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep')
ON CONFLICT (segment_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body;

-- Insert Russian translations
INSERT INTO car_segments_i18n (segment_id, locale, title, slug, summary, body) 
SELECT cs.id, 'ru', 
  CASE cs.slug
    WHEN 'economic' THEN 'Эконом'
    WHEN 'mid-class' THEN 'Средний класс'
    WHEN 'comfort' THEN 'Комфорт'
    WHEN 'premium' THEN 'Премиум'
    WHEN 'atv-jeep' THEN 'ATV JEEP'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'econom'
    WHEN 'mid-class' THEN 'sredniy-klass'
    WHEN 'comfort' THEN 'komfort'
    WHEN 'premium' THEN 'premium'
    WHEN 'atv-jeep' THEN 'atv-jeep'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Самые доступные автомобили для города и коротких поездок'
    WHEN 'mid-class' THEN 'Баланс комфорта и экономии'
    WHEN 'comfort' THEN 'Высокий уровень комфорта и технологий'
    WHEN 'premium' THEN 'Сегмент роскоши и престижа'
    WHEN 'atv-jeep' THEN 'Приключения и внедорожный опыт'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'Топливосберегающие и компактные автомобили'
    WHEN 'mid-class' THEN 'Автомобили с автоматической коробкой передач, GPS и Bluetooth'
    WHEN 'comfort' THEN 'Просторные с функциями комфорта'
    WHEN 'premium' THEN 'Кожаные сиденья, премиальная аудиосистема и люк'
    WHEN 'atv-jeep' THEN 'Полноприводные и внедорожные автомобили'
  END
FROM car_segments cs
WHERE cs.slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep')
ON CONFLICT (segment_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body;

-- Insert Arabic translations
INSERT INTO car_segments_i18n (segment_id, locale, title, slug, summary, body) 
SELECT cs.id, 'ar', 
  CASE cs.slug
    WHEN 'economic' THEN 'اقتصادي'
    WHEN 'mid-class' THEN 'الفئة المتوسطة'
    WHEN 'comfort' THEN 'راحة'
    WHEN 'premium' THEN 'بريميوم'
    WHEN 'atv-jeep' THEN 'ATV JEEP'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'iqtisadi'
    WHEN 'mid-class' THEN 'alfiat-almutawasita'
    WHEN 'comfort' THEN 'raha'
    WHEN 'premium' THEN 'premium'
    WHEN 'atv-jeep' THEN 'atv-jeep'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'السيارات الأكثر بأسعار معقولة للمدينة والرحلات القصيرة'
    WHEN 'mid-class' THEN 'توازن الراحة والاقتصاد'
    WHEN 'comfort' THEN 'مستوى عالٍ من الراحة والتكنولوجيا'
    WHEN 'premium' THEN 'قطاع الفخامة والمكانة'
    WHEN 'atv-jeep' THEN 'مغامرة وتجربة الطرق الوعرة'
  END,
  CASE cs.slug
    WHEN 'economic' THEN 'مركبات موفرة للوقود ومدمجة'
    WHEN 'mid-class' THEN 'سيارات بناقل حركة أوتوماتيكي و GPS و Bluetooth'
    WHEN 'comfort' THEN 'واسع مع ميزات الراحة'
    WHEN 'premium' THEN 'مقاعد جلدية ونظام صوتي متميز وفتحة سقف'
    WHEN 'atv-jeep' THEN 'مركبات دفع رباعي وطرق وعرة'
  END
FROM car_segments cs
WHERE cs.slug IN ('economic', 'mid-class', 'comfort', 'premium', 'atv-jeep')
ON CONFLICT (segment_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body;