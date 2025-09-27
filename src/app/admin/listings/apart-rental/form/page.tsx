'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';

interface ApartFormData {
  translations: {
    [locale: string]: {
      title: string;
      description: string;
    };
  };
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  location: string;
  max_guests: number;
  features: string[];
  images: string[];
  storage_paths?: string[];
  storage_bucket?: string;
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
}

const LOCALES = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
];

const APART_FEATURES = [
  'WiFi', 'Klima', 'Isıtma', 'Mutfak', 'Çamaşır Makinesi',
  'Bulaşık Makinesi', 'TV', 'Asansör', 'Balkon', 'Otopark',
  'Eşyalı', 'Deniz Manzarası', 'Şehir Manzarası', 'Havuz',
  'Spor Salonu', 'Güvenlik', '24/7 Resepsiyon', 'Temizlik Servisi'
];

function ApartListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<ApartFormData>({
    translations: {
      tr: { title: '', description: '' },
      en: { title: '', description: '' },
      ru: { title: '', description: '' },
      ar: { title: '', description: '' }
    },
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    location: '',
    max_guests: 2,
    features: [],
    images: [],
    storage_paths: [],
    storage_bucket: 'listings',
    metadata: {
      bedrooms: 1,
      bathrooms: 1,
      area: 50,
      floor: 1,
      furnished: true,
      balcony: false,
      parking: false,
      wifi: true,
      airConditioning: false,
      heating: true,
      kitchen: true,
      washing_machine: false,
      dishwasher: false,
      tv: false,
      elevator: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tr');
  const [newImage, setNewImage] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isEdit && editId) {
      fetchListing(editId);
    }
  }, [editId, isEdit]);

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings/apart-rental/${id}`);
      const data = await response.json();
      
      if (data.listing) {
        const listing = data.listing;
        const translationsObj: { [locale: string]: { title: string; description: string } } = {};
        
        listing.listings_i18n?.forEach((t: any) => {
          translationsObj[t.locale] = {
            title: t.title,
            description: t.description
          };
        });

        setFormData({
          translations: translationsObj,
          price_per_day: listing.price_per_day || 0,
          price_per_week: listing.price_per_week || 0,
          price_per_month: listing.price_per_month || 0,
          location: listing.location || '',
          max_guests: listing.max_guests || 2,
          features: listing.features || [],
          images: listing.images || [],
          storage_paths: listing.storage_paths || [],
          storage_bucket: listing.storage_bucket || 'listings',
          metadata: { ...formData.metadata, ...listing.metadata }
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('Hata: İlan bilgileri yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit 
        ? `/api/admin/listings/apart-rental/${editId}`
        : '/api/admin/listings/apart-rental';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEdit ? 'Apart ilanı güncellendi!' : 'Apart ilanı oluşturuldu!');
        router.push('/admin/listings/apart-rental');
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Hata: İlan kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslationChange = (locale: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...prev.translations[locale],
          [field]: value
        }
      }
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Storage upload handlers
  const handleImageUploadSuccess = (result: UploadResult) => {
    if (result.success && result.path) {
      setFormData(prev => ({
        ...prev,
        storage_paths: [...(prev.storage_paths || []), result.path!]
      }));
      setUploadError('');
    }
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
  };

  const removeStorageImage = async (index: number) => {
    const paths = formData.storage_paths || [];
    const pathToDelete = paths[index];
    
    if (pathToDelete) {
      try {
        await deleteFile(pathToDelete, 'listings');
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      storage_paths: paths.filter((_, i) => i !== index)
    }));
  };

  const getStorageImageUrl = (path: string) => {
    return getStorageUrl(path, 'listings');
  };

  const setStorageCover = (index: number) => {
    setFormData(prev => {
      const paths = [...(prev.storage_paths || [])]
      if (index < 0 || index >= paths.length) return prev
      const [chosen] = paths.splice(index, 1)
      return { ...prev, storage_paths: [chosen, ...paths] }
    })
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <div className="apart-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Apart İlanını Düzenle' : 'Yeni Apart İlanı Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/apart-rental')}
          className="back-button"
        >
          ← Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="apart-form">
        {/* Translation Tabs */}
        <div className="translation-section">
          <h3>İlan Bilgileri</h3>
          <div className="tab-buttons">
            {LOCALES.map(locale => (
              <button
                key={locale.code}
                type="button"
                className={`tab-button ${activeTab === locale.code ? 'active' : ''}`}
                onClick={() => setActiveTab(locale.code)}
              >
                {locale.name}
              </button>
            ))}
          </div>

          <div className="tab-content">
            <div className="form-group">
              <label>Başlık ({LOCALES.find(l => l.code === activeTab)?.name})</label>
              <input
                type="text"
                value={formData.translations[activeTab]?.title || ''}
                onChange={(e) => handleTranslationChange(activeTab, 'title', e.target.value)}
                placeholder={`Örn: ${formData.metadata.bedrooms}+1 Apart - ${formData.location}`}
                required
              />
            </div>

            <div className="form-group">
              <label>Açıklama ({LOCALES.find(l => l.code === activeTab)?.name})</label>
              <textarea
                value={formData.translations[activeTab]?.description || ''}
                onChange={(e) => handleTranslationChange(activeTab, 'description', e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Apart Specifications */}
        <div className="apart-specs-section">
          <h3>Apart Bilgileri</h3>
          <div className="specs-grid">
            <div className="form-group">
              <label>Yatak Odası Sayısı</label>
              <input
                type="number"
                value={formData.metadata.bedrooms}
                onChange={(e) => handleMetadataChange('bedrooms', Number(e.target.value))}
                min="0"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label>Banyo Sayısı</label>
              <input
                type="number"
                value={formData.metadata.bathrooms}
                onChange={(e) => handleMetadataChange('bathrooms', Number(e.target.value))}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group">
              <label>Alan (m²)</label>
              <input
                type="number"
                value={formData.metadata.area}
                onChange={(e) => handleMetadataChange('area', Number(e.target.value))}
                min="20"
                max="1000"
                required
              />
            </div>

            <div className="form-group">
              <label>Kat</label>
              <input
                type="number"
                value={formData.metadata.floor}
                onChange={(e) => handleMetadataChange('floor', Number(e.target.value))}
                min="-2"
                max="50"
                required
              />
            </div>

            <div className="form-group">
              <label>Kapasite (Kişi)</label>
              <input
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData(prev => ({ ...prev, max_guests: Number(e.target.value) }))}
                min="1"
                max="20"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>Fiyatlandırma</h3>
          <div className="price-grid">
            <div className="form-group">
              <label>Günlük Fiyat (TRY)</label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: Number(e.target.value) }))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Haftalık Fiyat (TRY)</label>
              <input
                type="number"
                value={formData.price_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_week: Number(e.target.value) }))}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Aylık Fiyat (TRY)</label>
              <input
                type="number"
                value={formData.price_per_month}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_month: Number(e.target.value) }))}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="basic-info-section">
          <div className="form-group">
            <label>Lokasyon</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Örn: Lara, Antalya"
              required
            />
          </div>
        </div>

        {/* Apart Features */}
        <div className="features-section">
          <h3>Apart Özellikleri</h3>
          
          <div className="amenities-checkboxes">
            <h4>Temel Olanaklar</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                
                const labels: { [key: string]: string } = {
                  furnished: 'Eşyalı',
                  balcony: 'Balkon',
                  parking: 'Otopark',
                  wifi: 'WiFi',
                  airConditioning: 'Klima',
                  heating: 'Isıtma',
                  kitchen: 'Mutfak',
                  washing_machine: 'Çamaşır Makinesi',
                  dishwasher: 'Bulaşık Makinesi',
                  tv: 'TV',
                  elevator: 'Asansör'
                };

                return (
                  <label key={key} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleMetadataChange(key, e.target.checked)}
                    />
                    <span>{labels[key] || key}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="extra-features">
            <h4>Ekstra Özellikler</h4>
            <div className="features-checkboxes">
              {APART_FEATURES.map(feature => (
                <label key={feature} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="images-section">
          <h3>Fotoğraflar</h3>
          
          {/* File Upload Component */}
          <div className="storage-upload">
            <h4>Dosya Yükle</h4>
            <FileUpload
              bucketName="listings"
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={handleImageUploadError}
              accept="image/*"
              multiple
              maxFiles={12}
            />
            {uploadError && (
              <div className="upload-error">
                {uploadError}
              </div>
            )}
          </div>

          {/* Uploaded storage images preview + selection */}
          {formData.storage_paths && formData.storage_paths.length > 0 && (
            <div className="storage-images">
              <h4>Yüklenen Fotoğraflar</h4>
              <div className="images-list">
                {formData.storage_paths.map((p, idx) => (
                  <div key={p + idx} className={`image-item ${idx === 0 ? 'cover' : ''}`}>
                    <img src={getStorageImageUrl(p)} alt={`Yüklenen ${idx + 1}`} />
                    <div className="image-actions">
                      {idx !== 0 ? (
                        <button type="button" onClick={() => setStorageCover(idx)} className="make-cover">
                          Kapak Yap
                        </button>
                      ) : (
                        <span className="cover-badge">Kapak</span>
                      )}
                      <button type="button" onClick={() => removeStorageImage(idx)} className="remove-image">
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual URL Input (Alternative) */}
          <div className="add-image">
            <input
              type="url"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Fotoğraf URL'si (alternatif)..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button type="button" onClick={addImage}>
              URL Ekle
            </button>
          </div>

          {formData.images.length > 0 && (
            <div className="images-list">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Apart ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Availability / Reservations Calendar (only after listing exists) */}
        {isEdit && (
          <div className="form-section">
            <h3>Müsaitlik ve Rezervasyon Takvimi</h3>
            <p className="form-help">Takvim üzerinden günleri kapatıp açabilir, rezervasyon durumlarını görüntüleyebilirsiniz.</p>
            {editId ? <AvailabilityCalendar listingId={editId} /> : null}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'İlan Oluştur')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrapper component that handles search params
function ApartFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <ApartListingForm editId={editId} />;
}

// Loading fallback component
function ApartFormLoading() {
  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ApartFormPage() {
  return (
    <Suspense fallback={<ApartFormLoading />}>
      <ApartFormWithParams />
    </Suspense>
  );
}