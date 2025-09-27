'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error('Admin data parse error:', error);
      router.push('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

  if (!admin) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-text">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Sistem Ayarları</h1>
            <p>Sistem ayarları ve yapılandırma</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/admin/dashboard" className="admin-button" style={{ width: 'auto' }}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="admin-button logout-button">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      <div className="admin-dashboard">
        <div className="admin-card">
          <h2>Sistem Ayarları</h2>
          <p style={{ color: '#64748b', marginTop: '1rem' }}>
            Bu sayfa geliştirilme aşamasında. Yakında sistem yapılandırması, kullanıcı ayarları ve genel ayarlar eklenecek.
          </p>
        </div>
      </div>
    </div>
  );
}