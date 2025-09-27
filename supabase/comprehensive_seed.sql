-- Comprehensive Seed Data for RentBuyAntalya.com
-- Run this after schema.sql for full realistic mock data

-- Clear existing data
DELETE FROM listings_i18n;
DELETE FROM listings;
DELETE FROM services_i18n;
DELETE FROM services;
DELETE FROM admin_users;

-- Insert admin user
INSERT INTO admin_users (id, email, password_hash, full_name, role, created_at) VALUES
  ('087ef190-fdc4-4602-ac9e-2694fd3eee79', 'admin@rentbuyantalya.com', '$2b$10$8rKjQlJQw1Qw5kN2kP7a8uvD3F8v5x9L0o5cKa2j7I6G8sR4vT3nW', 'RentBuy Admin', 'super_admin', '2024-01-01 00:00:00');

-- Insert services
INSERT INTO services (id, name, slug, description, icon, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Car Rental', 'car-rental', 'Car rental services', 'car', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'VIP Transfer', 'vip-transfer', 'VIP transfer services', 'plane', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Boat Rental', 'boat-rental', 'Boat and yacht rental', 'anchor', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Villa Rental', 'villa-rental', 'Villa rental services', 'home', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Properties for Sale', 'properties-for-sale', 'Real estate sales services', 'building', 5);

-- Insert services i18n - Turkish
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'tr', 'Araç Kiralama', 'arac-kiralama', 
   'Ekonomik, orta sınıf, üst segment ve ATV/Jeep seçenekleri ile ihtiyacınıza uygun araç kiralayın.',
   'Antalya''da araç kiralama konusunda uzman ekibimizle, geniş araç filomuzdan size en uygun seçeneği sunuyoruz.',
   'Antalya Araç Kiralama | RentBuy Antalya',
   'Antalya''da güvenilir araç kiralama hizmeti. Ekonomik fiyatlar, geniş araç filosu, 7/24 destek.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'tr', 'VIP Transfer', 'vip-transfer',
   'Havalimanı karşılama, şehir içi ve bölgesel transferleriniz için VIP hizmet.',
   'Antalya Havalimanı''ndan otel ve konaklama yerinize kadar konforlu ve güvenli VIP transfer hizmeti.',
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
   'Antalya, Kaş, Bodrum ve Fethiye''de lüks villa kiralama. Özel havuzlu, muhteşem manzaralı.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'tr', 'Satılık Konutlar', 'satilik-konutlar',
   'Antalya ve çevresinde satılık daire, villa ve arsa seçenekleri.',
   'Antalya''nın en değerli lokasyonlarında yatırım fırsatları ve yaşamak için ideal konutlar.',
   'Antalya Satılık Konut | Emlak Yatırım Fırsatları',
   'Antalya satılık daire, villa ve arsa. Deniz manzaralı konutlar, yatırım fırsatları.'
  );

-- Insert services i18n - English
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'en', 'Car Rental', 'car-rental', 
   'Rent the right car for your needs with economic, mid-class, premium and ATV/Jeep options.',
   'With our expert team in car rental in Antalya, we offer you the most suitable option from our wide vehicle fleet.',
   'Antalya Car Rental | RentBuy Antalya',
   'Reliable car rental service in Antalya. Affordable prices, wide vehicle fleet, 24/7 support.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'en', 'VIP Transfer', 'vip-transfer',
   'VIP service for airport pickup, city and regional transfers.',
   'We offer comfortable and safe VIP transfer service from Antalya Airport to your hotel and accommodation.',
   'Antalya VIP Transfer | Airport Transfer',
   'Antalya Airport VIP transfer service. 24/7 safe and comfortable transportation.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'en', 'Boat Rental', 'boat-rental',
   'Enjoy the sea with daily tours and luxury yacht rental.',
   'We have daily boat tours and private yacht rental services to discover the magnificent bays of Antalya.',
   'Antalya Boat Rental | Yacht Tours',
   'Antalya boat rental and yacht tour services. Daily tours, private yacht rental.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'en', 'Villa Rental', 'villa-rental',
   'Luxury villa rental options in Antalya, Kaş, Bodrum and Fethiye.',
   'Have an unforgettable vacation in our luxury villas with magnificent views and private pools.',
   'Antalya Villa Rental | Luxury Holiday Villas',
   'Luxury villa rental in Antalya, Kaş, Bodrum and Fethiye. Private pools, magnificent views.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'en', 'Properties for Sale', 'properties-for-sale',
   'Apartment, villa and land for sale options in and around Antalya.',
   'Investment opportunities and ideal homes to live in the most valuable locations of Antalya.',
   'Antalya Properties for Sale | Real Estate Investment Opportunities',
   'Antalya apartments, villas and land for sale. Sea view properties, investment opportunities.'
  );

-- Insert services i18n - Russian
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'ru', 'Аренда автомобилей', 'arenda-avtomobiley', 
   'Арендуйте подходящий автомобиль с вариантами эконом, средний класс, премиум и ATV/Jeep.',
   'С нашей экспертной командой по аренде автомобилей в Анталии мы предлагаем вам наиболее подходящий вариант.',
   'Аренда автомобилей в Анталии | RentBuy Antalya',
   'Надежная служба аренды автомобилей в Анталии. Доступные цены, широкий автопарк, поддержка 24/7.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'ru', 'VIP Трансфер', 'vip-transfer',
   'VIP услуги для встречи в аэропорту, городских и региональных трансферов.',
   'Мы предлагаем комфортные и безопасные VIP трансферы из аэропорта Анталии в ваш отель.',
   'VIP Трансфер в Анталии | Трансфер из аэропорта',
   'VIP трансфер из аэропорта Анталии. Безопасная и комфортная транспортировка 24/7.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'ru', 'Аренда яхт', 'arenda-yaht',
   'Насладитесь морем с ежедневными турами и арендой роскошных яхт.',
   'У нас есть ежедневные морские туры и услуги аренды частных яхт для открытия великолепных бухт Анталии.',
   'Аренда яхт в Анталии | Морские туры',
   'Аренда яхт и морские туры в Анталии. Ежедневные туры, аренда частных яхт.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'ru', 'Аренда вилл', 'arenda-vill',
   'Варианты аренды роскошных вилл в Анталии, Каше, Бодруме и Фетхие.',
   'Проведите незабываемый отдых в наших роскошных виллах с великолепными видами и частными бассейнами.',
   'Аренда вилл в Анталии | Роскошные праздничные виллы',
   'Аренда роскошных вилл в Анталии, Каше, Бодруме и Фетхие. Частные бассейны, великолепные виды.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'ru', 'Недвижимость на продажу', 'nedvizhimost-na-prodazhu',
   'Квартиры, виллы и участки на продажу в Анталии и окрестностях.',
   'Инвестиционные возможности и идеальные дома для жизни в самых ценных местах Анталии.',
   'Недвижимость в Анталии | Инвестиционные возможности',
   'Квартиры, виллы и участки на продажу в Анталии. Недвижимость с видом на море.'
  );

-- Insert services i18n - Arabic
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'ar', 'تأجير السيارات', 'taajeer-alsayarat', 
   'استأجر السيارة المناسبة لاحتياجاتك مع خيارات اقتصادية ومتوسطة وفاخرة ومركبات الدفع الرباعي.',
   'مع فريقنا الخبير في تأجير السيارات في أنطاليا، نقدم لك الخيار الأنسب من أسطولنا الواسع من المركبات.',
   'تأجير السيارات في أنطاليا | RentBuy Antalya',
   'خدمة تأجير سيارات موثوقة في أنطاليا. أسعار معقولة، أسطول واسع من المركبات، دعم 24/7.'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'ar', 'النقل المميز', 'alnaql-almumayyaz',
   'خدمة VIP لاستقبال المطار والنقل داخل المدينة والإقليمي.',
   'نحن نقدم خدمة نقل VIP مريحة وآمنة من مطار أنطاليا إلى فندقك ومكان إقامتك.',
   'النقل المميز في أنطاليا | نقل المطار',
   'خدمة النقل المميز من مطار أنطاليا. نقل آمن ومريح على مدار الساعة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'ar', 'تأجير اليخوت', 'taajeer-alyukhut',
   'استمتع بالبحر مع الجولات اليومية وتأجير اليخوت الفاخرة.',
   'لدينا جولات بحرية يومية وخدمات تأجير يخوت خاصة لاكتشاف خلجان أنطاليا الرائعة.',
   'تأجير اليخوت في أنطاليا | الجولات البحرية',
   'خدمات تأجير اليخوت والجولات البحرية في أنطاليا. جولات يومية، تأجير يخوت خاصة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'ar', 'تأجير الفيلل', 'taajeer-alfilal',
   'خيارات تأجير فيلل فاخرة في أنطاليا وكاش وبودروم وفتحية.',
   'اقض عطلة لا تُنسى في فيللنا الفاخرة مع إطلالات رائعة ومسابح خاصة.',
   'تأجير الفيلل في أنطاليا | فيلل العطلات الفاخرة',
   'تأجير فيلل فاخرة في أنطاليا وكاش وبودروم وفتحية. مسابح خاصة، إطلالات رائعة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'ar', 'عقارات للبيع', 'aqarat-lilbay',
   'خيارات شقق وفيلل وأراضي للبيع في أنطاليا والمناطق المحيطة.',
   'فرص استثمارية ومنازل مثالية للعيش في أكثر المواقع قيمة في أنطاليا.',
   'عقارات أنطاليا للبيع | فرص الاستثمار العقاري',
   'شقق وفيلل وأراضي للبيع في أنطاليا. عقارات مع إطلالة على البحر، فرص استثمارية.'
  );

-- Insert comprehensive listings - Car Rentals
INSERT INTO listings (id, service_id, name, slug, images, features, price_per_day, active, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Renault Clio - Economy Car', 'car-1', 
   '["https://images.unsplash.com/photo-1549924231-f129b911e442?w=800", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"]',
   '["Air Conditioning", "Bluetooth", "USB Port", "Power Steering", "ABS", "Airbags", "Central Locking", "Manual Transmission", "Gasoline", "5 Doors", "5 Seats"]',
   450, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Volkswagen Golf - Mid Class', 'car-2', 
   '["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800"]',
   '["Air Conditioning", "GPS Navigation", "Bluetooth", "USB Port", "Cruise Control", "Power Steering", "ABS", "Airbags", "Parking Sensors", "Automatic Transmission", "Gasoline", "5 Doors", "5 Seats"]',
   650, true, 2
  ),
  ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'BMW 3 Series - Luxury Car', 'car-3', 
   '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800", "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800"]',
   '["Premium Sound System", "Leather Seats", "GPS Navigation", "Bluetooth", "Climate Control", "Cruise Control", "Power Steering", "ABS", "Airbags", "Parking Sensors", "Sunroof", "Automatic Transmission", "Diesel", "4 Doors", "5 Seats"]',
   1200, true, 3
  );

-- Insert comprehensive listings - Villa Rentals
INSERT INTO listings (id, service_id, name, slug, images, features, price_per_day, active, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440004', 'Sea View Luxury Villa - 4 Bedrooms', 'villa-1', 
   '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"]',
   '["Private Pool", "Sea View", "Air Conditioning", "WiFi", "Full Kitchen", "Washing Machine", "Dishwasher", "Garden", "BBQ Area", "Parking", "Security System", "4 Bedrooms", "3 Bathrooms", "250m² Area"]',
   2500, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440004', 'Ultra Luxury Villa - 6 Bedrooms', 'villa-2', 
   '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800"]',
   '["Private Pool", "Jacuzzi", "Sea View", "Mountain View", "Air Conditioning", "WiFi", "Full Kitchen", "Washing Machine", "Dishwasher", "Garden", "BBQ Area", "Parking", "Security System", "Game Room", "6 Bedrooms", "5 Bathrooms", "350m² Area"]',
   4000, true, 2
  );

-- Insert comprehensive listings - Boat Rentals  
INSERT INTO listings (id, service_id, name, slug, images, features, price_per_day, active, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', 'Jeanneau Leader 36 - Yacht Tour', 'yacht-1', 
   '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"]',
   '["Captain Included", "Fuel Included", "Fishing Equipment", "Snorkeling Gear", "Sound System", "GPS", "Safety Equipment", "Refrigerator", "Fresh Water", "Shower", "12m Length", "8 Person Capacity", "2 Cabins", "1 Bathroom"]',
   3500, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440003', 'Princess V58 - Ultra Luxury Yacht', 'yacht-2', 
   '["https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800", "https://images.unsplash.com/photo-1570077969871-8bd7e6b36e5f?w=800", "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800"]',
   '["Captain Included", "Crew Included", "Fuel Included", "Fishing Equipment", "Snorkeling Gear", "Jet Ski", "Sound System", "GPS", "Air Conditioning", "Full Kitchen", "Refrigerator", "Fresh Water", "Shower", "BBQ Grill", "18m Length", "12 Person Capacity", "3 Cabins", "2 Bathrooms"]',
   6000, true, 2
  );

-- Insert comprehensive listings - VIP Transfer
INSERT INTO listings (id, service_id, name, slug, images, features, price_per_day, active, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440002', 'Mercedes Vito VIP Transfer', 'transfer-1', 
   '["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800"]',
   '["Professional Driver", "Air Conditioning", "WiFi", "Water Bottles", "Phone Chargers", "Luxury Interior", "GPS Navigation", "24/7 Service", "8 Person Capacity", "6 Luggage", "Mercedes Vito", "Diesel"]',
   180, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440002', 'Mercedes S-Class Premium Transfer', 'transfer-2', 
   '["https://images.unsplash.com/photo-1563720223185-11003d516935?w=800", "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800"]',
   '["Professional Chauffeur", "Leather Seats", "Air Conditioning", "WiFi", "Premium Water", "Phone Chargers", "Luxury Interior", "GPS Navigation", "24/7 Service", "Newspapers", "Magazines", "4 Person Capacity", "4 Luggage", "Mercedes S-Class", "Hybrid"]',
   350, true, 2
  );

-- Insert comprehensive listings - Properties for Sale
INSERT INTO listings (id, service_id, name, slug, images, features, price_per_day, active, sort_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440005', 'Sea View Luxury Apartment 3+1', 'property-1', 
   '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
   '["Sea View", "Balcony", "Elevator", "24/7 Security", "Swimming Pool", "Fitness Center", "Parking", "Storage Room", "Central Heating", "Air Conditioning", "Satellite TV Infrastructure", "3 Bedrooms", "2 Bathrooms", "140m² Area", "5th Floor"]',
   4500000, true, 1
  ),
  ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440005', 'Ultra Luxury Villa 5+1 with Smart Home', 'property-2', 
   '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"]',
   '["Sea View", "Garden", "Private Pool", "Balcony", "24/7 Security", "Fitness Center", "Parking", "Storage Room", "Floor Heating", "Air Conditioning", "Smart Home System", "Jacuzzi", "Walk-in Closet", "5 Bedrooms", "4 Bathrooms", "280m² Area"]',
   8500000, true, 2
  );

-- Insert multilingual translations for all listings
-- Car Rental 1 - Turkish
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440101', 'tr', 'Renault Clio - Ekonomik Araç', 'renault-clio-ekonomik',
   'Şehir içi kullanım için ideal ekonomik araç. Yakıt tasarruflu, park etmesi kolay ve güvenilir. Klimalı, Bluetooth destekli ve tüm temel özellikleri içeren modern araç. Günlük, haftalık ve aylık kiralama seçenekleri mevcuttur. Manuel vites, benzinli motor, 5 kapı 5 koltuk. ABS fren sistemi, hava yastıkları, merkezi kilit sistemi ile güvenliği üst seviyede.'
  ),
  ('550e8400-e29b-41d4-a716-446655440101', 'en', 'Renault Clio - Economy Car', 'renault-clio-economy',
   'Ideal economy car for city use. Fuel efficient, easy to park and reliable. Air-conditioned, Bluetooth-enabled modern car with all essential features. Daily, weekly and monthly rental options available. Manual transmission, gasoline engine, 5 doors 5 seats. ABS brake system, airbags, central locking system for maximum safety.'
  ),
  ('550e8400-e29b-41d4-a716-446655440101', 'ru', 'Renault Clio - Эконом автомобиль', 'renault-clio-ekonom',
   'Идеальный эконом автомобиль для городского использования. Экономичный, легко парковать и надежный. Современный автомобиль с кондиционером, Bluetooth и всеми основными функциями. Доступны варианты аренды на день, неделю и месяц. Механическая коробка передач, бензиновый двигатель, 5 дверей 5 мест. Система ABS, подушки безопасности, центральный замок для максимальной безопасности.'
  ),
  ('550e8400-e29b-41d4-a716-446655440101', 'ar', 'رينو كليو - سيارة اقتصادية', 'renault-clio-iqtisadiya',
   'سيارة اقتصادية مثالية للاستخدام في المدينة. موفرة للوقود، سهلة الوقوف وموثوقة. سيارة حديثة مكيفة مع Bluetooth وجميع الميزات الأساسية. تتوفر خيارات الإيجار اليومية والأسبوعية والشهرية. ناقل حركة يدوي، محرك بنزين، 5 أبواب 5 مقاعد. نظام فرامل ABS، وسائد هوائية، نظام القفل المركزي للحد الأقصى من الأمان.'
  );

-- Car Rental 2 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440102', 'tr', 'Volkswagen Golf - Otomatik Vites', 'volkswagen-golf-otomatik',
   'Konforlu sürüş deneyimi için otomatik vitesli orta sınıf araç. GPS navigasyon, Bluetooth, park sensörleri ile donatılmış. Hem şehir içi hem uzun yolculuklar için mükemmel seçim. Güvenli ve rahat sürüş garantisi. Otomatik vites, benzinli motor, 5 kapı 5 koltuk. Cruise control, klima, güç direksiyonu ile lüks sürüş deneyimi.'
  ),
  ('550e8400-e29b-41d4-a716-446655440102', 'en', 'Volkswagen Golf - Automatic Transmission', 'volkswagen-golf-automatic',
   'Mid-class car with automatic transmission for comfortable driving experience. Equipped with GPS navigation, Bluetooth, parking sensors. Perfect choice for both city and long journeys. Safe and comfortable driving guaranteed. Automatic transmission, gasoline engine, 5 doors 5 seats. Cruise control, air conditioning, power steering for luxurious driving experience.'
  ),
  ('550e8400-e29b-41d4-a716-446655440102', 'ru', 'Volkswagen Golf - Автоматическая коробка передач', 'volkswagen-golf-avtomaticheskaya',
   'Автомобиль среднего класса с автоматической коробкой передач для комфортного вождения. Оснащен GPS-навигацией, Bluetooth, парковочными датчиками. Идеальный выбор для городских и дальних поездок. Гарантированная безопасность и комфорт. Автоматическая коробка передач, бензиновый двигатель, 5 дверей 5 мест. Круиз-контроль, кондиционер, усилитель руля для роскошного опыта вождения.'
  ),
  ('550e8400-e29b-41d4-a716-446655440102', 'ar', 'فولكس فاجن جولف - ناقل حركة أوتوماتيكي', 'volkswagen-golf-otomatiki',
   'سيارة من الفئة المتوسطة مع ناقل حركة أوتوماتيكي لتجربة قيادة مريحة. مجهزة بنظام GPS والبلوتوث وحساسات الوقوف. الخيار الأمثل للمدينة والرحلات الطويلة. ضمان القيادة الآمنة والمريحة. ناقل حركة أوتوماتيكي، محرك بنزين، 5 أبواب 5 مقاعد. مثبت السرعة، تكييف، مقود بمؤازرة لتجربة قيادة فاخرة.'
  );

-- Car Rental 3 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440103', 'tr', 'BMW 3 Serisi - Premium Lüks Araç', 'bmw-3-serisi-premium',
   'Lüks ve performansın buluştuğu premium araç. Deri koltuklar, sunroof, premium ses sistemi ile donatılmış. İş görüşmeleri ve özel etkinlikler için ideal seçim. Mükemmel sürüş performansı ve konforu bir arada sunar. Otomatik vites, dizel motor, 4 kapı 5 koltuk. Klima kontrolü, cruise control, park sensörleri ile tam donanım.'
  ),
  ('550e8400-e29b-41d4-a716-446655440103', 'en', 'BMW 3 Series - Premium Luxury Car', 'bmw-3-series-premium',
   'Premium car where luxury meets performance. Equipped with leather seats, sunroof, premium sound system. Ideal choice for business meetings and special events. Offers excellent driving performance and comfort together. Automatic transmission, diesel engine, 4 doors 5 seats. Climate control, cruise control, parking sensors with full equipment.'
  ),
  ('550e8400-e29b-41d4-a716-446655440103', 'ru', 'BMW 3 Series - Премиум роскошный автомобиль', 'bmw-3-series-premium-ru',
   'Премиум автомобиль, где роскошь встречается с производительностью. Оснащен кожаными сиденьями, люком, премиум звуковой системой. Идеальный выбор для деловых встреч и особых мероприятий. Предлагает отличную производительность и комфорт вождения. Автоматическая коробка передач, дизельный двигатель, 4 двери 5 мест. Климат-контроль, круиз-контроль, парковочные датчики с полным оборудованием.'
  ),
  ('550e8400-e29b-41d4-a716-446655440103', 'ar', 'BMW 3 Series - سيارة فاخرة مميزة', 'bmw-3-series-fakhira',
   'سيارة مميزة حيث تلتقي الفخامة بالأداء. مجهزة بمقاعد جلدية وفتحة سقف ونظام صوتي مميز. الخيار الأمثل للاجتماعات التجارية والمناسبات الخاصة. تقدم أداء قيادة ممتاز وراحة معاً. ناقل حركة أوتوماتيكي، محرك ديزل، 4 أبواب 5 مقاعد. تحكم بالمناخ، مثبت السرعة، حساسات الوقوف مع التجهيز الكامل.'
  );

-- Villa Rental 1 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440201', 'tr', 'Deniz Manzaralı Lüks Villa - 4 Yatak Odası', 'deniz-manzarali-lüks-villa',
   'Antalya''nın en güzel koyu olan Kaleiçi yakınında muhteşem deniz manzaralı villa. 4 yatak odası, 3 banyo, özel havuz ve bahçe ile unutulmaz bir tatil deneyimi. Modern mutfak, klima, WiFi ve tüm konfor olanakları mevcuttur. Güvenli park alanı ve 24/7 güvenlik sistemi ile huzurlu konaklama. 250 m² kullanım alanı, BBQ alanı, çamaşır makinesi, bulaşık makinesi dahil.'
  ),
  ('550e8400-e29b-41d4-a716-446655440201', 'en', 'Sea View Luxury Villa - 4 Bedrooms', 'sea-view-luxury-villa',
   'Magnificent sea view villa near Kaleiçi, one of the most beautiful bays of Antalya. Unforgettable vacation experience with 4 bedrooms, 3 bathrooms, private pool and garden. Modern kitchen, air conditioning, WiFi and all comfort facilities available. Peaceful accommodation with secure parking and 24/7 security system. 250 m² living area, BBQ area, washing machine, dishwasher included.'
  ),
  ('550e8400-e29b-41d4-a716-446655440201', 'ru', 'Роскошная вилла с видом на море - 4 спальни', 'roskoshnaya-villa-vid-more',
   'Великолепная вилла с видом на море рядом с Калеичи, одной из самых красивых бухт Анталии. Незабываемые каникулы с 4 спальнями, 3 ванными, частным бассейном и садом. Современная кухня, кондиционер, WiFi и все удобства. Спокойное размещение с охраняемой парковкой и системой безопасности 24/7. 250 м² жилой площади, зона барбекю, стиральная машина, посудомоечная машина включены.'
  ),
  ('550e8400-e29b-41d4-a716-446655440201', 'ar', 'فيلا فاخرة بإطلالة على البحر - 4 غرف نوم', 'villa-fakhira-itlala-bahr',
   'فيلا رائعة بإطلالة على البحر بالقرب من كاليتشي، إحدى أجمل خلجان أنطاليا. تجربة عطلة لا تُنسى مع 4 غرف نوم و3 حمامات ومسبح خاص وحديقة. مطبخ حديث وتكييف وWiFi وجميع وسائل الراحة. إقامة هادئة مع موقف سيارات آمن ونظام أمان على مدار الساعة. 250 م² مساحة معيشة، منطقة شواء، غسالة ملابس، غسالة صحون متضمنة.'
  );

-- Villa Rental 2 - All languages  
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440202', 'tr', 'Ultra Lüks Villa - Jacuzzi ve Deniz Manzarası', 'ultra-luks-villa-jacuzzi',
   'En üst düzey lüks ve konforu sunan eşsiz villa. 6 yatak odası, 5 banyo, özel havuz, jacuzzi ve oyun odası ile büyük aileler için mükemmel. Panoramik deniz ve dağ manzarası eşliğinde unutulmaz anlar yaşayın. Premium mutfak ekipmanları, bahçe barbekü alanı ve geniş park imkanı. 350 m² kullanım alanı, klima, WiFi, tüm lüks olanaklar dahil.'
  ),
  ('550e8400-e29b-41d4-a716-446655440202', 'en', 'Ultra Luxury Villa - Jacuzzi and Sea View', 'ultra-luxury-villa-jacuzzi',
   'Unique villa offering the highest level of luxury and comfort. Perfect for large families with 6 bedrooms, 5 bathrooms, private pool, jacuzzi and game room. Experience unforgettable moments with panoramic sea and mountain views. Premium kitchen equipment, garden BBQ area and ample parking. 350 m² living area, air conditioning, WiFi, all luxury amenities included.'
  ),
  ('550e8400-e29b-41d4-a716-446655440202', 'ru', 'Ультра роскошная вилла - Джакузи и вид на море', 'ultra-roskoshnaya-villa-dzhakuzi',
   'Уникальная вилла, предлагающая высший уровень роскоши и комфорта. Идеально подходит для больших семей: 6 спален, 5 ванных, частный бассейн, джакузи и игровая комната. Панорамный вид на море и горы. Премиум кухонное оборудование, садовая зона барбекю и просторная парковка. 350 м² жилой площади, кондиционер, WiFi, все роскошные удобства включены.'
  ),
  ('550e8400-e29b-41d4-a716-446655440202', 'ar', 'فيلا فاخرة للغاية - جاكوزي وإطلالة على البحر', 'villa-fakhira-ghaya-jakuzi',
   'فيلا فريدة تقدم أعلى مستوى من الفخامة والراحة. مثالية للعائلات الكبيرة مع 6 غرف نوم و5 حمامات ومسبح خاص وجاكوزي وغرفة ألعاب. إطلالة بانورامية على البحر والجبال. معدات مطبخ مميزة، منطقة شواء في الحديقة وموقف سيارات واسع. 350 م² مساحة معيشة، تكييف، WiFi، جميع وسائل الراحة الفاخرة متضمنة.'
  );

-- Boat Rental 1 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440301', 'tr', 'Jeanneau Leader 36 - Kaptan Dahil Yat Turu', 'jeanneau-leader-36-yat-turu',
   'Deneyimli kaptanımız eşliğinde Antalya''nın gizli koylarını keşfedin. 8 kişilik lüks yat ile günlük turlar ve özel etkinlikler için ideal. Balık tutma ekipmanları, şnorkel seti, ses sistemi dahil. Yakıt ve kaptan ücreti fiyata dahildir. Güvenli ve konforlu deniz yolculuğu garantisi. 12 metre uzunluğunda, 2 kabin, 1 banyo, buzdolabı, tatlı su, duş imkanı.'
  ),
  ('550e8400-e29b-41d4-a716-446655440301', 'en', 'Jeanneau Leader 36 - Captain Included Yacht Tour', 'jeanneau-leader-36-yacht-tour',
   'Discover the hidden bays of Antalya with our experienced captain. Ideal for daily tours and private events with luxury yacht for 8 people. Fishing equipment, snorkel set, sound system included. Fuel and captain fee included in price. Safe and comfortable sea voyage guaranteed. 12 meters length, 2 cabins, 1 bathroom, refrigerator, fresh water, shower facilities.'
  ),
  ('550e8400-e29b-41d4-a716-446655440301', 'ru', 'Jeanneau Leader 36 - Яхт-тур с капитаном', 'jeanneau-leader-36-yakht-tur',
   'Откройте для себя скрытые бухты Анталии с нашим опытным капитаном. Идеально подходит для дневных туров и частных мероприятий на роскошной яхте на 8 человек. Рыболовное снаряжение, набор для снорклинга, звуковая система включены. Топливо и плата капитану включены в цену. Гарантированная безопасность и комфорт морского путешествия. 12 метров длиной, 2 каюты, 1 ванная, холодильник, пресная вода, душ.'
  ),
  ('550e8400-e29b-41d4-a716-446655440301', 'ar', 'جيانو ليدر 36 - جولة يخت مع الكابتن', 'jeanneau-leader-36-jawla-yakht',
   'اكتشف الخلجان المخفية في أنطاليا مع كابتننا ذو الخبرة. مثالي للجولات اليومية والفعاليات الخاصة مع يخت فاخر لـ8 أشخاص. معدات الصيد وطقم الغطس ونظام الصوت متضمنة. الوقود ورسوم الكابتن متضمنة في السعر. ضمان الرحلة البحرية الآمنة والمريحة. 12 متر طولاً، 2 كابينة، 1 حمام، ثلاجة، مياه عذبة، مرافق الاستحمام.'
  );

-- Continue with more translations for remaining listings...
-- (For brevity, I'll add a few more key translations)

-- VIP Transfer 1 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440401', 'tr', 'Mercedes Vito VIP Transfer - 8 Kişilik', 'mercedes-vito-vip-transfer',
   'Havalimanı karşılama ve şehir turu için profesyonel şoförlü VIP transfer hizmeti. 8 kişi kapasiteli lüks Mercedes Vito ile konforlu yolculuk. WiFi, su ikramı, telefon şarj imkanı dahil. 24/7 hizmet garantisi ile güvenilir ulaşım çözümü. Profesyonel şoför, klima, GPS navigasyon, lüks iç mekan tasarımı. 6 valiz kapasitesi, dizel motor ile ekonomik ve çevre dostu.'
  ),
  ('550e8400-e29b-41d4-a716-446655440401', 'en', 'Mercedes Vito VIP Transfer - 8 Passengers', 'mercedes-vito-vip-transfer-en',
   'Professional chauffeur VIP transfer service for airport pickup and city tours. Comfortable journey with luxury Mercedes Vito for 8 passengers. WiFi, water service, phone charging included. Reliable transportation solution with 24/7 service guarantee. Professional driver, air conditioning, GPS navigation, luxury interior design. 6 luggage capacity, diesel engine for economic and eco-friendly travel.'
  ),
  ('550e8400-e29b-41d4-a716-446655440401', 'ru', 'Mercedes Vito VIP Трансфер - 8 пассажиров', 'mercedes-vito-vip-transfer-ru',
   'VIP трансфер с профессиональным шофером для встречи в аэропорту и городских туров. Комфортная поездка на роскошном Mercedes Vito на 8 пассажиров. WiFi, вода, зарядка телефонов включены. Надежное транспортное решение с гарантией обслуживания 24/7. Профессиональный водитель, кондиционер, GPS-навигация, роскошный интерьер. Вместимость 6 чемоданов, дизельный двигатель для экономичной и экологичной поездки.'
  ),
  ('550e8400-e29b-41d4-a716-446655440401', 'ar', 'مرسيدس فيتو نقل مميز - 8 ركاب', 'mercedes-vito-naql-mumayyaz',
   'خدمة النقل المميز مع سائق محترف لاستقبال المطار وجولات المدينة. رحلة مريحة مع مرسيدس فيتو الفاخرة لـ8 ركاب. WiFi وخدمة المياه وشحن الهواتف متضمنة. حل نقل موثوق مع ضمان الخدمة على مدار الساعة. سائق محترف، تكييف، نظام GPS، تصميم داخلي فاخر. سعة 6 حقائب، محرك ديزل للسفر الاقتصادي والصديق للبيئة.'
  );

-- Property 1 - All languages  
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440501', 'tr', 'Deniz Manzaralı 3+1 Lüks Daire - Antalya Merkez', 'deniz-manzarali-3-1-lüks-daire',
   'Antalya merkezde prestijli bir sitede satılık muhteşem deniz manzaralı daire. 3 yatak odası, 2 banyo, geniş balkon ve 140 m² kullanım alanı. Site içinde yüzme havuzu, fitness merkezi, 24/7 güvenlik. Merkezi konum avantajı ile alışveriş merkezleri, okullar ve hastanelere yakın. 5. kat, asansör, kapalı park alanı, depo odası, merkezi ısıtma, klima, uydu TV altyapısı dahil.'
  ),
  ('550e8400-e29b-41d4-a716-446655440501', 'en', 'Sea View 3+1 Luxury Apartment - Antalya Center', 'sea-view-3-1-luxury-apartment',
   'Magnificent sea view apartment for sale in a prestigious complex in Antalya center. 3 bedrooms, 2 bathrooms, large balcony and 140 m² living area. Swimming pool, fitness center, 24/7 security within the complex. Central location advantage close to shopping centers, schools and hospitals. 5th floor, elevator, covered parking, storage room, central heating, air conditioning, satellite TV infrastructure included.'
  ),
  ('550e8400-e29b-41d4-a716-446655440501', 'ru', 'Роскошная квартира 3+1 с видом на море - Центр Анталии', 'roskoshnaya-kvartira-3-1-vid-more',
   'Великолепная квартира с видом на море в престижном комплексе в центре Анталии. 3 спальни, 2 ванные, большой балкон и 140 м² жилой площади. Бассейн, фитнес-центр, охрана 24/7 в комплексе. Преимущество центрального расположения рядом с торговыми центрами, школами и больницами. 5 этаж, лифт, крытая парковка, кладовая, центральное отопление, кондиционер, спутниковое ТВ включены.'
  ),
  ('550e8400-e29b-41d4-a716-446655440501', 'ar', 'شقة فاخرة 3+1 بإطلالة على البحر - مركز أنطاليا', 'shaqa-fakhira-3-1-itlala-bahr',
   'شقة رائعة بإطلالة على البحر للبيع في مجمع مرموق في مركز أنطاليا. 3 غرف نوم و2 حمام وشرفة كبيرة ومساحة معيشة 140 م². مسبح ومركز لياقة بدنية وأمن على مدار الساعة في المجمع. ميزة الموقع المركزي قريب من مراكز التسوق والمدارس والمستشفيات. الطابق الخامس، مصعد، موقف سيارات مغطى، غرفة تخزين، تدفئة مركزية، تكييف، بنية تحتية للتلفزيون الفضائي متضمنة.'
  );

-- Add remaining translations for all other listings
-- Boat Rental 2 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440302', 'tr', 'Princess V58 - Ultra Lüks Yat', 'princess-v58-ultra-luks-yat',
   'En üst düzey lüks yat deneyimi için Princess V58. 12 kişi kapasiteli, 3 kabin, 2 banyo ile büyük gruplar için ideal. Jet ski, profesyonel mürettebat, tam mutfak ve BBQ alanı dahil. Özel etkinlikler ve unutulmaz deniz yolculukları için mükemmel seçim. 18 metre uzunluğunda, klimalı, GPS, güvenlik ekipmanları, buzdolabı, tatlı su, duş, barbekü ızgarası ile tam donanım.'
  ),
  ('550e8400-e29b-41d4-a716-446655440302', 'en', 'Princess V58 - Ultra Luxury Yacht', 'princess-v58-ultra-luxury-yacht',
   'Princess V58 for ultimate luxury yacht experience. Ideal for large groups with 12 person capacity, 3 cabins, 2 bathrooms. Jet ski, professional crew, full kitchen and BBQ area included. Perfect choice for special events and unforgettable sea voyages. 18 meters length, air conditioned, GPS, safety equipment, refrigerator, fresh water, shower, BBQ grill with full equipment.'
  ),
  ('550e8400-e29b-41d4-a716-446655440302', 'ru', 'Princess V58 - Ультра роскошная яхта', 'princess-v58-ultra-roskoshnaya-yakht',
   'Princess V58 для максимального роскошного яхтенного опыта. Идеально подходит для больших групп: 12 человек, 3 каюты, 2 ванные. Гидроцикл, профессиональный экипаж, полная кухня и зона барбекю включены. Идеальный выбор для особых мероприятий и незабываемых морских путешествий. 18 метров длиной, кондиционер, GPS, оборудование безопасности, холодильник, пресная вода, душ, барбекю с полным оборудованием.'
  ),
  ('550e8400-e29b-41d4-a716-446655440302', 'ar', 'برنسيس V58 - يخت فاخر للغاية', 'princess-v58-yakht-fakhir',
   'برنسيس V58 لتجربة يخت فاخرة للغاية. مثالي للمجموعات الكبيرة بسعة 12 شخص و3 كابائن و2 حمام. جت سكي وطاقم محترف ومطبخ كامل ومنطقة شواء متضمنة. الخيار الأمثل للمناسبات الخاصة والرحلات البحرية التي لا تُنسى. 18 متر طولاً، مكيف، GPS، معدات الأمان، ثلاجة، مياه عذبة، دوش، شواء مع المعدات الكاملة.'
  );

-- VIP Transfer 2 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440402', 'tr', 'Mercedes S-Class Premium Transfer - 4 Kişilik', 'mercedes-s-class-premium-transfer',
   'En lüks transfer deneyimi için Mercedes S-Class. Profesyonel şoför, deri koltuklar, premium su ikramı ve gazete servisi ile VIP hizmet. İş görüşmeleri ve özel etkinlikler için ideal. Hibrit motor teknolojisi ile çevre dostu ve sessiz yolculuk. 4 kişi kapasiteli, 4 valiz, lüks iç mekan, klima, WiFi, GPS navigasyon, 24/7 hizmet garantisi dahil.'
  ),
  ('550e8400-e29b-41d4-a716-446655440402', 'en', 'Mercedes S-Class Premium Transfer - 4 Passengers', 'mercedes-s-class-premium-transfer-en',
   'Mercedes S-Class for the most luxurious transfer experience. VIP service with professional chauffeur, leather seats, premium water and newspaper service. Ideal for business meetings and special events. Eco-friendly and quiet journey with hybrid engine technology. 4 passenger capacity, 4 luggage, luxury interior, air conditioning, WiFi, GPS navigation, 24/7 service guarantee included.'
  ),
  ('550e8400-e29b-41d4-a716-446655440402', 'ru', 'Mercedes S-Class Премиум Трансфер - 4 пассажира', 'mercedes-s-class-premium-transfer-ru',
   'Mercedes S-Class для самого роскошного трансферного опыта. VIP обслуживание с профессиональным шофером, кожаными сиденьями, премиум водой и газетной службой. Идеально для деловых встреч и особых мероприятий. Экологичная и тихая поездка с гибридной двигательной технологией. Вместимость 4 пассажира, 4 чемодана, роскошный интерьер, кондиционер, WiFi, GPS-навигация, гарантия обслуживания 24/7.'
  ),
  ('550e8400-e29b-41d4-a716-446655440402', 'ar', 'مرسيدس S-Class نقل مميز - 4 ركاب', 'mercedes-s-class-naql-mumayyaz',
   'مرسيدس S-Class لأفخر تجربة نقل. خدمة VIP مع سائق محترف ومقاعد جلدية ومياه مميزة وخدمة الصحف. مثالي للاجتماعات التجارية والمناسبات الخاصة. رحلة صديقة للبيئة وهادئة مع تقنية المحرك الهجين. سعة 4 ركاب، 4 حقائب، تصميم داخلي فاخر، تكييف، WiFi، نظام GPS، ضمان الخدمة على مدار الساعة.'
  );

-- Property 2 - All languages
INSERT INTO listings_i18n (listing_id, locale, title, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440502', 'tr', 'Ultra Lüks 5+1 Villa - Akıllı Ev Sistemli', 'ultra-luks-5-1-villa-akilli-ev',
   'Antalya''nın en prestijli bölgesinde satılık ultra lüks villa. 5 yatak odası, 4 banyo, bahçe, özel havuz ve jacuzzi ile mükemmel yaşam alanı. Akıllı ev sistemi, yerden ısıtma, giyinme odası ve 280 m² geniş yaşam alanı. Yatırım değeri yüksek premium konut. Deniz manzarası, balkon, 24/7 güvenlik, fitness merkezi, park alanı, depo odası, klima ile tam donanım.'
  ),
  ('550e8400-e29b-41d4-a716-446655440502', 'en', 'Ultra Luxury 5+1 Villa - Smart Home System', 'ultra-luxury-5-1-villa-smart-home',
   'Ultra luxury villa for sale in the most prestigious area of Antalya. Perfect living space with 5 bedrooms, 4 bathrooms, garden, private pool and jacuzzi. Smart home system, floor heating, walk-in closet and 280 m² spacious living area. High investment value premium residence. Sea view, balcony, 24/7 security, fitness center, parking, storage room, air conditioning with full equipment.'
  ),
  ('550e8400-e29b-41d4-a716-446655440502', 'ru', 'Ультра роскошная вилла 5+1 - Система умный дом', 'ultra-roskoshnaya-villa-5-1-umnyy-dom',
   'Ультра роскошная вилла на продажу в самом престижном районе Анталии. Идеальное жилое пространство: 5 спален, 4 ванные, сад, частный бассейн и джакузи. Система умный дом, теплый пол, гардеробная и 280 м² просторной жилой площади. Премиум резиденция с высокой инвестиционной стоимостью. Вид на море, балкон, охрана 24/7, фитнес-центр, парковка, кладовая, кондиционер с полным оборудованием.'
  ),
  ('550e8400-e29b-41d4-a716-446655440502', 'ar', 'فيلا فاخرة للغاية 5+1 - نظام منزل ذكي', 'villa-fakhira-ghaya-5-1-bayt-dhaki',
   'فيلا فاخرة للغاية للبيع في أكثر المناطق المرموقة في أنطاليا. مساحة معيشة مثالية مع 5 غرف نوم و4 حمامات وحديقة ومسبح خاص وجاكوزي. نظام منزل ذكي وتدفئة أرضية وغرفة ملابس ومساحة معيشة واسعة 280 م². سكن مميز بقيمة استثمارية عالية. إطلالة على البحر، شرفة، أمان على مدار الساعة، مركز لياقة بدنية، موقف سيارات، غرفة تخزين، تكييف مع المعدات الكاملة.'
  );

COMMIT;