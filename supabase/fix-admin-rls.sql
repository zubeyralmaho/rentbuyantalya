-- Admin_users tablosundaki RLS'yi geçici olarak devre dışı bırak
-- Bu scripti Supabase SQL Editor'de çalıştırın

-- RLS'yi devre dışı bırak
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Admin kullanıcı ekle
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES 
  ('admin@rentbuyantalya.com', '$2b$10$kqlcQg7iVeusoT3md6wBzORzqzSSwkGJXYYY6lZ/HrsSfDA0VsA9m', 'Admin User', 'super_admin')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = true,
  updated_at = NOW();

-- Test için admin kullanıcıları listele
SELECT id, email, full_name, role, active FROM admin_users;