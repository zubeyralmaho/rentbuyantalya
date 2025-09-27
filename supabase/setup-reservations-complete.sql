-- Rezervasyon tablosunu kontrol et ve oluştur
DO $$
BEGIN
    -- Önce tabloyu kontrol et
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservations') THEN
        -- Tablo yoksa oluştur
        CREATE TABLE public.reservations (
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
        
        RAISE NOTICE 'Reservations table created successfully';
    ELSE
        -- Tablo varsa guest_count sütununu kontrol et ve eksikse ekle
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'reservations' AND column_name = 'guest_count'
        ) THEN
            ALTER TABLE public.reservations ADD COLUMN guest_count INTEGER DEFAULT 1;
            RAISE NOTICE 'Added guest_count column to existing reservations table';
        END IF;
        
        RAISE NOTICE 'Reservations table already exists';
    END IF;
END
$$;

-- İndeksler oluştur (IF NOT EXISTS kullan)
CREATE INDEX IF NOT EXISTS idx_reservations_listing_id ON public.reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON public.reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- RLS politikalarını ayarla
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "Admin can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;

-- Yeni politikalar oluştur
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

-- Tetikleyici fonksiyonu oluştur (zaten varsa üzerine yaz)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tetikleyiciyi oluştur
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Test verileri ekle (sadece tablo boşsa)
DO $$
DECLARE
    reservation_count INTEGER;
    first_listing_id UUID;
BEGIN
    -- Rezervasyon sayısını kontrol et
    SELECT COUNT(*) INTO reservation_count FROM public.reservations;
    
    -- Eğer rezervasyon yoksa test verileri ekle
    IF reservation_count = 0 THEN
        -- İlk listing'i al
        SELECT id INTO first_listing_id FROM public.listings LIMIT 1;
        
        IF first_listing_id IS NOT NULL THEN
            -- Test rezervasyonları ekle
            INSERT INTO public.reservations (
                listing_id, customer_name, customer_email, customer_phone, 
                start_date, end_date, guest_count, total_price, status
            ) VALUES
            (
                first_listing_id,
                'Zübeyr Almaho',
                'almahozubeyr@gmail.com',
                '+905426960380',
                '2025-10-15',
                '2025-10-20',
                2,
                2500.00,
                'confirmed'
            ),
            (
                first_listing_id,
                'Test User',
                'almahozubeyr@gmail.com',
                '+905551234567',
                '2025-09-01',
                '2025-09-07',
                4,
                1800.00,
                'completed'
            );
            
            RAISE NOTICE 'Added test reservations successfully';
        ELSE
            RAISE NOTICE 'No listings found to create test reservations';
        END IF;
    ELSE
        RAISE NOTICE 'Reservations table already contains % records', reservation_count;
    END IF;
END
$$;