'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MembersPage() {
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
            <h1>Üye Yönetimi</h1>
            <p>Üye listesi ve istatistikler</p>
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
          <h2>Üye Yönetimi</h2>
          <p style={{ color: '#64748b', marginTop: '1rem' }}>
            Bu sayfa geliştirilme aşamasında. Yakında üye listesi, detayları ve yönetim özellikleri eklenecek.
          </p>
        </div>
      </div>
    </div>
  );
}