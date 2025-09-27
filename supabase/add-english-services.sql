-- Add English translations for services
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'en', 'Car Rental', 'car-rental', 
   'Rent the perfect car for your needs with economy, mid-range, luxury, and ATV/Jeep options.',
   'With our expert team in car rental in Antalya, we offer you the most suitable option from our wide vehicle fleet.',
   'Antalya Car Rental | RentBuy Antalya',
   'Reliable car rental service in Antalya. Economical prices, wide vehicle fleet.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'en', 'VIP Transfer', 'vip-transfer',
   'VIP service for airport pickup, city and regional transfers.',
   'We provide comfortable and safe VIP transfer service from Antalya Airport to your hotel and accommodation.',
   'Antalya VIP Transfer | Airport Transfer',
   'Antalya Airport VIP transfer service. 24/7 safe and comfortable transportation.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'en', 'Boat Rental', 'boat-rental',
   'Enjoy the sea with daily tours and luxury yacht rentals.',
   'We have daily boat tours and private yacht rental services to explore the magnificent bays of Antalya.',
   'Antalya Boat Rental | Yacht Tour',
   'Antalya boat rental and yacht tour services. Daily tours, private yacht rental.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'en', 'Villa Rental', 'villa-rental',
   'Luxury villa rental options in Antalya, Kas, Bodrum and Fethiye.',
   'Spend an unforgettable vacation in our luxury villas with magnificent views and private pools.',
   'Antalya Villa Rental | Luxury Holiday Villas',
   'Luxury villa rental in Antalya, Kas, Bodrum and Fethiye.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'en', 'Properties for Sale', 'properties-for-sale',
   'Apartment, villa and land options for sale in Antalya and surrounding areas.',
   'Investment opportunities and ideal homes to live in the most valuable locations of Antalya.',
   'Antalya Properties for Sale | Real Estate Investment Opportunities',
   'Properties for sale in Antalya apartments, villas and land. Sea view properties, investment opportunities.'
  )
ON CONFLICT (service_id, locale) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  updated_at = NOW();