-- FAQ tablosunu oluştur
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_tr TEXT NOT NULL,
  answer_tr TEXT NOT NULL,
  question_en TEXT,
  answer_en TEXT,
  question_ru TEXT,
  answer_ru TEXT,
  question_ar TEXT,
  answer_ar TEXT,
  sort_order INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ tablosu için RLS politikaları
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Herkes aktif FAQ'ları okuyabilir
CREATE POLICY "Anyone can view active FAQs" ON faqs
  FOR SELECT USING (active = true);

-- Sadece admin'ler FAQ'ları yönetebilir
CREATE POLICY "Admins can manage FAQs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Örnek FAQ verilerini ekle
INSERT INTO faqs (question_tr, answer_tr, question_en, answer_en, question_ru, answer_ru, question_ar, answer_ar, sort_order) VALUES
(
  'Rezervasyon nasıl yapılır?',
  'WhatsApp üzerinden +90 XXX XXX XX XX numaramızdan veya telefon ile iletişime geçerek rezervasyon yapabilirsiniz. Size en uygun tarihleri ve fiyatları sunacağız.',
  'How to make a reservation?',
  'You can make a reservation by contacting us via WhatsApp at +90 XXX XXX XX XX or by phone. We will offer you the most suitable dates and prices.',
  'Как сделать бронирование?',
  'Вы можете забронировать, связавшись с нами через WhatsApp по номеру +90 XXX XXX XX XX или по телефону. Мы предложим вам наиболее подходящие даты и цены.',
  'كيفية إجراء حجز؟',
  'يمكنك إجراء حجز عن طريق الاتصال بنا عبر واتساب على الرقم +90 XXX XXX XX XX أو عبر الهاتف. سنقدم لك أنسب التواريخ والأسعار.',
  1
),
(
  'Ödeme seçenekleri nelerdir?',
  'Nakit, kredi kartı, banka havalesi ve online ödeme seçenekleri mevcuttur. Rezervasyon sırasında ön ödeme gerekebilir.',
  'What are the payment options?',
  'Cash, credit card, bank transfer and online payment options are available. Advance payment may be required during reservation.',
  'Какие варианты оплаты?',
  'Доступны наличные, кредитная карта, банковский перевод и онлайн-платежи. При бронировании может потребоваться предоплата.',
  'ما هي خيارات الدفع؟',
  'تتوفر خيارات الدفع النقدي والبطاقة الائتمانية والتحويل المصرفي والدفع الإلكتروني. قد تكون هناك حاجة لدفعة مقدمة عند الحجز.',
  2
),
(
  'İptal ve değişiklik koşulları nedir?',
  'İptal ve değişiklik koşulları hizmet türüne göre değişmektedir. Genellikle 24-48 saat öncesinden iptal edilirse ücret iadesi yapılır.',
  'What are the cancellation and change conditions?',
  'Cancellation and change conditions vary by service type. Generally, if canceled 24-48 hours in advance, a refund will be made.',
  'Каковы условия отмены и изменения?',
  'Условия отмены и изменения зависят от типа услуги. Обычно при отмене за 24-48 часов возвращается плата.',
  'ما هي شروط الإلغاء والتعديل؟',
  'تختلف شروط الإلغاء والتعديل حسب نوع الخدمة. عموماً، إذا تم الإلغاء قبل 24-48 ساعة، سيتم رد الرسوم.',
  3
),
(
  'Sigorta kapsamı var mı?',
  'Tüm araçlarımız ve teknelerimiz kapsamlı sigorta ile korunmaktadır. Ayrıca müşterilerimiz için ek sigorta seçenekleri mevcuttur.',
  'Is there insurance coverage?',
  'All our vehicles and boats are protected with comprehensive insurance. Additional insurance options are available for our customers.',
  'Есть ли страхование?',
  'Все наши автомобили и лодки защищены комплексной страховкой. Для наших клиентов доступны дополнительные варианты страхования.',
  'هل يوجد تغطية تأمينية؟',
  'جميع مركباتنا وقواربنا محمية بتأمين شامل. تتوفر خيارات تأمين إضافية لعملائنا.',
  4
),
(
  'Yaş sınırı var mı?',
  'Araç kiralama için minimum 21 yaş ve geçerli ehliyet gereklidir. Diğer hizmetler için yaş sınırı bulunmamaktadır.',
  'Is there an age limit?',
  'Minimum age 21 and valid license required for car rental. There is no age limit for other services.',
  'Есть ли возрастное ограничение?',
  'Для аренды автомобиля требуется минимальный возраст 21 год и действующие права. Для других услуг возрастных ограничений нет.',
  'هل يوجد حد أدنى للعمر؟',
  'يتطلب استئجار السيارة عمر 21 سنة كحد أدنى ورخصة قيادة سارية. لا يوجد حد عمري للخدمات الأخرى.',
  5
);

-- Updated at trigger'ını ekle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();