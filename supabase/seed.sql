-- Seed data for RentBuyAntalya.com
-- Run this after schema.sql

-- Insert services
INSERT INTO services (id, name, slug, description, icon, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Rent a Car', 'rent-a-car', 'Car rental services', 'car', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'VIP Transfer', 'vip-transfer', 'VIP transfer services', 'plane', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Boat Rental', 'boat-rental', 'Boat and yacht rental', 'anchor', 3),
  ('550e8400-e29b-41d4-a716-446655440004', 'Villa Rental', 'villa-rental', 'Villa rental services', 'home', 4),
  ('550e8400-e29b-41d4-a716-446655440005', 'Properties for Sale', 'properties-for-sale', 'Real estate sales services', 'building', 5);

-- Insert services i18n - Turkish
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'tr', 'Araç Kiralama', 'arac-kiralama', 
   'Ekonomik, orta sınıf, üst segment ve ATV/Jeep seçenekleri ile ihtiyacınıza uygun araç kiralayın.',
   'Antalya''da araç kiralama konusunda uzman ekibimizle, geniş araç filomuzdan size en uygun seçeneği sunuyoruz. Ekonomik arabalardan lüks araçlara, SUV''lardan cabrio''lara kadar her ihtiyaca uygun araç kiralama seçeneklerimiz mevcuttur.',
   'Antalya Araç Kiralama | RentBuy Antalya',
   'Antalya''da güvenilir araç kiralama hizmeti. Ekonomik fiyatlar, geniş araç filosu, 7/24 destek. Hemen rezervasyon yapın!'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'tr', 'VIP Transfer', 'vip-transfer',
   'Havalimanı karşılama, şehir içi ve bölgesel transferleriniz için VIP hizmet.',
   'Antalya Havalimanı''ndan otel ve konaklama yerinize kadar konforlu ve güvenli VIP transfer hizmeti sunuyoruz. Profesyonel şoförlerimiz ve lüks araçlarımızla yolculuğunuzu keyifli hale getiriyoruz.',
   'Antalya VIP Transfer | Havalimanı Transfer',
   'Antalya Havalimanı VIP transfer hizmeti. 7/24 güvenli ve konforlu ulaşım. Profesyonel şoför ve lüks araçlar.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'tr', 'Tekne Kiralama', 'tekne-kiralama',
   'Günlük turlar ve lüks yat kiralama ile denizin tadını çıkarın.',
   'Antalya''nın muhteşem koylarını keşfetmek için günlük tekne turları ve özel yat kiralama hizmetimiz var. Deneyimli kaptanımız eşliğinde unutulmaz bir deniz yolculuğu yapabilirsiniz.',
   'Antalya Tekne Kiralama | Yat Turu',
   'Antalya tekne kiralama ve yat turu hizmetleri. Günlük turlar, özel yat kiralama, deneyimli kaptan eşliğinde güvenli yolculuk.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'tr', 'Villa Kiralama', 'villa-kiralama',
   'Antalya, Kaş, Bodrum ve Fethiye''de lüks villa kiralama seçenekleri.',
   'Muhteşem manzaralı, özel havuzlu lüks villalarımızda unutulmaz bir tatil geçirin. Antalya ve çevresindeki en güzel lokasyonlarda, aileniz ve arkadaşlarınızla özel zaman geçirmek için ideal villalar.',
   'Antalya Villa Kiralama | Lüks Tatil Villaları',
   'Antalya, Kaş, Bodrum ve Fethiye''de lüks villa kiralama. Özel havuzlu, muhteşem manzaralı tatil villaları.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'tr', 'Satılık Konutlar', 'satilik-konutlar',
   'Antalya ve çevresinde satılık daire, villa ve arsa seçenekleri.',
   'Antalya''nın en değerli lokasyonlarında yatırım fırsatları ve yaşamak için ideal konutlar. Deniz manzaralı dairelerden, bahçeli villalara, yatırımlık arsalardan lüks rezidanslara kadar geniş portföyümüzle hizmetinizdeyiz.',
   'Antalya Satılık Konut | Emlak Yatırım Fırsatları',
   'Antalya satılık daire, villa ve arsa. Deniz manzaralı konutlar, yatırım fırsatları, güvenilir emlak danışmanlığı.'
  );

-- Insert services i18n - English
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'en', 'Car Rental', 'car-rental', 
   'Rent the right car for your needs with economic, mid-class, premium and ATV/Jeep options.',
   'With our expert team in car rental in Antalya, we offer you the most suitable option from our wide vehicle fleet. We have car rental options suitable for every need, from economy cars to luxury vehicles, from SUVs to convertibles.',
   'Antalya Car Rental | RentBuy Antalya',
   'Reliable car rental service in Antalya. Affordable prices, wide vehicle fleet, 24/7 support. Book now!'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'en', 'VIP Transfer', 'vip-transfer',
   'VIP service for airport pickup, city and regional transfers.',
   'We offer comfortable and safe VIP transfer service from Antalya Airport to your hotel and accommodation. We make your journey enjoyable with our professional drivers and luxury vehicles.',
   'Antalya VIP Transfer | Airport Transfer',
   'Antalya Airport VIP transfer service. 24/7 safe and comfortable transportation. Professional driver and luxury vehicles.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'en', 'Boat Rental', 'boat-rental',
   'Enjoy the sea with daily tours and luxury yacht rentals.',
   'We have daily boat tours and private yacht rental services to discover the magnificent bays of Antalya. You can take an unforgettable sea voyage accompanied by our experienced captain.',
   'Antalya Boat Rental | Yacht Tour',
   'Antalya boat rental and yacht tour services. Daily tours, private yacht rental, safe journey accompanied by experienced captain.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'en', 'Villa Rental', 'villa-rental',
   'Luxury villa rental options in Antalya, Kas, Bodrum and Fethiye.',
   'Have an unforgettable vacation in our luxury villas with magnificent views and private pools. Ideal villas to spend private time with your family and friends in the most beautiful locations in and around Antalya.',
   'Antalya Villa Rental | Luxury Holiday Villas',
   'Luxury villa rental in Antalya, Kas, Bodrum and Fethiye. Holiday villas with private pools and magnificent views.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'en', 'Properties for Sale', 'properties-for-sale',
   'Apartments, villas and land for sale options in Antalya and surrounding areas.',
   'Investment opportunities and ideal homes to live in the most valuable locations of Antalya. We are at your service with our wide portfolio from sea view apartments to garden villas, from investment lands to luxury residences.',
   'Antalya Properties for Sale | Real Estate Investment Opportunities',
   'Antalya apartments, villas and land for sale. Sea view properties, investment opportunities, reliable real estate consultancy.'
  );

-- Insert services i18n - Russian
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'ru', 'Аренда автомобилей', 'arenda-avtomobilej', 
   'Арендуйте подходящий автомобиль с экономичными, средними, премиальными вариантами и ATV/Jeep.',
   'Благодаря нашей экспертной команде по аренде автомобилей в Анталье, мы предлагаем вам наиболее подходящий вариант из нашего широкого автопарка. У нас есть варианты аренды автомобилей на любой вкус: от эконом-класса до роскошных автомобилей, от внедорожников до кабриолетов.',
   'Аренда автомобилей в Анталье | RentBuy Antalya',
   'Надежная услуга аренды автомобилей в Анталье. Доступные цены, широкий автопарк, поддержка 24/7. Забронируйте сейчас!'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'ru', 'VIP трансфер', 'vip-transfer',
   'VIP услуги для встречи в аэропорту, городских и региональных трансферов.',
   'Мы предлагаем комфортабельный и безопасный VIP трансфер из аэропорта Антальи до вашего отеля и места размещения. Мы делаем ваше путешествие приятным с нашими профессиональными водителями и роскошными автомобилями.',
   'VIP трансфер в Анталье | Трансфер из аэропорта',
   'VIP трансфер из аэропорта Антальи. Безопасная и комфортабельная транспортировка 24/7. Профессиональный водитель и роскошные автомобили.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'ru', 'Аренда лодок', 'arenda-lodok',
   'Наслаждайтесь морем с ежедневными турами и арендой роскошных яхт.',
   'У нас есть ежедневные лодочные туры и услуги аренды частных яхт для изучения великолепных бухт Антальи. Вы можете совершить незабываемое морское путешествие в сопровождении нашего опытного капитана.',
   'Аренда лодок в Анталье | Яхт-тур',
   'Услуги аренды лодок и яхт-туров в Анталье. Ежедневные туры, аренда частных яхт, безопасное путешествие в сопровождении опытного капитана.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'ru', 'Аренда вилл', 'arenda-vill',
   'Варианты аренды роскошных вилл в Анталье, Каше, Бодруме и Фетхие.',
   'Проведите незабываемый отпуск в наших роскошных виллах с великолепными видами и частными бассейнами. Идеальные виллы для проведения личного времени с семьей и друзьями в самых красивых местах Антальи и окрестностей.',
   'Аренда вилл в Анталье | Роскошные праздничные виллы',
   'Аренда роскошных вилл в Анталье, Каше, Бодруме и Фетхие. Праздничные виллы с частными бассейнами и великолепными видами.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'ru', 'Недвижимость на продажу', 'nedvizhimost-na-prodazhu',
   'Варианты квартир, вилл и земельных участков на продажу в Анталье и окрестностях.',
   'Инвестиционные возможности и идеальные дома для проживания в самых ценных местах Антальи. Мы к вашим услугам с широким портфолио от квартир с видом на море до вилл с садом, от инвестиционных земель до роскошных резиденций.',
   'Недвижимость на продажу в Анталье | Инвестиционные возможности в недвижимость',
   'Квартиры, виллы и земля на продажу в Анталье. Недвижимость с видом на море, инвестиционные возможности, надежное консультирование по недвижимости.'
  );

-- Insert services i18n - Arabic
INSERT INTO services_i18n (service_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'ar', 'تأجير السيارات', 'taajir-alsayarat', 
   'استأجر السيارة المناسبة لاحتياجاتك مع الخيارات الاقتصادية والمتوسطة والمميزة و ATV/Jeep.',
   'مع فريقنا الخبير في تأجير السيارات في أنطاليا، نقدم لك الخيار الأنسب من أسطولنا الواسع من المركبات. لدينا خيارات تأجير السيارات المناسبة لكل حاجة، من السيارات الاقتصادية إلى المركبات الفاخرة، من سيارات الدفع الرباعي إلى القابلة للتحويل.',
   'تأجير السيارات في أنطاليا | RentBuy Antalya',
   'خدمة تأجير السيارات الموثوقة في أنطاليا. أسعار معقولة، أسطول واسع من المركبات، دعم 24/7. احجز الآن!'
  ),
  ('550e8400-e29b-41d4-a716-446655440002', 'ar', 'النقل المميز', 'alnaql-almumayaz',
   'خدمة مميزة لاستقبال المطار والنقل في المدينة والإقليمي.',
   'نقدم خدمة نقل مميزة مريحة وآمنة من مطار أنطاليا إلى الفندق ومكان الإقامة الخاص بك. نجعل رحلتك ممتعة مع سائقينا المحترفين ومركباتنا الفاخرة.',
   'النقل المميز في أنطاليا | نقل المطار',
   'خدمة النقل المميز من مطار أنطاليا. نقل آمن ومريح 24/7. سائق محترف ومركبات فاخرة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440003', 'ar', 'تأجير القوارب', 'taajir-alqawarib',
   'استمتع بالبحر مع الجولات اليومية وتأجير اليخوت الفاخرة.',
   'لدينا جولات قوارب يومية وخدمات تأجير يخوت خاصة لاستكشاف خلجان أنطاليا الرائعة. يمكنك القيام برحلة بحرية لا تُنسى برفقة قبطاننا ذي الخبرة.',
   'تأجير القوارب في أنطاليا | جولة اليخت',
   'خدمات تأجير القوارب وجولات اليخت في أنطاليا. جولات يومية، تأجير يخوت خاصة، رحلة آمنة برفقة قبطان ذي خبرة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440004', 'ar', 'تأجير الفيلات', 'taajir-alfilat',
   'خيارات تأجير الفيلات الفاخرة في أنطاليا وكاش وبودروم وفتحية.',
   'اقض إجازة لا تُنسى في فيلاتنا الفاخرة ذات المناظر الرائعة والمسابح الخاصة. فيلات مثالية لقضاء وقت خاص مع العائلة والأصدقاء في أجمل المواقع في أنطاليا وحولها.',
   'تأجير الفيلات في أنطاليا | فيلات العطلات الفاخرة',
   'تأجير الفيلات الفاخرة في أنطاليا وكاش وبودروم وفتحية. فيلات العطلات مع المسابح الخاصة والمناظر الرائعة.'
  ),
  ('550e8400-e29b-41d4-a716-446655440005', 'ar', 'عقارات للبيع', 'aqarat-lilbay',
   'خيارات شقق وفيلات وأراضي للبيع في أنطاليا والمناطق المحيطة.',
   'فرص استثمارية ومنازل مثالية للعيش في أثمن المواقع في أنطاليا. نحن في خدمتكم بمحفظتنا الواسعة من الشقق ذات إطلالة البحر إلى الفيلات ذات الحدائق، ومن الأراضي الاستثمارية إلى المساكن الفاخرة.',
   'عقارات للبيع في أنطاليا | فرص الاستثمار العقاري',
   'شقق وفيلات وأراضي للبيع في أنطاليا. عقارات بإطلالة بحرية، فرص استثمارية، استشارات عقارية موثوقة.'
  );

-- Insert car segments
INSERT INTO car_segments (id, name, slug, icon, price_range_min, price_range_max, features, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', 'Economic', 'economic', 'car-front', 150, 300, '["fuel_efficient", "manual_transmission", "air_conditioning"]', 1),
  ('550e8400-e29b-41d4-a716-446655440012', 'Mid-Class', 'mid-class', 'car-suv', 300, 600, '["automatic_transmission", "gps", "bluetooth", "cruise_control"]', 2),
  ('550e8400-e29b-41d4-a716-446655440013', 'Premium', 'premium', 'car-sport', 600, 1200, '["leather_seats", "sunroof", "premium_sound", "navigation"]', 3),
  ('550e8400-e29b-41d4-a716-446655440014', 'ATV/Jeep', 'atv-jeep', 'truck', 400, 800, '["4wd", "off_road", "roof_rack", "tow_hitch"]', 4);

-- Insert car segments i18n - Turkish
INSERT INTO car_segments_i18n (segment_id, locale, title, slug, summary, body) VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', 'tr', 'Ekonomik Araçlar', 'ekonomik-araclar',
   'Uygun fiyatlı, yakıt tasarruflu ekonomik araç seçenekleri.',
   'Günlük kiralama için en uygun maliyetli çözüm. Şehir içi kulanım için ideal, yakıt tasarruflu ve pratik araçlar.'
  ),
  ('550e8400-e29b-41d4-a716-446655440012', 'tr', 'Orta Sınıf Araçlar', 'orta-sinif-araclar',
   'Konfor ve performansı birleştiren orta segment araçlar.',
   'Otomatik vites, klima, GPS navigasyon gibi konfor özellikleri ile donatılmış, aileler için ideal araç seçenekleri.'
  ),
  ('550e8400-e29b-41d4-a716-446655440013', 'tr', 'Lüks Araçlar', 'luks-araclar',
   'Üst segment lüks araçlarla özel bir deneyim yaşayın.',
   'Deri koltuk, sunroof, premium ses sistemi ve gelişmiş navigasyon özellikleri ile lüks seyahat deneyimi.'
  ),
  ('550e8400-e29b-41d4-a716-446655440014', 'tr', 'ATV/Jeep', 'atv-jeep',
   'Macera tutkunları için off-road araçlar.',
   '4x4 çekiş sistemi ile doğada macera yapmak isteyenler için ideal. Dağ yolları ve off-road güzergahlar için mükemmel.'
  );

-- Insert villa regions
INSERT INTO villa_regions (id, name, slug, image_url, sort_order) VALUES 
  ('550e8400-e29b-41d4-a716-446655440021', 'Antalya', 'antalya', '/images/regions/antalya.jpg', 1),
  ('550e8400-e29b-41d4-a716-446655440022', 'Kas', 'kas', '/images/regions/kas.jpg', 2),
  ('550e8400-e29b-41d4-a716-446655440023', 'Bodrum', 'bodrum', '/images/regions/bodrum.jpg', 3),
  ('550e8400-e29b-41d4-a716-446655440024', 'Fethiye', 'fethiye', '/images/regions/fethiye.jpg', 4);

-- Insert villa regions i18n - Turkish
INSERT INTO villa_regions_i18n (region_id, locale, title, slug, summary, body) VALUES 
  ('550e8400-e29b-41d4-a716-446655440021', 'tr', 'Antalya Villaları', 'antalya-villalari',
   'Antalya merkezde ve çevresinde lüks villa seçenekleri.',
   'Akdeniz''in incisi Antalya''da, deniz manzaralı ve havuzlu lüks villalarımızda unutulmaz bir tatil geçirin.'
  ),
  ('550e8400-e29b-41d4-a716-446655440022', 'tr', 'Kaş Villaları', 'kas-villalari',
   'Kaş''ın eşsiz doğasında huzurlu villa tatili.',
   'Kaş''ın sakin atmosferi ve muhteşem doğasında, özel havuzlu villalarla büyüleyici bir tatil deneyimi.'
  ),
  ('550e8400-e29b-41d4-a716-446655440023', 'tr', 'Bodrum Villaları', 'bodrum-villalari',
   'Bodrum''un eşsiz koylarında lüks villa deneyimi.',
   'Ege''nin gözbebeği Bodrum''da, denize sıfır villalarımızla unutulmaz anlar yaşayın.'
  ),
  ('550e8400-e29b-41d4-a716-446655440024', 'tr', 'Fethiye Villaları', 'fethiye-villalari',
   'Fethiye''nin muhteşem koylarında villa tatili.',
   'Ölüdeniz ve çevresindeki eşsiz doğal güzelliklerde, lüks villalarımızla huzurlu bir tatil.'
  );

-- Insert some sample coupons
INSERT INTO coupons (code, type, value, min_amount, max_usage, expires_at) VALUES 
  ('WELCOME10', 'percentage', 10, 500, 100, NOW() + INTERVAL '1 year'),
  ('BIRTHDAY', 'birthday', 15, 300, 1000, NOW() + INTERVAL '1 year'),
  ('SUMMER2025', 'percentage', 20, 1000, 50, '2025-09-30 23:59:59');

-- Insert some static pages
INSERT INTO pages (slug, page_type, sort_order) VALUES 
  ('about', 'static', 1),
  ('contact', 'static', 2),
  ('privacy', 'static', 3),
  ('terms', 'static', 4);

-- Insert pages i18n - Turkish
INSERT INTO pages_i18n (page_id, locale, title, slug, summary, body, meta_title, meta_description) VALUES 
  ((SELECT id FROM pages WHERE slug = 'about'), 'tr', 'Hakkımızda', 'hakkimizda',
   'RentBuy Antalya hakkında bilgi edinin.',
   'Antalya''da turizm sektöründe yılların verdiği deneyimle hizmet vermekteyiz...',
   'Hakkımızda | RentBuy Antalya',
   'RentBuy Antalya olarak Antalya turizm sektöründeki deneyimimiz ve kaliteli hizmet anlayışımız hakkında bilgi edinin.'
  ),
  ((SELECT id FROM pages WHERE slug = 'contact'), 'tr', 'İletişim', 'iletisim',
   'Bizimle iletişime geçin.',
   'Sorularınız ve rezervasyon talepleriniz için bizimle iletişime geçebilirsiniz...',
   'İletişim | RentBuy Antalya',
   'RentBuy Antalya ile iletişime geçin. WhatsApp, telefon ve e-posta iletişim bilgileri.'
  );

-- Insert admin users (password: 'admin123' hashed with bcrypt)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES 
  ('admin@rentbuyantalya.com', '$2b$10$yj.J4tS/HmIO9EqIH.Yt2ePDFrcnHxV3Xf4YxCTTKjAXyXV5Wu5hy', 'Admin User', 'super_admin'),
  ('manager@rentbuyantalya.com', '$2b$10$yj.J4tS/HmIO9EqIH.Yt2ePDFrcnHxV3Xf4YxCTTKjAXyXV5Wu5hy', 'Manager User', 'manager');