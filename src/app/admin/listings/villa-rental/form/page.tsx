'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';

interface VillaFormData {
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
  capacity: number;
  features: string[];
  images: string[];
  storage_paths?: string[]; // Yeni: Storage path'leri
  storage_bucket?: string;   // Yeni: Storage bucket
  metadata: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    pool: boolean;
    wifi: boolean;
    parking: boolean;
    kitchen: boolean;
    airConditioning: boolean;
    seaView: boolean;
    garden: boolean;
    terrace: boolean;
  };
}

const LOCALES = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
];

const VILLA_FEATURES = [
  'Pool', 'WiFi', 'Parking', 'Kitchen', 'Air Conditioning', 
  'Sea View', 'Garden', 'Terrace', 'Barbecue', 'Fireplace',
  'Washing Machine', 'Dishwasher', 'TV', 'Balcony', 'Gym'
];

function VillaListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<VillaFormData>({
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
    capacity: 1,
    features: [],
    images: [],
    storage_paths: [],
    storage_bucket: 'listings',
    metadata: {
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      pool: false,
      wifi: false,
      parking: false,
      kitchen: false,
      airConditioning: false,
      seaView: false,
      garden: false,
      terrace: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tr');
  const [newImage, setNewImage] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isEdit && editId) {
      fetchListing(editId);
    }
  }, [editId, isEdit]);

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings/villa-rental/${id}`);
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
          capacity: listing.capacity || 1,
          features: listing.features || [],
          images: listing.images || [],
          metadata: listing.metadata || formData.metadata
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
        ? `/api/admin/listings/villa-rental/${editId}`
        : '/api/admin/listings/villa-rental';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEdit ? 'Villa ilanı güncellendi!' : 'Villa ilanı oluşturuldu!');
        router.push('/admin/listings/villa-rental');
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
  const handleMultipleImageUpload = async (files: FileList) => {
    setUploadError('');
    try {
      const results = await uploadMultipleFiles(files, 'listings');
      const successfulUploads = results.filter(r => r.success);
      
      if (successfulUploads.length > 0) {
        setFormData(prev => ({
          ...prev,
          storage_paths: [
            ...(prev.storage_paths || []),
            ...successfulUploads.map(r => r.path!)
          ]
        }));
      }
      
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        setUploadError(`${failures.length} fotoğraf yüklenemedi: ${failures[0].error}`);
      }
    } catch (error) {
      setUploadError('Fotoğraflar yüklenirken bir hata oluştu');
    }
  };

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

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const setStorageCover = (index: number) => {
    setFormData(prev => {
      const paths = [...(prev.storage_paths || [])]
      if (index < 0 || index >= paths.length) return prev
      const [chosen] = paths.splice(index, 1)
      return { ...prev, storage_paths: [chosen, ...paths] }
    })
  };

  const addCustomFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  return (
    <div className="villa-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Villa İlanını Düzenle' : 'Yeni Villa İlanı Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/villa-rental')}
          className="back-button"
        >
          ← Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="villa-form">
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

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>Fiyatlandırma</h3>
          <div className="price-grid">
            <div className="form-group">
              <label>Günlük Fiyat (€)</label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: Number(e.target.value) }))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Haftalık Fiyat (€)</label>
              <input
                type="number"
                value={formData.price_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_week: Number(e.target.value) }))}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Aylık Fiyat (€)</label>
              <input
                type="number"
                value={formData.price_per_month}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_month: Number(e.target.value) }))}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Location and Capacity */}
        <div className="basic-info-section">
          <div className="form-row">
            <div className="form-group">
              <label>Lokasyon</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Örn: Kalkan, Antalya"
                required
              />
            </div>

            <div className="form-group">
              <label>Kapasite (Kişi)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Villa Specifications */}
        <div className="specs-section">
          <h3>Villa Özellikleri</h3>
          <div className="specs-grid">
            <div className="form-group">
              <label>Yatak Odası</label>
              <input
                type="number"
                value={formData.metadata.bedrooms}
                onChange={(e) => handleMetadataChange('bedrooms', Number(e.target.value))}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Banyo</label>
              <input
                type="number"
                value={formData.metadata.bathrooms}
                onChange={(e) => handleMetadataChange('bathrooms', Number(e.target.value))}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Alan (m²)</label>
              <input
                type="number"
                value={formData.metadata.area}
                onChange={(e) => handleMetadataChange('area', Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="amenities-checkboxes">
            <h4>Olanaklar</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                
                const labels: { [key: string]: string } = {
                  pool: 'Havuz',
                  wifi: 'WiFi',
                  parking: 'Otopark',
                  kitchen: 'Mutfak',
                  airConditioning: 'Klima',
                  seaView: 'Deniz Manzarası',
                  garden: 'Bahçe',
                  terrace: 'Teras'
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
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h3>Özellikler</h3>
          <div className="features-checkboxes">
            {VILLA_FEATURES.map(feature => (
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

          <div className="add-feature">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Özel özellik ekle..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
            />
            <button type="button" onClick={addCustomFeature}>
              Ekle
            </button>
          </div>

          {formData.features.filter(f => !VILLA_FEATURES.includes(f)).length > 0 && (
            <div className="custom-features">
              <h4>Özel Özellikler</h4>
              {formData.features.filter(f => !VILLA_FEATURES.includes(f)).map(feature => (
                <span key={feature} className="custom-feature-tag">
                  {feature}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      features: prev.features.filter(f => f !== feature)
                    }))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="images-section">
          <h3>Fotoğraflar</h3>
          
          {/* File Upload */}
          <div style={{ marginBottom: '1rem' }}>
            <FileUpload
              bucketName="listings"
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={handleImageUploadError}
              label="Villa fotoğrafları seç"
              multiple={true}
              maxFiles={10}
            />
            {uploadError && (
              <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {uploadError}
              </p>
            )}
          </div>

          {/* Storage Images with selection */}
          {formData.storage_paths && formData.storage_paths.length > 0 && (
            <div className="storage-images">
              <h4>Yüklenen Fotoğraflar</h4>
              <div className="images-list">
                {formData.storage_paths.map((path, index) => (
                  <div key={path + index} className={`image-item ${index === 0 ? 'cover' : ''}`}>
                    <img 
                      src={getStorageImageUrl(path)} 
                      alt={`Villa ${index + 1}`} 
                      style={{ maxWidth: '200px', height: 'auto' }}
                    />
                    <div className="image-actions">
                      {index !== 0 ? (
                        <button type="button" onClick={() => setStorageCover(index)} className="make-cover">
                          Kapak Yap
                        </button>
                      ) : (
                        <span className="cover-badge">Kapak</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeStorageImage(index)}
                        className="remove-image"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy URL Input (for backward compatibility) */}
          <div className="add-image">
            <h4>URL ile Fotoğraf Ekle:</h4>
            <input
              type="url"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Fotoğraf URL'si..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <button type="button" onClick={addImage}>
              URL Ekle
            </button>
          </div>

          {formData.images.length > 0 && (
            <div className="images-list">
              <h4>URL Fotoğrafları:</h4>
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Villa ${index + 1}`} />
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
function VillaFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <VillaListingForm editId={editId} />;
}

// Loading fallback component
function VillaFormLoading() {
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
export default function VillaFormPage() {
  return (
    <Suspense fallback={<VillaFormLoading />}>
      <VillaFormWithParams />
    </Suspense>
  );
}