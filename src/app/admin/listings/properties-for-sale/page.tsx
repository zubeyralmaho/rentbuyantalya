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
  capacity: number;
  is_available: boolean;
  created_at: string;
  images: string[];
  metadata: {
    propertyType: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    buildYear: number;
    furnished: boolean;
    priceType: string;
    seaView: boolean;
    pool: boolean;
  };
  listings_i18n: Array<{
    title: string;
    description: string;
    locale: string;
  }>;
}

export default function PropertyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [availability, setAvailability] = useState<'all'|'available'|'unavailable'>('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const getAvailable = (l: any) => (l?.is_available ?? l?.active ?? false) as boolean;

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/admin/listings/properties-for-sale');
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

  const getTurkishTitle = (listing: Listing) => {
    const turkishTranslation = listing.listings_i18n?.find(t => t.locale === 'tr');
    return turkishTranslation?.title || `${listing.metadata?.propertyType} - ${listing.location}`;
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return listings.filter((l) => {
      const avail = getAvailable(l);
      const okAvail = availability === 'all' || (availability === 'available' ? avail : !avail);
      if (!okAvail) return false;
      if (!text) return true;
      const title = getTurkishTitle(l).toLowerCase();
      const meta = `${l.metadata?.propertyType ?? ''} ${l.location ?? ''}`.toLowerCase();
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
    if (!confirm('Bu emlak ilanını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/listings/properties-for-sale/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Emlak ilanı silindi!');
        fetchListings(); // Refresh list
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
      const response = await fetch(`/api/admin/listings/properties-for-sale/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !currentStatus,
          active: !currentStatus
        }),
      });

      if (response.ok) {
        fetchListings(); // Refresh list
      } else {
        alert('Hata: Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Hata: Durum güncellenemedi');
    }
  };

  

  const getPriceText = (listing: Listing) => {
    const priceType = listing.metadata?.priceType;
    if (priceType === 'sale_price') {
      return `€${listing.price_per_month?.toLocaleString()} (Satış)`;
    } else {
      return `€${listing.price_per_day} / Ay (Kira)`;
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
          <h1>Satılık Emlak İlanları</h1>
          <div className="filters">
            <input
              className="search-input"
              placeholder="Ara: başlık, lokasyon"
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
        <Link href="/admin/listings/properties-for-sale/form" className="add-button">+ Yeni Emlak İlanı</Link>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{listings.length === 0 ? 'Henüz emlak ilanı bulunmamaktadır.' : 'Sonuç bulunamadı.'}</p>
          <Link href="/admin/listings/properties-for-sale/form" className="add-button">
            İlk Emlak İlanını Ekle
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
                  {getAvailable(listing) ? 'Müsait' : 'Satıldı/Kiralandı'}
                </div>
              </div>

              <div className="listing-info">
                <h3>{getTurkishTitle(listing)}</h3>
                <div className="listing-details">
                  <p><strong>Tip:</strong> {listing.metadata?.propertyType}</p>
                  <p><strong>Alan:</strong> {listing.metadata?.area} m²</p>
                  <p><strong>Oda/Banyo:</strong> {listing.metadata?.bedrooms}+{listing.metadata?.bathrooms}</p>
                  <p><strong>Yapım Yılı:</strong> {listing.metadata?.buildYear}</p>
                  <p><strong>Eşyalı:</strong> {listing.metadata?.furnished ? 'Evet' : 'Hayır'}</p>
                  <p><strong>Deniz Manzarası:</strong> {listing.metadata?.seaView ? 'Evet' : 'Hayır'}</p>
                  <p><strong>Havuz:</strong> {listing.metadata?.pool ? 'Evet' : 'Hayır'}</p>
                  <p><strong>Lokasyon:</strong> {listing.location}</p>
                  <p><strong>Fiyat:</strong> {getPriceText(listing)}</p>
                  <p><strong>Oluşturulma:</strong> {new Date(listing.created_at).toLocaleDateString('tr-TR')}</p>
                </div>

                <div className="listing-actions">
                  <Link 
                    href={`/admin/listings/properties-for-sale/form?id=${listing.id}`}
                    className="action-button edit"
                  >
                    Düzenle
                  </Link>
                  
                  <button
                    onClick={() => toggleAvailability(listing.id, getAvailable(listing))}
                    className={`action-button toggle ${getAvailable(listing) ? 'disable' : 'enable'}`}
                  >
                    {getAvailable(listing) ? 'Satıldı/Kiralandı' : 'Müsait Yap'}
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