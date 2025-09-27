-- Admin tablosunu kontrol et ve admin kullanıcı oluştur
SELECT * FROM admin_users WHERE email = 'admin@rentbuyantalya.com';

-- Eğer admin yoksa oluştur
INSERT INTO admin_users (email, password_hash, role, active)
SELECT 
    'admin@rentbuyantalya.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'super_admin',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE email = 'admin@rentbuyantalya.com'
);

-- Kontrol için tekrar listele
SELECT id, email, role, active, created_at FROM admin_users;