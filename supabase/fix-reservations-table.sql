-- Mevcut rezervasyon tablosunu kontrol et ve eksik sütunları ekle

-- Eğer guest_count sütunu yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'guest_count'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN guest_count INTEGER DEFAULT 1;
    END IF;
END $$;

-- Eğer notes sütunu yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Eğer total_price sütunu yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'total_price'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN total_price DECIMAL(10,2);
    END IF;
END $$;

-- Eğer status sütunu yoksa ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.reservations 
        ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- İndeksleri güvenle oluştur
CREATE INDEX IF NOT EXISTS idx_reservations_listing_id ON public.reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON public.reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- Tabloyu RLS ile etkinleştir
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle ve yeniden oluştur
DROP POLICY IF EXISTS "Admin can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;

-- Admin kullanıcıları için tam erişim
CREATE POLICY "Admin can manage all reservations" ON public.reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Kullanıcılar sadece kendi rezervasyonlarını görebilir
CREATE POLICY "Users can view their own reservations" ON public.reservations
  FOR SELECT USING (
    customer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Herkese rezervasyon oluşturma izni
CREATE POLICY "Anyone can create reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

-- Kullanıcılar sadece kendi rezervasyonlarını güncelleyebilir
CREATE POLICY "Users can update their own reservations" ON public.reservations
  FOR UPDATE USING (
    customer_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Tetikleyici fonksiyonu: updated_at otomatik güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tetikleyiciyi rezervasyon tablosuna ekle
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Örnek rezervasyon verileri ekle (sadece eksik sütunlar varsa)
INSERT INTO public.reservations (listing_id, customer_name, customer_email, customer_phone, start_date, end_date, guest_count, total_price, status) 
SELECT 
  l.id,
  'Ahmet Yılmaz',
  'ahmet.yilmaz@example.com',
  '+905551234567',
  '2024-07-15'::date,
  '2024-07-20'::date,
  4,
  2500.00,
  'confirmed'
FROM public.listings l 
WHERE l.name ILIKE '%villa%' 
AND NOT EXISTS (
  SELECT 1 FROM public.reservations r 
  WHERE r.customer_email = 'ahmet.yilmaz@example.com'
)
LIMIT 1;

INSERT INTO public.reservations (listing_id, customer_name, customer_email, customer_phone, start_date, end_date, guest_count, total_price, status) 
SELECT 
  l.id,
  'Sarah Johnson',
  'sarah.johnson@example.com',
  '+905559876543',
  '2024-08-01'::date,
  '2024-08-07'::date,
  2,
  1400.00,
  'pending'
FROM public.listings l 
WHERE l.name ILIKE '%apart%' 
AND NOT EXISTS (
  SELECT 1 FROM public.reservations r 
  WHERE r.customer_email = 'sarah.johnson@example.com'
)
LIMIT 1;

INSERT INTO public.reservations (listing_id, customer_name, customer_email, customer_phone, start_date, end_date, guest_count, total_price, status) 
SELECT 
  l.id,
  'Михаил Петров',
  'mikhail.petrov@example.com',
  '+905552345678',
  '2024-06-10'::date,
  '2024-06-15'::date,
  1,
  750.00,
  'completed'
FROM public.listings l 
WHERE l.name ILIKE '%car%' 
AND NOT EXISTS (
  SELECT 1 FROM public.reservations r 
  WHERE r.customer_email = 'mikhail.petrov@example.com'
)
LIMIT 1;