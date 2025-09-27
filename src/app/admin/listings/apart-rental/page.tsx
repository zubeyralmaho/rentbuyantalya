'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getStorageUrl } from '@/lib/storage';

interface Listing {
  id: string;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  location: string;
  max_guests: number;
  is_available: boolean;
  created_at: string;
  images: string[];
  metadata: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    floor: number;
    furnished: boolean;
    balcony: boolean;
    parking: boolean;
    wifi: boolean;
    airConditioning: boolean;
    heating: boolean;
    kitchen: boolean;
    washing_machine: boolean;
    dishwasher: boolean;
    tv: boolean;
    elevator: boolean;
  };
  listings_i18n: Array<{
    title: string;
    description: string;
    locale: string;
  }>;
}

export default function ApartListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [availability, setAvailability] = useState<'all'|'available'|'unavailable'>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  // Back/forward compatible availability getter
  const getAvailable = (l: any) => (l?.is_available ?? l?.active ?? false) as boolean;

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/admin/listings/apart-rental');
      const data = await response.json();
      
      if (data.listings) {
        setListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      alert('Hata: İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Başlık tercihi TR ise onu döndür, yoksa daire bilgisi
  const getTurkishTitle = (listing: Listing) => {
    const turkishTranslation = listing.listings_i18n?.find(t => t.locale === 'tr');
    return turkishTranslation?.title || `${listing.metadata?.bedrooms} + 1 Daire`;
  };

  // Arama ve filtreler
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return listings.filter((l) => {
      const avail = getAvailable(l);
      const okAvail = availability === 'all' || (availability === 'available' ? avail : !avail);
      if (!okAvail) return false;
      if (!text) return true;
      const title = getTurkishTitle(l).toLowerCase();
      const meta = `${l.location ?? ''} ${l.metadata?.bedrooms ?? ''} oda`.toLowerCase();
      return title.includes(text) || meta.includes(text);
    });
  }, [listings, q, availability]);

  const getThumbUrl = (listing: Listing) => {
    const anyListing = listing as any;
    const paths: string[] | undefined = anyListing.storage_paths;
    const bucket: any = anyListing.storage_bucket || 'listings';
    if (paths && paths.length > 0) {
      return getStorageUrl(paths[0], bucket);
    }
    if (listing.images && listing.images.length > 0) return listing.images[0];
    return null;
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Bu daire ilanını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/listings/apart-rental/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Daire ilanı silindi!');
        // Listeyi yenile
        fetchListings();
      } else {
        alert('Hata: İlan silinemedi');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Hata: İlan silinemedi');
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/listings/apart-rental/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Write both fields for compatibility with legacy/new schema
        body: JSON.stringify({ is_available: !currentStatus, active: !currentStatus }),
      });

      if (response.ok) {
        fetchListings();
      } else {
        alert('Hata: Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Hata: Durum güncellenemedi');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Daire Kiralama İlanları</h1>
          <div className="filters">
            <input
              className="search-input"
              placeholder="Ara: başlık, lokasyon, oda sayısı"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="filter-select"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as 'all'|'available'|'unavailable')}
            >
              <option value="all">Tümü</option>
              <option value="available">Müsait</option>
              <option value="unavailable">Pasif</option>
            </select>
          </div>
        </div>
        <Link href="/admin/listings/apart-rental/form" className="add-button">+ Yeni Daire İlanı</Link>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{listings.length === 0 ? 'Henüz daire ilanı bulunmamaktadır.' : 'Sonuç bulunamadı.'}</p>
          <Link href="/admin/listings/apart-rental/form" className="add-button">
            İlk Daire İlanını Ekle
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {filtered.map((listing) => (
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                {(() => {
                  const url = getThumbUrl(listing);
                  return url ? (
                    <img src={url} alt={getTurkishTitle(listing)} />
                  ) : (
                    <div className="no-image">Fotoğraf Yok</div>
                  );
                })()}
                <div className={`availability-badge ${getAvailable(listing) ? 'available' : 'unavailable'}`}>
                  {getAvailable(listing) ? 'Müsait' : 'Müsait Değil'}
                </div>
              </div>

              <div className="listing-info">
                <h3>{getTurkishTitle(listing)}</h3>
                <div className="listing-details">
                  <p><strong>Oda Sayısı:</strong> {listing.metadata?.bedrooms} + 1</p>
                  <p><strong>Banyo:</strong> {listing.metadata?.bathrooms}</p>
                  <p><strong>Alan:</strong> {listing.metadata?.area} m²</p>
                  <p><strong>Kat:</strong> {listing.metadata?.floor}</p>
                  <p><strong>Lokasyon:</strong> {listing.location}</p>
                  <p><strong>Maksimum Misafir:</strong> {listing.max_guests} kişi</p>
                  <p><strong>Günlük Fiyat:</strong> €{listing.price_per_day}</p>
                  <p><strong>Haftalık Fiyat:</strong> €{listing.price_per_week}</p>
                  <p><strong>Aylık Fiyat:</strong> €{listing.price_per_month}</p>
                  <p><strong>Özellikler:</strong></p>
                  <div className="features">
                    {listing.metadata?.furnished && <span className="feature">Eşyalı</span>}
                    {listing.metadata?.balcony && <span className="feature">Balkon</span>}
                    {listing.metadata?.parking && <span className="feature">Otopark</span>}
                    {listing.metadata?.wifi && <span className="feature">WiFi</span>}
                    {listing.metadata?.airConditioning && <span className="feature">Klima</span>}
                    {listing.metadata?.heating && <span className="feature">Isıtma</span>}
                    {listing.metadata?.kitchen && <span className="feature">Mutfak</span>}
                    {listing.metadata?.washing_machine && <span className="feature">Çamaşır Makinesi</span>}
                    {listing.metadata?.dishwasher && <span className="feature">Bulaşık Makinesi</span>}
                    {listing.metadata?.tv && <span className="feature">TV</span>}
                    {listing.metadata?.elevator && <span className="feature">Asansör</span>}
                  </div>
                  <p><strong>Oluşturulma:</strong> {new Date(listing.created_at).toLocaleDateString('tr-TR')}</p>
                </div>

                <div className="listing-actions">
                  <Link 
                    href={`/admin/listings/apart-rental/form?id=${listing.id}`}
                    className="action-button edit"
                  >
                    Düzenle
                  </Link>
                  
                  <button
                    onClick={() => toggleAvailability(listing.id, getAvailable(listing))}
                    className={`action-button toggle ${getAvailable(listing) ? 'disable' : 'enable'}`}
                  >
                    {getAvailable(listing) ? 'Devre Dışı' : 'Aktifleştir'}
                  </button>
                  
                  <button
                    onClick={() => deleteListing(listing.id)}
                    className="action-button delete"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}