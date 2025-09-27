-- RentBuyAntalya.com Database Schema
-- This script creates all necessary tables for the multilingual tourism website

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services table (main service categories)
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100), -- icon name for UI
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services internationalization
CREATE TABLE services_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, locale)
);

-- Car segments (for rent-a-car service)
CREATE TABLE car_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(100),
  price_range_min INTEGER, -- daily price in TL
  price_range_max INTEGER,
  features JSONB DEFAULT '[]'::jsonb, -- array of feature keys
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car segments internationalization
CREATE TABLE car_segments_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  segment_id UUID REFERENCES car_segments(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(segment_id, locale)
);

-- Villa regions (for villa rental service)
CREATE TABLE villa_regions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villa regions internationalization
CREATE TABLE villa_regions_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region_id UUID REFERENCES villa_regions(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(region_id, locale)
);

-- Generic listings (cars, villas, boats, etc.)
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES car_segments(id) ON DELETE SET NULL, -- nullable, only for cars
  region_id UUID REFERENCES villa_regions(id) ON DELETE SET NULL, -- nullable, only for villas
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb, -- array of image URLs
  features JSONB DEFAULT '[]'::jsonb, -- array of feature keys
  price_range_min INTEGER,
  price_range_max INTEGER,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, slug)
);

-- Listings internationalization
CREATE TABLE listings_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, locale)
);

-- Members table
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  preferences JSONB DEFAULT '{}'::jsonb,
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons/Promotions table
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed', 'birthday')),
  value INTEGER NOT NULL, -- percentage or fixed amount in TL
  min_amount INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 1, -- how many times this coupon can be used total
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member-coupon relationship (track individual usage)
CREATE TABLE member_coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, coupon_id)
);

-- Events tracking table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'service_view', 'whatsapp_click', etc.
  page_path VARCHAR(500) NOT NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily visits counter
CREATE TABLE daily_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  page_path VARCHAR(500) NOT NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, page_path, locale)
);

-- Reservations table
CREATE TABLE reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests_count INTEGER DEFAULT 1,
  total_price INTEGER, -- in TL
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  discount_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no overlapping reservations for the same listing
  CONSTRAINT no_overlap_reservations EXCLUDE USING GIST (
    listing_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('confirmed', 'pending'))
);

-- Availability calendar for listings
CREATE TABLE listing_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price INTEGER, -- daily price in TL, overrides base price
  min_nights INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, date)
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservation status history
CREATE TABLE reservation_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Static pages (about, contact, etc.)
CREATE TABLE pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  page_type VARCHAR(50) DEFAULT 'static', -- 'static', 'blog', etc.
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pages internationalization
CREATE TABLE pages_i18n (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('tr', 'en', 'ru', 'ar')),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  summary TEXT,
  body TEXT,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_id, locale)
);

-- Create indexes for better performance
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_sort ON services(sort_order);
CREATE INDEX idx_services_i18n_locale ON services_i18n(locale);
CREATE INDEX idx_services_i18n_slug ON services_i18n(slug);

CREATE INDEX idx_car_segments_active ON car_segments(active);
CREATE INDEX idx_car_segments_sort ON car_segments(sort_order);
CREATE INDEX idx_car_segments_i18n_locale ON car_segments_i18n(locale);

CREATE INDEX idx_villa_regions_active ON villa_regions(active);
CREATE INDEX idx_villa_regions_sort ON villa_regions(sort_order);
CREATE INDEX idx_villa_regions_i18n_locale ON villa_regions_i18n(locale);

CREATE INDEX idx_listings_active ON listings(active);
CREATE INDEX idx_listings_service ON listings(service_id);
CREATE INDEX idx_listings_segment ON listings(segment_id);
CREATE INDEX idx_listings_region ON listings(region_id);
CREATE INDEX idx_listings_i18n_locale ON listings_i18n(locale);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_birth ON members(birth_date);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_locale ON events(locale);
CREATE INDEX idx_events_created ON events(created_at);

CREATE INDEX idx_daily_visits_date ON daily_visits(date);
CREATE INDEX idx_daily_visits_path ON daily_visits(page_path);

CREATE INDEX idx_reservations_listing ON reservations(listing_id);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer ON reservations(customer_email);

CREATE INDEX idx_availability_listing ON listing_availability(listing_id);
CREATE INDEX idx_availability_date ON listing_availability(date);
CREATE INDEX idx_availability_available ON listing_availability(is_available);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(active);

CREATE INDEX idx_reservation_history_reservation ON reservation_status_history(reservation_id);

CREATE INDEX idx_pages_active ON pages(active);
CREATE INDEX idx_pages_i18n_locale ON pages_i18n(locale);
CREATE INDEX idx_pages_i18n_slug ON pages_i18n(slug);

-- Row Level Security (RLS) Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_segments_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE villa_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE villa_regions_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings_i18n ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages_i18n ENABLE ROW LEVEL SECURITY;

-- Public read access for active records
CREATE POLICY "Public read access" ON services FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON services_i18n FOR SELECT USING (true);
CREATE POLICY "Public read access" ON car_segments FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON car_segments_i18n FOR SELECT USING (true);
CREATE POLICY "Public read access" ON villa_regions FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON villa_regions_i18n FOR SELECT USING (true);
CREATE POLICY "Public read access" ON listings FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON listings_i18n FOR SELECT USING (true);
CREATE POLICY "Public read access" ON pages FOR SELECT USING (active = true);
CREATE POLICY "Public read access" ON pages_i18n FOR SELECT USING (true);

-- Members table policies (users can insert their own records)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own record" ON members FOR SELECT USING (auth.uid()::text = id::text);

-- Events and daily_visits - allow insert for tracking
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow event tracking" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow daily visits tracking" ON daily_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow daily visits update" ON daily_visits FOR UPDATE USING (true);

-- Reservations - public can insert, admins can manage
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all reservations" ON reservations FOR SELECT USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE active = true)
);
CREATE POLICY "Admins can update reservations" ON reservations FOR UPDATE USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE active = true)
);

-- Listing availability - public read, admin write
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read availability" ON listing_availability FOR SELECT USING (true);
CREATE POLICY "Admins can manage availability" ON listing_availability FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE active = true)
);

-- Admin users - only admins can access
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read admin users" ON admin_users FOR SELECT USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE active = true)
);

-- Reservation history - admins only
ALTER TABLE reservation_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can access reservation history" ON reservation_status_history FOR ALL USING (
  auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE active = true)
);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_i18n_updated_at BEFORE UPDATE ON services_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_car_segments_updated_at BEFORE UPDATE ON car_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_car_segments_i18n_updated_at BEFORE UPDATE ON car_segments_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villa_regions_updated_at BEFORE UPDATE ON villa_regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villa_regions_i18n_updated_at BEFORE UPDATE ON villa_regions_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_i18n_updated_at BEFORE UPDATE ON listings_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_visits_updated_at BEFORE UPDATE ON daily_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_i18n_updated_at BEFORE UPDATE ON pages_i18n
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listing_availability_updated_at BEFORE UPDATE ON listing_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();