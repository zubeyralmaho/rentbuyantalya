-- Update listings with numbered slugs for easier tracking
-- Run this in Supabase SQL Editor

-- Update Villa listings
UPDATE listings SET 
  slug = 'villa-1',
  name = 'Villa #1 - Luxury Sea View'
WHERE id = '550e8400-e29b-41d4-a716-446655440101';

UPDATE listings SET 
  slug = 'villa-2', 
  name = 'Villa #2 - Mountain Retreat'
WHERE id = '550e8400-e29b-41d4-a716-446655440102';

-- Update Car listings  
UPDATE listings SET 
  slug = 'car-1',
  name = 'Car #1 - BMW 3 Series'
WHERE id = '550e8400-e29b-41d4-a716-446655440201';

UPDATE listings SET 
  slug = 'car-2',
  name = 'Car #2 - Fiat Egea'
WHERE id = '550e8400-e29b-41d4-a716-446655440202';

-- Update Yacht listing
UPDATE listings SET 
  slug = 'yacht-1',
  name = 'Yacht #1 - Luxury Charter'
WHERE id = '550e8400-e29b-41d4-a716-446655440301';

-- Update Turkish i18n slugs
UPDATE listings_i18n SET 
  slug = 'villa-1',
  title = 'Villa #1 - Deniz Manzaralı Lüks'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440101' AND locale = 'tr';

UPDATE listings_i18n SET 
  slug = 'villa-2',
  title = 'Villa #2 - Dağ Evi'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440102' AND locale = 'tr';

UPDATE listings_i18n SET 
  slug = 'car-1',
  title = 'Araç #1 - BMW 3 Serisi'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440201' AND locale = 'tr';

UPDATE listings_i18n SET 
  slug = 'car-2',
  title = 'Araç #2 - Fiat Egea'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440202' AND locale = 'tr';

UPDATE listings_i18n SET 
  slug = 'yacht-1',
  title = 'Yat #1 - Lüks Kiralama'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440301' AND locale = 'tr';

-- Update English i18n slugs (if they exist)
UPDATE listings_i18n SET 
  slug = 'villa-1',
  title = 'Villa #1 - Luxury Sea View'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440101' AND locale = 'en';

UPDATE listings_i18n SET 
  slug = 'villa-2',
  title = 'Villa #2 - Mountain Retreat'  
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440102' AND locale = 'en';

UPDATE listings_i18n SET 
  slug = 'car-1',
  title = 'Car #1 - BMW 3 Series'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440201' AND locale = 'en';

UPDATE listings_i18n SET 
  slug = 'car-2', 
  title = 'Car #2 - Fiat Egea'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440202' AND locale = 'en';

UPDATE listings_i18n SET 
  slug = 'yacht-1',
  title = 'Yacht #1 - Luxury Charter'
WHERE listing_id = '550e8400-e29b-41d4-a716-446655440301' AND locale = 'en';