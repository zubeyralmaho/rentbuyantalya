-- Add Apart Rental listings to Supabase database
-- Run this after add-apart-rental-service.sql and update-listings-schema.sql

-- Insert sample apartment listings
INSERT INTO listings (id, service_id, name, slug, description, images, features, price_per_day, price_per_week, max_guests, location, active, sort_order, created_at, updated_at)
VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440006', -- apart-rental service id
    'City Center Luxury Apartment',
    'city-center-luxury-apartment',
    'Modern 2+1 apartment in the heart of Antalya with all amenities',
    '["apartment1.jpg", "apartment1_2.jpg", "apartment1_3.jpg"]'::jsonb,
    '["WiFi", "Air Conditioning", "Full Kitchen", "Washing Machine", "Balcony", "Elevator"]'::jsonb,
    150,
    900,
    4,
    'Antalya Center',
    true,
    1,
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440006',
    'Beach View Apartment',
    'beach-view-apartment',
    'Beautiful 1+1 apartment with sea view in Konyaalti',
    '["apartment2.jpg", "apartment2_2.jpg", "apartment2_3.jpg"]'::jsonb,
    '["Sea View", "WiFi", "Air Conditioning", "Kitchen", "Balcony"]'::jsonb,
    120,
    700,
    2,
    'Konyaalti Beach',
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440006',
    'Family Apartment in Lara',
    'family-apartment-lara',
    'Spacious 3+1 family apartment with all modern amenities',
    '["apartment3.jpg", "apartment3_2.jpg", "apartment3_3.jpg"]'::jsonb,
    '["Large Living Room", "WiFi", "Air Conditioning", "Full Kitchen", "Washing Machine", "Parking"]'::jsonb,
    200,
    1200,
    6,
    'Lara District',
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440006',
    'Modern Studio Apartment',
    'modern-studio-apartment',
    'Compact and modern studio perfect for couples',
    '["apartment4.jpg", "apartment4_2.jpg"]'::jsonb,
    '["Modern Design", "WiFi", "Air Conditioning", "Mini Kitchen"]'::jsonb,
    80,
    450,
    2,
    'Muratpasa',
    true,
    4,
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440006',
    'Luxury Penthouse Apart',
    'luxury-penthouse-apart',
    'Exclusive 4+1 penthouse with panoramic city views',
    '["apartment5.jpg", "apartment5_2.jpg", "apartment5_3.jpg", "apartment5_4.jpg"]'::jsonb,
    '["Roof Terrace", "Panoramic View", "WiFi", "Air Conditioning", "Jacuzzi", "Parking"]'::jsonb,
    350,
    2100,
    8,
    'Kepez Heights',
    true,
    5,
    NOW(),
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  features = EXCLUDED.features,
  price_per_day = EXCLUDED.price_per_day,
  price_per_week = EXCLUDED.price_per_week,
  max_guests = EXCLUDED.max_guests,
  location = EXCLUDED.location,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert Turkish translations for apart rental listings
INSERT INTO listings_i18n (listing_id, locale, title, description, location_details, created_at, updated_at)
VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'tr',
    'Şehir Merkezi Lüks Apart',
    'Antalya''nın kalbinde modern 2+1 apart, tüm imkanlarla',
    'Antalya merkeze 500m mesafede, alışveriş merkezlerine ve restoranlara yürüme mesafesi',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'tr',
    'Sahil Apart Dairesi',
    'Konyaaltı''nda deniz manzaralı güzel 1+1 apart',
    'Konyaaltı sahiline 100m mesafede, plaja yürüme mesafesi',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'tr',
    'Lara Aile Apart Dairesi',
    'Modern tüm imkanları bulunan geniş 3+1 aile apart dairesi',
    'Lara bölgesinde, havaalanına 15dk mesafede, plaja yakın',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'tr',
    'Modern Studio Apart',
    'Çiftler için mükemmel kompakt ve modern studio',
    'Muratpaşa''da merkezi konumda, ulaşıma yakın',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'tr',
    'Lüks Çatı Katı Apart',
    'Panoramik şehir manzaralı özel 4+1 çatı katı apart',
    'Kepez tepelerinde, muhteşem manzara, sakin ortam',
    NOW(),
    NOW()
  )
ON CONFLICT (listing_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_details = EXCLUDED.location_details,
  updated_at = NOW();

-- Insert English translations
INSERT INTO listings_i18n (listing_id, locale, title, description, location_details, created_at, updated_at)
VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'en',
    'City Center Luxury Apartment',
    'Modern 2+1 apartment in the heart of Antalya with all amenities',
    '500m from Antalya center, walking distance to shopping malls and restaurants',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'en',
    'Beach View Apartment',
    'Beautiful 1+1 apartment with sea view in Konyaalti',
    '100m from Konyaalti beach, walking distance to the beach',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'en',
    'Family Apartment in Lara',
    'Spacious 3+1 family apartment with all modern amenities',
    'In Lara district, 15 minutes to airport, close to beach',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'en',
    'Modern Studio Apartment',
    'Compact and modern studio perfect for couples',
    'Central location in Muratpasa, close to transportation',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'en',
    'Luxury Penthouse Apart',
    'Exclusive 4+1 penthouse with panoramic city views',
    'In Kepez hills, amazing views, peaceful environment',
    NOW(),
    NOW()
  )
ON CONFLICT (listing_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_details = EXCLUDED.location_details,
  updated_at = NOW();

-- Insert Russian translations
INSERT INTO listings_i18n (listing_id, locale, title, description, location_details, created_at, updated_at)
VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'ru',
    'Роскошная квартира в центре города',
    'Современная квартира 2+1 в сердце Антальи со всеми удобствами',
    '500м от центра Антальи, в пешей доступности торговые центры и рестораны',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'ru',
    'Квартира с видом на море',
    'Красивая квартира 1+1 с видом на море в Коньяалты',
    '100м от пляжа Коньяалты, в пешей доступности от пляжа',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'ru',
    'Семейная квартира в Ларе',
    'Просторная семейная квартира 3+1 со всеми современными удобствами',
    'В районе Лара, 15 минут до аэропорта, близко к пляжу',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'ru',
    'Современная студия',
    'Компактная и современная студия, идеальная для пар',
    'Центральное расположение в Муратпаше, близко к транспорту',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'ru',
    'Роскошный пентхаус',
    'Эксклюзивный пентхаус 4+1 с панорамным видом на город',
    'На холмах Кепез, потрясающие виды, спокойная обстановка',
    NOW(),
    NOW()
  )
ON CONFLICT (listing_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_details = EXCLUDED.location_details,
  updated_at = NOW();

-- Insert Arabic translations
INSERT INTO listings_i18n (listing_id, locale, title, description, location_details, created_at, updated_at)
VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'ar',
    'شقة فاخرة في وسط المدينة',
    'شقة حديثة 2+1 في قلب أنطاليا مع جميع وسائل الراحة',
    'على بعد 500 متر من مركز أنطاليا، على مسافة المشي من مراكز التسوق والمطاعم',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'ar',
    'شقة بإطلالة على البحر',
    'شقة جميلة 1+1 بإطلالة على البحر في كونيالتي',
    'على بعد 100 متر من شاطئ كونيالتي، على مسافة المشي من الشاطئ',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'ar',
    'شقة عائلية في لارا',
    'شقة عائلية واسعة 3+1 مع جميع وسائل الراحة الحديثة',
    'في منطقة لارا، 15 دقيقة إلى المطار، قريب من الشاطئ',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440004',
    'ar',
    'استوديو حديث',
    'استوديو مدمج وحديث مثالي للأزواج',
    'موقع مركزي في مراتباشا، قريب من المواصلات',
    NOW(),
    NOW()
  ),
  (
    '650e8400-e29b-41d4-a716-446655440005',
    'ar',
    'بنتهاوس فاخر',
    'بنتهاوس حصري 4+1 مع إطلالة بانورامية على المدينة',
    'في تلال كيبيز، إطلالات مذهلة، بيئة هادئة',
    NOW(),
    NOW()
  )
ON CONFLICT (listing_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location_details = EXCLUDED.location_details,
  updated_at = NOW();

-- Verify the listings
SELECT l.*, li.locale, li.title, li.description
FROM listings l
LEFT JOIN listings_i18n li ON l.id = li.listing_id
JOIN services s ON l.service_id = s.id
WHERE s.slug = 'apart-rental'
ORDER BY l.sort_order, li.locale;