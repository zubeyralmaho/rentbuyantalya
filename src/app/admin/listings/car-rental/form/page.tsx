'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';
import { slugify } from '@/lib/utils';

interface CarFormData {
  translations: {
    [locale: string]: {
      title: string;
      description: string;
    };
  };
  segment_id?: string;
  name: string;
  slug: string;
  price_per_day: number;
  price_per_week: number;
  location: string;
  features: string[];
  images: string[];
  storage_paths?: string[];
  storage_bucket?: string;
  active: boolean;
  sort_order: number;
  metadata: {
    brand: string;
    model: string;
    year: number;
    transmission: string;
    fuelType: string;
    doors: number;
    airConditioning: boolean;
    gps: boolean;
    bluetooth: boolean;
    reverseCam: boolean;
    sunroof: boolean;
    leatherSeats: boolean;
    cruiseControl: boolean;
    parkingSensors: boolean;
  };
}

const LOCALES = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
];

const CAR_FEATURES = [
  'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Reverse Camera', 
  'Sunroof', 'Leather Seats', 'Cruise Control', 'Parking Sensors',
  'USB Charging', 'ABS', 'Airbags', 'Power Steering'
];

const CAR_BRANDS = [
  'Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
  'Ford', 'Renault', 'Peugeot', 'Nissan', 'Hyundai', 'Kia',
  'Opel', 'Fiat', 'Citroen', 'Skoda', 'Mazda', 'Volvo'
];

const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];

function CarListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<CarFormData>({
    translations: {
      tr: { title: '', description: '' },
      en: { title: '', description: '' },
      ru: { title: '', description: '' },
      ar: { title: '', description: '' }
    },
    name: '',
    slug: '',
    price_per_day: 0,
    price_per_week: 0,
    location: '',
    features: [],
    images: [],
    storage_paths: [],
    storage_bucket: 'listings',
    active: true,
    sort_order: 0,
    metadata: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      transmission: 'Manual',
      fuelType: 'Petrol',
      doors: 4,
      airConditioning: false,
      gps: false,
      bluetooth: false,
      reverseCam: false,
      sunroof: false,
      leatherSeats: false,
      cruiseControl: false,
      parkingSensors: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<Array<{id:string;slug:string;title?:string}>>([]);
  const [activeTab, setActiveTab] = useState('tr');
  const [newImage, setNewImage] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // load segments for car
    (async () => {
      try {
        const res = await fetch('/api/admin/car-segments?locale=tr')
        const json = await res.json()
        if (res.ok) setSegments(json.segments || [])
      } catch {}
    })()
    if (isEdit && editId) {
      fetchListing(editId);
    }
  }, [editId, isEdit]);

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings/car-rental/${id}`);
      const data = await response.json();
      
      if (data.listing) {
        const listing = data.listing;
        const translationsObj: { [locale: string]: { title: string; description: string } } = {};
        // Fill existing translations
        listing.listings_i18n?.forEach((t: any) => {
          translationsObj[t.locale] = {
            title: t.title,
            description: t.description
          };
        });
        // Ensure all locales exist in the object to avoid empty UI after load
        LOCALES.forEach(l => {
          if (!translationsObj[l.code]) {
            translationsObj[l.code] = { title: '', description: '' }
          }
        })

        setFormData({
          translations: translationsObj,
          segment_id: listing.segment_id,
          name: listing.name || '',
          slug: listing.slug || '',
          price_per_day: listing.price_per_day || 0,
          price_per_week: listing.price_per_week || 0,
          location: listing.location || '',
          features: Array.isArray(listing.features) ? listing.features : [],
          images: Array.isArray(listing.images) ? listing.images : [],
          storage_paths: Array.isArray(listing.storage_paths) ? listing.storage_paths : [],
          storage_bucket: listing.storage_bucket || 'listings',
          active: listing.active !== false,
          sort_order: listing.sort_order || 0,
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
      // Prepare translations: include only locales with a non-empty title
      const filteredTranslations = Object.fromEntries(
        Object.entries(formData.translations || {}).filter(([, v]) => v && v.title && v.title.trim().length > 0)
      ) as CarFormData['translations'];

      // Ensure slug is present; if empty, derive from Turkish title
      const derivedSlug = (formData.slug && formData.slug.trim().length > 0)
        ? formData.slug.trim()
        : slugify(formData.translations?.tr?.title || formData.name || '') || 'listing';

      const payload: any = { ...formData, translations: filteredTranslations, slug: derivedSlug };

      const url = isEdit 
        ? `/api/admin/listings/car-rental/${editId}`
        : '/api/admin/listings/car-rental';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEdit ? 'Araç ilanı güncellendi!' : 'Araç ilanı oluşturuldu!');
        router.push('/admin/listings/car-rental');
      } else {
        let message = 'İşlem başarısız';
        try {
          const errJson = await response.json();
          message = errJson?.error || message;
          if (errJson?.code === '23505') {
            message += ' (Slug benzersiz olmalıdır, lütfen değiştirin)';
          }
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        alert(`Hata: ${message}`);
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

    // Auto-derive slug from Turkish title if slug is empty
    if (locale === 'tr' && field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: (prev.slug && prev.slug.trim().length > 0) ? prev.slug : (slugify(value) || prev.slug)
      }));
    }
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

  return (
    <div className="car-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Araç İlanını Düzenle' : 'Yeni Araç İlanı Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/car-rental')}
          className="back-button"
        >
          ← Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="car-form">
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
                placeholder={`Örn: ${formData.metadata.brand} ${formData.metadata.model}`}
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

        {/* Vehicle Specifications */}
        <div className="vehicle-specs-section">
          <h3>Araç Bilgileri</h3>
          <div className="specs-grid">
            <div className="form-group">
              <label>Segment</label>
              <select
                value={formData.segment_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, segment_id: e.target.value || undefined }))}
              >
                <option value="">Seçiniz</option>
                {segments.map(s => (
                  <option key={s.id} value={s.id}>{s.title || s.slug}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Marka</label>
              <select
                value={formData.metadata.brand}
                onChange={(e) => handleMetadataChange('brand', e.target.value)}
                required
              >
                <option value="">Marka Seçin</option>
                {CAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                value={formData.metadata.model}
                onChange={(e) => handleMetadataChange('model', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Yıl</label>
              <input
                type="number"
                value={formData.metadata.year}
                onChange={(e) => handleMetadataChange('year', Number(e.target.value))}
                min="2000"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group">
              <label>Vites</label>
              <select
                value={formData.metadata.transmission}
                onChange={(e) => handleMetadataChange('transmission', e.target.value)}
                required
              >
                {TRANSMISSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Yakıt Türü</label>
              <select
                value={formData.metadata.fuelType}
                onChange={(e) => handleMetadataChange('fuelType', e.target.value)}
                required
              >
                {FUEL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kapı Sayısı</label>
              <select
                value={formData.metadata.doors}
                onChange={(e) => handleMetadataChange('doors', Number(e.target.value))}
              >
                <option value={2}>2 Kapı</option>
                <option value={3}>3 Kapı</option>
                <option value={4}>4 Kapı</option>
                <option value={5}>5 Kapı</option>
              </select>
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

          </div>
        </div>

        {/* Location and Status */}
        <div className="basic-info-section">
          <div className="form-row">
            <div className="form-group">
              <label>İlan Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Örn: BMW 3 Series - Luxury Car"
                required
              />
            </div>

            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Örn: bmw-3-series-luxury"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Teslim Lokasyonu</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Örn: Antalya Havalimanı"
                required
              />
            </div>

            <div className="form-group">
              <label>Durum</label>
              <select
                value={formData.active ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'active' }))}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Car Features */}
        <div className="features-section">
          <h3>Araç Özellikleri</h3>
          
          <div className="amenities-checkboxes">
            <h4>Standart Özellikler</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                
                const labels: { [key: string]: string } = {
                  airConditioning: 'Klima',
                  gps: 'GPS Navigasyon',
                  bluetooth: 'Bluetooth',
                  reverseCam: 'Geri Görüş Kamerası',
                  sunroof: 'Sunroof',
                  leatherSeats: 'Deri Koltuk',
                  cruiseControl: 'Hız Sabitleyici',
                  parkingSensors: 'Park Sensörü'
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
              {CAR_FEATURES.map(feature => (
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
          
          {/* File Upload */}
          <div style={{ marginBottom: '1rem' }}>
            <FileUpload
              bucketName="listings"
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={handleImageUploadError}
              label="Araç fotoğrafları seç"
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
                      alt={`Araç ${index + 1}`} 
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

          {/* Legacy URL Input */}
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
                  <img src={image} alt={`Araç ${index + 1}`} />
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
function CarFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <CarListingForm editId={editId} />;
}

// Loading fallback component
function CarFormLoading() {
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
export default function CarFormPage() {
  return (
    <Suspense fallback={<CarFormLoading />}>
      <CarFormWithParams />
    </Suspense>
  );
}