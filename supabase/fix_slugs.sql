-- Fix slug standardization for all locales
UPDATE services_i18n SET slug = 'car-rental' WHERE service_id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE services_i18n SET slug = 'vip-transfer' WHERE service_id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE services_i18n SET slug = 'boat-rental' WHERE service_id = '550e8400-e29b-41d4-a716-446655440003';
UPDATE services_i18n SET slug = 'villa-rental' WHERE service_id = '550e8400-e29b-41d4-a716-446655440004';
UPDATE services_i18n SET slug = 'properties-for-sale' WHERE service_id = '550e8400-e29b-41d4-a716-446655440005';