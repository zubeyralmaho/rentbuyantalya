'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Admin bilgilerini kontrol et
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
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>RentBuy Admin Panel</h1>
            <p>Hoş geldiniz, {admin.full_name}</p>
          </div>
          <button onClick={handleLogout} className="admin-button logout-button">
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-dashboard">
        <div className="admin-grid">
          
          {/* Hizmetler Yönetimi */}
          <Link href="/admin/services" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon blue">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Hizmetler</h3>
                <p>Listeleri yönet ve düzenle</p>
              </div>
            </div>
          </Link>

          {/* Villa İlanları */}
          <Link href="/admin/listings/villa-rental" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon green">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Villa İlanları</h3>
                <p>Villa kiralamaya yönet</p>
              </div>
            </div>
          </Link>

          {/* Daire İlanları */}
          <Link href="/admin/listings/apart-rental" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon teal">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Daire İlanları</h3>
                <p>Apart kiralama ilanları yönet</p>
              </div>
            </div>
          </Link>

          {/* Araç İlanları */}
          <Link href="/admin/listings/car-rental" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon yellow">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l1.5 1.5L16 13" />
                  <path d="M8.5 14l2.5 2.5 4-4" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Araç İlanları</h3>
                <p>Rent a car ilanları yönet</p>
              </div>
            </div>
          </Link>

          {/* Tekne İlanları */}
          <Link href="/admin/listings/boat-rental" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon indigo">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19.5v-15A2.5 2.5 0 015.5 2H8v7l2-1 2 1V2h2.5A2.5 2.5 0 0117 4.5v15a2.5 2.5 0 01-2.5 2.5h-9A2.5 2.5 0 013 19.5z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Tekne İlanları</h3>
                <p>Boat rental ilanları yönet</p>
              </div>
            </div>
          </Link>

          {/* VIP Transfer İlanları */}
          <Link href="/admin/listings/vip-transfer" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon purple">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>VIP Transfer</h3>
                <p>VIP transfer ilanları yönet</p>
              </div>
            </div>
          </Link>

          {/* Emlak İlanları */}
          <Link href="/admin/listings/properties-for-sale" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon red">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Emlak İlanları</h3>
                <p>Satılık emlak ilanları yönet</p>
              </div>
            </div>
          </Link>

          {/* Rezervasyonlar */}
          <Link href="/admin/reservations" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon green">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Rezervasyonlar</h3>
                <p>Rezervasyonları yönet</p>
              </div>
            </div>
          </Link>

          {/* Müsaitlik Takvimi */}
          <Link href="/admin/availability" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon yellow">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Müsaitlik</h3>
                <p>Takvimi ve fiyatları yönet</p>
              </div>
            </div>
          </Link>

          {/* Üyeler */}
          <Link href="/admin/members" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon purple">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Üyeler</h3>
                <p>Üye listesi ve istatistikler</p>
              </div>
            </div>
          </Link>

          {/* FAQ Yönetimi */}
          <Link href="/admin/faq" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon orange">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>FAQ Yönetimi</h3>
                <p>Sık sorulan soruları yönet</p>
              </div>
            </div>
          </Link>

          {/* İçerik Yönetimi */}
          <Link href="/admin/content" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon blue">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v6m0 0l-2-2m2 2l2-2" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>İçerik Yönetimi</h3>
                <p>Sayfalar, kampanyalar, blog yönet</p>
              </div>
            </div>
          </Link>

          {/* İstatistikler */}
          <Link href="/admin/analytics" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon indigo">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>İstatistikler</h3>
                <p>Ziyaretçi ve analiz verileri</p>
              </div>
            </div>
          </Link>

          {/* Ayarlar */}
          <Link href="/admin/settings" className="admin-card-link">
            <div className="admin-card dashboard-card">
              <div className="admin-icon gray">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="admin-card-content">
                <h3>Ayarlar</h3>
                <p>Sistem ayarları ve yapılandırma</p>
              </div>
            </div>
          </Link>

        </div>

        {/* Hızlı İstatistikler */}
        <div className="admin-stats">
          <h2>Hızlı Bakış</h2>
          <div className="admin-stats-grid">
            <div className="admin-stat-card blue">
              <div className="stat-number">12</div>
              <div className="stat-label">Aktif Rezervasyon</div>
            </div>
            <div className="admin-stat-card green">
              <div className="stat-number">45</div>
              <div className="stat-label">Bu Ay Rezervasyon</div>
            </div>
            <div className="admin-stat-card purple">
              <div className="stat-number">128</div>
              <div className="stat-label">Toplam Üye</div>
            </div>
            <div className="admin-stat-card orange">
              <div className="stat-number">₺124K</div>
              <div className="stat-label">Bu Ay Gelir</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}