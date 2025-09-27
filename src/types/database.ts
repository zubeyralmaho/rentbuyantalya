export type Locale = 'tr' | 'en' | 'ru' | 'ar';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AdminRole = 'super_admin' | 'admin' | 'manager';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceI18n {
  id: string;
  service_id: string;
  locale: Locale;
  title: string;
  slug: string;
  summary: string;
  body: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CarSegment {
  id: string;
  name: string;
  slug: string;
  icon: string;
  price_range_min: number;
  price_range_max: number;
  features: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CarSegmentI18n {
  id: string;
  segment_id: string;
  locale: Locale;
  title: string;
  slug: string;
  summary: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface VillaRegion {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface VillaRegionI18n {
  id: string;
  region_id: string;
  locale: Locale;
  title: string;
  slug: string;
  summary: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  preferences: Record<string, any>;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  service_id: string;
  segment_id?: string;
  region_id?: string;
  name: string;
  slug: string;
  images: string[];
  features: string[];
  price_range_min?: number;
  price_range_max?: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ListingI18n {
  id: string;
  listing_id: string;
  locale: Locale;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_type: string;
  page_path: string;
  locale: Locale;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  user_agent?: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DailyVisit {
  id: string;
  date: string;
  page_path: string;
  locale: Locale;
  visit_count: number;
  created_at: string;
  updated_at: string;
}

// Reservation System Types
export interface Reservation {
  id: string;
  listing_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  total_price?: number;
  currency: string;
  status: ReservationStatus;
  special_requests?: string;
  coupon_id?: string;
  discount_amount: number;
  created_at: string;
  updated_at: string;
}

export interface ListingAvailability {
  id: string;
  listing_id: string;
  date: string;
  is_available: boolean;
  price?: number;
  min_nights: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReservationStatusHistory {
  id: string;
  reservation_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

// Frontend utility types
export interface ReservationWithListing extends Reservation {
  listing: Listing;
  listing_i18n?: ListingI18n;
}

export interface ListingWithAvailability extends Listing {
  availability: ListingAvailability[];
}

export interface ReservationFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  special_requests?: string;
}

export interface AvailabilityFilter {
  start_date?: string;
  end_date?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  features?: string[];
}

// Pages system types
export type PageType = 'general-faq' | 'about' | 'campaigns' | 'blog';

export interface Page {
  id: string;
  page_type: PageType;
  slug: string;
  title_tr: string;
  title_en?: string;
  title_ru?: string;
  title_ar?: string;
  content_tr: string;
  content_en?: string;
  content_ru?: string;
  content_ar?: string;
  meta_title_tr?: string;
  meta_title_en?: string;
  meta_title_ru?: string;
  meta_title_ar?: string;
  meta_description_tr?: string;
  meta_description_en?: string;
  meta_description_ru?: string;
  meta_description_ar?: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneralFaq {
  id: string;
  question_tr: string;
  question_en?: string;
  question_ru?: string;
  question_ar?: string;
  answer_tr: string;
  answer_en?: string;
  answer_ru?: string;
  answer_ar?: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  title_tr: string;
  title_en?: string;
  title_ru?: string;
  title_ar?: string;
  description_tr: string;
  description_en?: string;
  description_ru?: string;
  description_ar?: string;
  content_tr: string;
  content_en?: string;
  content_ru?: string;
  content_ar?: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  image_url?: string;
  campaign_code?: string;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_tr: string;
  title_en?: string;
  title_ru?: string;
  title_ar?: string;
  excerpt_tr?: string;
  excerpt_en?: string;
  excerpt_ru?: string;
  excerpt_ar?: string;
  content_tr: string;
  content_en?: string;
  content_ru?: string;
  content_ar?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  meta_title_tr?: string;
  meta_title_en?: string;
  meta_title_ru?: string;
  meta_title_ar?: string;
  meta_description_tr?: string;
  meta_description_en?: string;
  meta_description_ru?: string;
  meta_description_ar?: string;
  published: boolean;
  featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}