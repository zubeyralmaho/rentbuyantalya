'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';


interface VipTransferFormData {
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
  storage_paths?: string[];
  storage_bucket?: string;
  metadata: {
    vehicleType: string;
    brand: string;
    model: string;
    year: number;
    routes: string[];
    driverIncluded: boolean;
    fuelIncluded: boolean;
    wifi: boolean;
    airConditioning: boolean;
    leather: boolean;
    miniBar: boolean;
    childSeat: boolean;
    luggage: boolean;
    meetGreet: boolean;
    flightTracking: boolean;
    waitingTime: number;
    priceType: string; // 'per_trip', 'per_hour', 'per_day'
  };
}

const LOCALES = [
  { code: 'tr', name: 'TÃ¼rkÃ§e' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Ğ ÑƒÑÑĞºĞ¸Ğ¹' },
  { code: 'ar', name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' }
];

const TRANSFER_FEATURES = [
  'Driver Included', 'Fuel Included', 'WiFi', 'Air Conditioning',
  'Leather Seats', 'Mini Bar', 'Child Seat', 'Luggage Assistance',
  'Meet & Greet', 'Flight Tracking', 'Water Bottles', 'Phone Charger'
];

const VEHICLE_TYPES = [
  'Sedan', 'Premium Sedan', 'SUV', 'Luxury SUV', 'Van', 'Minibus',
  'VIP Van', 'Limousine', 'Coupe', 'Convertible'
];

const VEHICLE_BRANDS = [
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Toyota', 'Honda',
  'Hyundai', 'Ford', 'Renault', 'Peugeot', 'Volvo', 'Jaguar', 'Lexus'
];

const POPULAR_ROUTES = [
  'Antalya Airport - City Center',
  'Antalya Airport - Kemer',
  'Antalya Airport - Side',
  'Antalya Airport - Alanya',
  'Antalya Airport - Kalkan',
  'Antalya Airport - Kas',
  'City Center - Hotels',
  'Hotel - Restaurant Tours',
  'Shopping Mall Tours',
  'Historical Sites Tours'
];

function VipTransferListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<VipTransferFormData>({
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
      vehicleType: 'Sedan',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      routes: [],
      driverIncluded: true,
      fuelIncluded: true,
      wifi: false,
      airConditioning: false,
      leather: false,
      miniBar: false,
      childSeat: false,
      luggage: false,
      meetGreet: false,
      flightTracking: false,
      waitingTime: 60,
      priceType: 'per_trip'
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tr');
  const [newImage, setNewImage] = useState('');
  const [newRoute, setNewRoute] = useState('');

  useEffect(() => {
    if (isEdit && editId) {
      fetchListing(editId);
    }
  }, [editId, isEdit]);

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings/vip-transfer/${id}`);
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
        ? `/api/admin/listings/vip-transfer/${editId}`
        : '/api/admin/listings/vip-transfer';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEdit ? 'VIP transfer ilanı güncellendi!' : 'VIP transfer ilanı oluşturuldu!');
        router.push('/admin/listings/vip-transfer');
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
  const [uploadError, setUploadError] = useState('');

  const handleImageUploadSuccess = (result: UploadResult) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, result.url!],
      storage_paths: [...(prev.storage_paths || []), result.path!]
    }));
    setUploadError('');
  };

  const handleImageUploadError = (error: string) => {
    setUploadError(error);
  };

  const removeStorageImage = async (index: number) => {
    const paths = formData.storage_paths || []
    const pathToDelete = paths[index]
    if (pathToDelete) {
      try { await deleteFile(pathToDelete, 'listings') } catch {}
    }
    setFormData(prev => ({
      ...prev,
      storage_paths: paths.filter((_, i) => i !== index)
    }))
  };

  const getStorageImageUrl = (path: string) => getStorageUrl(path, 'listings');

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

  const addRoute = (route: string) => {
    if (route && !formData.metadata.routes.includes(route)) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          routes: [...prev.metadata.routes, route]
        }
      }));
    }
  };

  const addCustomRoute = () => {
    if (newRoute.trim() && !formData.metadata.routes.includes(newRoute.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          routes: [...prev.metadata.routes, newRoute.trim()]
        }
      }));
      setNewRoute('');
    }
  };

  const removeRoute = (route: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        routes: prev.metadata.routes.filter(r => r !== route)
      }
    }));
  };

  return (
    <div className="vip-transfer-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'VIP Transfer Ä°lanÄ±nÄ± DÃ¼zenle' : 'Yeni VIP Transfer Ä°lanÄ± Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/vip-transfer')}
          className="back-button"
        >
          â† Geri DÃ¶n
        </button>
      </div>

      <form onSubmit={handleSubmit} className="vip-transfer-form">
        {/* Translation Tabs */}
        <div className="translation-section">
          <h3>Ä°lan Bilgileri</h3>
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
                placeholder={`Örn: ${formData.metadata.vehicleType} - ${formData.metadata.brand}`}
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
              <label>Araç Türü</label>
              <select
                value={formData.metadata.vehicleType}
                onChange={(e) => handleMetadataChange('vehicleType', e.target.value)}
                required
              >
                {VEHICLE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                {VEHICLE_BRANDS.map(brand => (
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
                min="2010"
                max={new Date().getFullYear() + 1}
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
                max="20"
                required
              />
            </div>

            <div className="form-group">
              <label>Bekleme Süresi (Dakika)</label>
              <input
                type="number"
                value={formData.metadata.waitingTime}
                onChange={(e) => handleMetadataChange('waitingTime', Number(e.target.value))}
                min="0"
                max="240"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>Fiyatlandırma</h3>
          
          <div className="form-group">
            <label>Fiyat Türü</label>
            <select
              value={formData.metadata.priceType}
              onChange={(e) => handleMetadataChange('priceType', e.target.value)}
              required
            >
              <option value="per_trip">Sefer Başı</option>
              <option value="per_hour">Saatlik</option>
              <option value="per_day">Günlük</option>
            </select>
          </div>

          <div className="price-grid">
            <div className="form-group">
              <label>
                {formData.metadata.priceType === 'per_trip' ? 'Sefer Fiyatı (€)' : 
                 formData.metadata.priceType === 'per_hour' ? 'Saatlik Fiyat (€)' : 'Günlük Fiyat (€)'}
              </label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: Number(e.target.value) }))}
                min="0"
                required
              />
            </div>

            {formData.metadata.priceType !== 'per_trip' && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="basic-info-section">
          <div className="form-group">
            <label>Hizmet Bölgesi</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Örn: Antalya ve Çevresi"
              required
            />
          </div>
        </div>

        {/* Routes Section */}
        <div className="routes-section">
          <h3>Hizmet Rotaları</h3>
          
          <div className="popular-routes">
            <h4>Popüler Rotalar</h4>
            <div className="routes-checkboxes">
              {POPULAR_ROUTES.map(route => (
                <label key={route} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.metadata.routes.includes(route)}
                    onChange={() => formData.metadata.routes.includes(route) 
                      ? removeRoute(route) 
                      : addRoute(route)
                    }
                  />
                  <span>{route}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="add-route">
            <h4>Özel Rota Ekle</h4>
            <div className="add-route-input">
              <input
                type="text"
                value={newRoute}
                onChange={(e) => setNewRoute(e.target.value)}
                placeholder="Özel rota açıklaması..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRoute())}
              />
              <button type="button" onClick={addCustomRoute}>
                Rota Ekle
              </button>
            </div>
          </div>

          {formData.metadata.routes.length > 0 && (
            <div className="selected-routes">
              <h4>Seçili Rotalar</h4>
              {formData.metadata.routes.map(route => (
                <span key={route} className="route-tag">
                  {route}
                  <button
                    type="button"
                    onClick={() => removeRoute(route)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Service Features */}
        <div className="features-section">
          <h3>Hizmet Özellikleri</h3>
          
          <div className="amenities-checkboxes">
            <h4>Dahil Edilen Hizmetler</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean' || ['driverIncluded', 'fuelIncluded'].includes(key)) return null;
                
                const labels: { [key: string]: string } = {
                  wifi: 'WiFi',
                  airConditioning: 'Klima',
                  leather: 'Deri Koltuk',
                  miniBar: 'Mini Bar',
                  childSeat: 'Çocuk Koltuğu',
                  luggage: 'Bagaj Yardımı',
                  meetGreet: 'Karşılama Hizmeti',
                  flightTracking: 'Uçuş Takibi'
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

          <div className="required-services">
            <h4>Zorunlu Hizmetler</h4>
            <div className="checkbox-grid">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.metadata.driverIncluded}
                  onChange={(e) => handleMetadataChange('driverIncluded', e.target.checked)}
                />
                <span>ÅofÃ¶r Dahil</span>
              </label>
              
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.metadata.fuelIncluded}
                  onChange={(e) => handleMetadataChange('fuelIncluded', e.target.checked)}
                />
                <span>Yakıt Dahil</span>
              </label>
            </div>
          </div>

          <div className="extra-features">
            <h4>Ekstra Özellikler</h4>
            <div className="features-checkboxes">
              {TRANSFER_FEATURES.map(feature => (
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
              maxFiles={10}
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
function VipTransferFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <VipTransferListingForm editId={editId} />;
}

// Loading fallback component
function VipTransferFormLoading() {
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
export default function VipTransferFormPage() {
  return (
    <Suspense fallback={<VipTransferFormLoading />}>
      <VipTransferFormWithParams />
    </Suspense>
  );
}
