-- Check existing services and add missing rent-a-car service if needed
SELECT id, name, slug, active FROM services;

-- If rent-a-car service doesn't exist, add it
INSERT INTO services (id, name, slug, icon, description, active, sort_order)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Rent A Car',
  'rent-a-car',
  '🚗',
  'Araç kiralama hizmeti',
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

-- Check if we have the service now
SELECT id, name, slug, active FROM services WHERE slug = 'rent-a-car';