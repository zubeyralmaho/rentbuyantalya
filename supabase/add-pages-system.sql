-- Create pages system for dynamic content management
-- SSS (FAQ), Hakkımızda (About), Kampanyalar (Campaigns), Blog pages

-- Create pages table for general page content
CREATE TABLE IF NOT EXISTS pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL CHECK (page_type IN ('general-faq', 'about', 'campaigns', 'blog')),
  slug VARCHAR(255) NOT NULL,
  title_tr TEXT NOT NULL,
  title_en TEXT,
  title_ru TEXT,
  title_ar TEXT,
  content_tr TEXT NOT NULL,
  content_en TEXT,
  content_ru TEXT,
  content_ar TEXT,
  meta_title_tr TEXT,
  meta_title_en TEXT,
  meta_title_ru TEXT,
  meta_title_ar TEXT,
  meta_description_tr TEXT,
  meta_description_en TEXT,
  meta_description_ru TEXT,
  meta_description_ar TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(page_type, slug)
);

-- Create general FAQ items table (different from service-specific FAQs)
CREATE TABLE IF NOT EXISTS general_faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_tr TEXT NOT NULL,
  question_en TEXT,
  question_ru TEXT,
  question_ar TEXT,
  answer_tr TEXT NOT NULL,
  answer_en TEXT,
  answer_ru TEXT,
  answer_ar TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create campaigns table for promotions/offers
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title_tr TEXT NOT NULL,
  title_en TEXT,
  title_ru TEXT,
  title_ar TEXT,
  description_tr TEXT NOT NULL,
  description_en TEXT,
  description_ru TEXT,
  description_ar TEXT,
  content_tr TEXT NOT NULL,
  content_en TEXT,
  content_ru TEXT,
  content_ar TEXT,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  valid_from DATE,
  valid_until DATE,
  image_url TEXT,
  campaign_code VARCHAR(50),
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create blog posts table for guides/articles
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_tr TEXT NOT NULL,
  title_en TEXT,
  title_ru TEXT,
  title_ar TEXT,
  excerpt_tr TEXT,
  excerpt_en TEXT,
  excerpt_ru TEXT,
  excerpt_ar TEXT,
  content_tr TEXT NOT NULL,
  content_en TEXT,
  content_ru TEXT,
  content_ar TEXT,
  featured_image TEXT,
  category VARCHAR(100),
  tags TEXT[],
  meta_title_tr TEXT,
  meta_title_en TEXT,
  meta_title_ru TEXT,
  meta_title_ar TEXT,
  meta_description_tr TEXT,
  meta_description_en TEXT,
  meta_description_ru TEXT,
  meta_description_ar TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to published pages" ON pages
    FOR SELECT USING (published = true);

CREATE POLICY "Allow public read access to published general FAQs" ON general_faqs
    FOR SELECT USING (published = true);

CREATE POLICY "Allow public read access to active campaigns" ON campaigns
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read access to published blog posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Create policies for admin full access (assuming admin role)
CREATE POLICY "Allow admin full access to pages" ON pages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to general FAQs" ON general_faqs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to campaigns" ON campaigns
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to blog posts" ON blog_posts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_type_published ON pages(page_type, published);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_general_faqs_published ON general_faqs(published, display_order);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_featured ON campaigns(active, featured, valid_until);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_featured ON blog_posts(published, featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category, published);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_faqs_updated_at BEFORE UPDATE ON general_faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO pages (page_type, slug, title_tr, content_tr, published) VALUES
('about', 'hakkimizda', 'Hakkımızda', 'Rent Buy Antalya olarak, Antalya''nın en güvenilir emlak ve turizm hizmetleri platformuyuz...', true);

INSERT INTO general_faqs (question_tr, answer_tr, display_order) VALUES
('Nasıl rezervasyon yapabilirim?', 'WhatsApp numaramız üzerinden 7/24 rezervasyon yapabilirsiniz.', 1),
('Ödeme seçenekleri nelerdir?', 'Nakit, kredi kartı ve havale ile ödeme yapabilirsiniz.', 2),
('İptal politikanız nedir?', 'Rezervasyon tarihinden 24 saat öncesine kadar ücretsiz iptal edebilirsiniz.', 3);

INSERT INTO campaigns (title_tr, description_tr, content_tr, discount_percentage, active, featured) VALUES
('Erken Rezervasyon Fırsatı', '30 gün önceden rezervasyon yapın %15 indirim kazanın!', 'Tüm villa ve apart kiralama hizmetlerinde geçerlidir...', 15, true, true),
('VIP Transfer İndirimi', 'Havaalanı transfer hizmetlerinde özel indirim!', 'Lüks araçlarla konforlu yolculuk...', 20, true, false);

INSERT INTO blog_posts (slug, title_tr, excerpt_tr, content_tr, category, published, featured) VALUES
('antalya-gezi-rehberi', 'Antalya Gezi Rehberi', 'Antalya''da görülmesi gereken yerler ve yapılması gerekenler...', 'Antalya, Türkiye''nin en popüler tatil destinasyonlarından biridir...', 'Rehber', true, true),
('villa-kiralama-ipuclari', 'Villa Kiralama İpuçları', 'Villa kiralarken dikkat edilmesi gereken önemli noktalar...', 'Villa kiralama sürecinde doğru tercihleri yapabilmek için...', 'İpuçları', true, false);