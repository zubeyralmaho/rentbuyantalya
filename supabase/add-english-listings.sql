-- Add English translations for listings
INSERT INTO listings_i18n (listing_id, locale, title, slug, description, features_text, location_details) VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'en', 'Luxury Villa with Sea View', 'luxury-villa-sea-view',
   'Beautiful 4-bedroom villa with private pool and stunning sea views',
   'Private pool, sea view, WiFi, air conditioning, kitchen, parking, garden, barbecue',
   'Antalya, near Lara Beach, 5 minutes walk to the beach'
  ),
  ('550e8400-e29b-41d4-a716-446655440102', 'en', 'Cozy Mountain Villa', 'cozy-mountain-villa',
   'Peaceful 3-bedroom villa nestled in the mountains with panoramic views',
   'Mountain view, fireplace, WiFi, kitchen, parking, terrace, hiking',
   'Antalya, in the nature of Kemer region'
  ),
  ('550e8400-e29b-41d4-a716-446655440201', 'en', 'BMW 3 Series', 'bmw-3-series',
   'Luxury sedan perfect for business trips and comfortable city driving',
   'Automatic transmission, GPS, Bluetooth, leather seats, sunroof, cruise control',
   'Antalya Airport pickup point'
  ),
  ('550e8400-e29b-41d4-a716-446655440202', 'en', 'Fiat Egea', 'fiat-egea',
   'Economic and reliable car for daily city driving',
   'Manual transmission, air conditioning, radio, fuel efficient',
   'Antalya city center pickup point'
  ),
  ('550e8400-e29b-41d4-a716-446655440301', 'en', 'Luxury Yacht Charter', 'luxury-yacht-charter',
   'Premium yacht with professional crew for unforgettable sea experience',
   'Professional crew, catering, snorkeling, fishing, sundeck, cabin',
   'Departure from Antalya Marina'
  )
ON CONFLICT (listing_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  features_text = EXCLUDED.features_text,
  location_details = EXCLUDED.location_details,
  updated_at = NOW();