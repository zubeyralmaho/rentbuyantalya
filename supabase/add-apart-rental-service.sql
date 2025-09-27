-- Add Apart Rental service to Supabase database
-- Run this in Supabase SQL Editor

-- Insert apart rental service
INSERT INTO services (id, name, slug, description, icon, active, sort_order, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'Apart Rental',
  'apart-rental', 
  'Apartment rental services',
  'building',
  true,
  6,
  NOW(),
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert Turkish translations
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'tr',
  'Apart Kiralama',
  'apart-kiralama',
  'Antalya ve çevresinde günlük, haftalık ve aylık apart kiralama seçenekleri.',
  'Antalya''nın en güzel lokasyonlarında bulunan, tam donanımlı apart dairelerimizde konforlu bir konaklama deneyimi yaşayın. Kısa süreli tatilden uzun süreli konaklamaya kadar tüm ihtiyaçlarınıza uygun seçeneklerimiz mevcuttur. Studio dairelerden geniş aile apart dairelerine kadar çeşitli seçenekler sunuyoruz.',
  'Antalya Apart Kiralama | RentBuy Antalya',
  'Antalya''da günlük, haftalık ve aylık apart kiralama hizmetleri. Tam donanımlı, merkezi konumlarda, ekonomik fiyatlarla.',
  NOW(),
  NOW()
) ON CONFLICT (service_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- Insert English translations
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'en',
  'Apartment Rental',
  'apartment-rental',
  'Daily, weekly and monthly apartment rental options in Antalya and surrounding areas.',
  'Experience comfortable accommodation in our fully equipped apartment units located in the most beautiful locations of Antalya. We have options suitable for all your needs, from short-term holidays to long-term stays. We offer various options from studio apartments to spacious family apartment units.',
  'Antalya Apartment Rental | RentBuy Antalya',
  'Daily, weekly and monthly apartment rental services in Antalya. Fully equipped, central locations, affordable prices.',
  NOW(),
  NOW()
) ON CONFLICT (service_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- Insert Russian translations
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'ru',
  'Аренда квартир',
  'arenda-kvartir',
  'Варианты аренды квартир на день, неделю и месяц в Анталье и окрестностях.',
  'Испытайте комфортное размещение в наших полностью оборудованных квартирах, расположенных в самых красивых местах Антальи. У нас есть варианты, подходящие для всех ваших потребностей, от краткосрочного отдыха до длительного проживания. Мы предлагаем различные варианты от студий до просторных семейных квартир.',
  'Аренда квартир в Анталье | RentBuy Antalya',
  'Услуги аренды квартир на день, неделю и месяц в Анталье. Полностью оборудованные, центральные локации, доступные цены.',
  NOW(),
  NOW()
) ON CONFLICT (service_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- Insert Arabic translations
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'ar',
  'تأجير الشقق',
  'taajir-alshiqaq',
  'خيارات تأجير الشقق اليومية والأسبوعية والشهرية في أنطاليا والمناطق المحيطة.',
  'استمتع بإقامة مريحة في وحدات الشقق المجهزة بالكامل والواقعة في أجمل مواقع أنطاليا. لدينا خيارات مناسبة لجميع احتياجاتك، من العطلات قصيرة المدى إلى الإقامات طويلة المدى. نقدم خيارات متنوعة من الشقق الاستوديو إلى وحدات الشقق العائلية الواسعة.',
  'تأجير الشقق في أنطاليا | RentBuy Antalya',
  'خدمات تأجير الشقق اليومية والأسبوعية والشهرية في أنطاليا. مجهزة بالكامل، مواقع مركزية، أسعار معقولة.',
  NOW(),
  NOW()
) ON CONFLICT (service_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();

-- Verify the insert
SELECT s.*, si.locale, si.title, si.slug as i18n_slug
FROM services s
LEFT JOIN services_i18n si ON s.id = si.service_id
WHERE s.slug = 'apart-rental'
ORDER BY si.locale;