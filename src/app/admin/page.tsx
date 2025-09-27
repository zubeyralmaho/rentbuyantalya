'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      // Admin bilgilerini localStorage'a kaydet
      localStorage.setItem('admin', JSON.stringify(data.admin));
      
      // Dashboard'a yönlendir
      router.push('/admin/dashboard');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-form-container">
        <div className="admin-title">
          <h1>Admin Panel</h1>
          <p>RentBuy Antalya Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="email" className="admin-label">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`admin-input ${error ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="admin@rentbuyantalya.com"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password" className="admin-label">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`admin-input ${error ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="Şifrenizi giriniz"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-button"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="admin-footer">
          <p>Sadece yetkili personel erişebilir</p>
        </div>
      </div>
    </div>
  );
}