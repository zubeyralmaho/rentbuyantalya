-- Hero video settings table
CREATE TABLE IF NOT EXISTS hero_video_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT,
  fallback_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  title TEXT,
  subtitle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO hero_video_settings (video_url, fallback_image_url, is_active, title, subtitle) 
VALUES (
  '/hero-video.mp4', 
  '/hero-bg.jpg', 
  true,
  'RENT&BUY',
  'Rent the Difference'
) ON CONFLICT (id) DO NOTHING;

-- RLS policy for hero video settings
ALTER TABLE hero_video_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read hero video settings
CREATE POLICY "Anyone can view hero video settings" ON hero_video_settings
    FOR SELECT USING (true);

-- Only admins can modify hero video settings
CREATE POLICY "Admins can update hero video settings" ON hero_video_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );