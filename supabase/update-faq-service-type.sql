-- FAQ tablosuna service_type sütunu ekle
ALTER TABLE faqs ADD COLUMN service_type VARCHAR(50);

-- Service türleri için index ekle
CREATE INDEX idx_faqs_service_type ON faqs(service_type);

-- Service türleri için constraint ekle
ALTER TABLE faqs ADD CONSTRAINT check_service_type 
CHECK (service_type IN (
  'rent-a-car', 
  'vip-transfer', 
  'tekne-kiralama', 
  'villa-kiralama', 
  'apart-kiralama', 
  'properties-for-sale',
  'general'
));

-- Mevcut FAQ'ları general olarak işaretle
UPDATE faqs SET service_type = 'general' WHERE service_type IS NULL;

-- Örnek service-specific FAQ'lar ekle
INSERT INTO faqs (question_tr, answer_tr, question_en, answer_en, question_ru, answer_ru, question_ar, answer_ar, service_type, sort_order) VALUES

-- Araç Kiralama FAQ'ları
(
  'Araç kiralama yaş sınırı nedir?',
  'Araç kiralamak için minimum 21 yaşında olmalısınız ve en az 1 yıllık ehliyet deneyimine sahip olmalısınız.',
  'What is the minimum age for car rental?',
  'You must be at least 21 years old and have at least 1 year of driving license experience to rent a car.',
  'Каков минимальный возраст для аренды автомобиля?',
  'Вам должно быть не менее 21 года, и у вас должен быть опыт вождения не менее 1 года.',
  'ما هو الحد الأدنى لعمر استئجار السيارة؟',
  'يجب أن تكون على الأقل 21 عاماً ولديك خبرة في القيادة لا تقل عن سنة واحدة.',
  'rent-a-car',
  1
),
(
  'Araç kiralamada depozit gerekli mi?',
  'Evet, araç kiralamada güvenlik depoziti gereklidir. Miktar araç segmentine göre değişir ve araç teslim edildiğinde iade edilir.',
  'Is deposit required for car rental?',
  'Yes, security deposit is required for car rental. Amount varies by car segment and is returned when the car is returned.',
  'Требуется ли депозит для аренды автомобиля?',
  'Да, для аренды автомобиля требуется залог. Сумма зависит от сегмента автомобиля и возвращается при возврате автомобиля.',
  'هل يتطلب إيداع لاستئجار السيارة؟',
  'نعم، مطلوب إيداع أمان لاستئجار السيارة. المبلغ يختلف حسب فئة السيارة ويُسترد عند إرجاع السيارة.',
  'rent-a-car',
  2
),

-- VIP Transfer FAQ'ları
(
  'VIP transfer rezervasyonu ne kadar önceden yapmalıyım?',
  'VIP transfer hizmetimiz için mümkün olduğunca erken rezervasyon yapmanızı öneririz. Minimum 2 saat öncesinden rezervasyon kabul ediyoruz.',
  'How early should I book VIP transfer?',
  'We recommend booking our VIP transfer service as early as possible. We accept reservations minimum 2 hours in advance.',
  'Как рано мне следует бронировать VIP-трансфер?',
  'Мы рекомендуем бронировать наш VIP-трансфер как можно раньше. Принимаем бронирования минимум за 2 часа.',
  'متى يجب أن أحجز خدمة النقل المميز؟',
  'نوصي بحجز خدمة النقل المميز في أقرب وقت ممكن. نقبل الحجوزات قبل ساعتين على الأقل.',
  'vip-transfer',
  1
),

-- Tekne Kiralama FAQ'ları
(
  'Tekne kiralamada kaptan dahil mi?',
  'Evet, tüm tekne kiralamalarımızda deneyimli kaptan dahildir. Güvenli ve keyifli bir yolculuk için profesyonel kaptan hizmetimiz mevcuttur.',
  'Is captain included in boat rental?',
  'Yes, experienced captain is included in all our boat rentals. Professional captain service is available for safe and enjoyable journey.',
  'Включен ли капитан в аренду лодки?',
  'Да, опытный капитан включен во все наши аренды лодок. Профессиональная служба капитана доступна для безопасного и приятного путешествия.',
  'هل يشمل استئجار القارب القبطان؟',
  'نعم، القبطان ذو الخبرة مشمول في جميع استئجارات القوارب. خدمة القبطان المحترف متاحة لرحلة آمنة وممتعة.',
  'tekne-kiralama',
  1
),

-- Villa Kiralama FAQ'ları
(
  'Villa rezervasyonunda minimum konaklama süresi var mı?',
  'Sezona ve villaya göre minimum konaklama süreleri değişmektedir. Genellikle 3-7 gece minimum konaklama gereklidir.',
  'Is there minimum stay for villa reservations?',
  'Minimum stay periods vary by season and villa. Generally 3-7 nights minimum stay is required.',
  'Есть ли минимальное пребывание для бронирования виллы?',
  'Минимальные сроки пребывания зависят от сезона и виллы. Обычно требуется минимальное пребывание 3-7 ночей.',
  'هل هناك حد أدنى للإقامة في حجوزات الفيلا؟',
  'تختلف فترات الإقامة الدنيا حسب الموسم والفيلا. عادة ما يتطلب الإقامة لمدة 3-7 ليال كحد أدنى.',
  'villa-kiralama',
  1
),

-- Satılık Konutlar FAQ'ları
(
  'Emlak görüşmeleri için randevu gerekli mi?',
  'Evet, emlak görüşmeleri için önceden randevu almanızı rica ediyoruz. Bu şekilde size daha iyi hizmet verebiliriz.',
  'Is appointment required for property viewings?',
  'Yes, we ask you to make an appointment in advance for property viewings. This way we can serve you better.',
  'Требуется ли запись на просмотр недвижимости?',
  'Да, мы просим записаться заранее для просмотра недвижимости. Таким образом мы сможем лучше обслуживать вас.',
  'هل المطلوب موعد لمعاينة العقارات؟',
  'نعم، نطلب منك تحديد موعد مسبق لمعاينة العقارات. بهذه الطريقة يمكننا خدمتك بشكل أفضل.',
  'properties-for-sale',
  1
);