-- Rezervasyon tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guest_count INTEGER DEFAULT 1,
  total_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_reservation_listing FOREIGN KEY (listing_id) 
    REFERENCES public.listings(id) ON DELETE CASCADE
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_reservations_listing_id ON public.reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON public.reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- RLS politikaları (rezervasyonları herkese açık yap)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

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

-- Örnek rezervasyon verileri ekle
INSERT INTO public.reservations (listing_id, customer_name, customer_email, customer_phone, start_date, end_date, guest_count, total_price, status) VALUES
  (
    (SELECT id FROM public.listings WHERE name ILIKE '%villa%' LIMIT 1),
    'Ahmet Yılmaz',
    'ahmet.yilmaz@example.com',
    '+905551234567',
    '2024-07-15',
    '2024-07-20',
    4,
    2500.00,
    'confirmed'
  ),
  (
    (SELECT id FROM public.listings WHERE name ILIKE '%apart%' LIMIT 1),
    'Sarah Johnson',
    'sarah.johnson@example.com',
    '+905559876543',
    '2024-08-01',
    '2024-08-07',
    2,
    1400.00,
    'pending'
  ),
  (
    (SELECT id FROM public.listings WHERE name ILIKE '%car%' LIMIT 1),
    'Михаил Петров',
    'mikhail.petrov@example.com',
    '+905552345678',
    '2024-06-10',
    '2024-06-15',
    1,
    750.00,
    'completed'
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