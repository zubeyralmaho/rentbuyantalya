'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';

interface BoatFormData {
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
    boatType: string;
    brand: string;
    model: string;
    year: number;
    length: number;
    engine: string;
    cabins: number;
    bathrooms: number;
    captainIncluded: boolean;
    fuelIncluded: boolean;
    wifi: boolean;
    airConditioning: boolean;
    soundSystem: boolean;
    gps: boolean;
    fishingEquipment: boolean;
    snorkelEquipment: boolean;
    waterSports: boolean;
    kitchen: boolean;
  };
}

const LOCALES = [
  { code: 'tr', name: 'TÃ¼rkÃ§e' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Ğ ÑƒÑÑĞºĞ¸Ğ¹' },
  { code: 'ar', name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' }
];

const BOAT_FEATURES = [
  'Captain Included', 'Fuel Included', 'WiFi', 'Air Conditioning',
  'Sound System', 'GPS Navigation', 'Fishing Equipment', 'Snorkel Equipment',
  'Water Sports', 'Kitchen', 'BBQ Grill', 'Sun Deck', 'Shower', 'Towels'
];

const BOAT_TYPES = [
  'Motor Yacht', 'Sailing Yacht', 'Catamaran', 'Speedboat', 
  'Gulet', 'Luxury Yacht', 'Fishing Boat', 'RIB'
];

const BOAT_BRANDS = [
  'Azimut', 'Princess', 'Sunseeker', 'Ferretti', 'Pershing',
  'Beneteau', 'Jeanneau', 'Bavaria', 'Dufour', 'Lagoon',
  'Fountaine Pajot', 'Sea Ray', 'Boston Whaler', 'Cranchi'
];

function BoatListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<BoatFormData>({
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
    capacity: 2,
    features: [],
    images: [],
    storage_paths: [],
    storage_bucket: 'listings',
    metadata: {
      boatType: 'Motor Yacht',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      length: 0,
      engine: '',
      cabins: 1,
      bathrooms: 1,
      captainIncluded: false,
      fuelIncluded: false,
      wifi: false,
      airConditioning: false,
      soundSystem: false,
      gps: false,
      fishingEquipment: false,
      snorkelEquipment: false,
      waterSports: false,
      kitchen: false
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
      const response = await fetch(`/api/admin/listings/boat-rental/${id}`);
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
          capacity: listing.capacity || 2,
          features: listing.features || [],
          images: listing.images || [],
          metadata: { ...formData.metadata, ...listing.metadata }
        });
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      alert('Hata: Ä°lan bilgileri yÃ¼klenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit 
        ? `/api/admin/listings/boat-rental/${editId}`
        : '/api/admin/listings/boat-rental';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEdit ? 'Tekne ilanÄ± gÃ¼ncellendi!' : 'Tekne ilanÄ± oluÅŸturuldu!');
        router.push('/admin/listings/boat-rental');
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Hata: Ä°lan kaydedilemedi');
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
    <div className="boat-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Tekne Ä°lanÄ±nÄ± DÃ¼zenle' : 'Yeni Tekne Ä°lanÄ± Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/boat-rental')}
          className="back-button"
        >
          â† Geri DÃ¶n
        </button>
      </div>

      <form onSubmit={handleSubmit} className="boat-form">
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
              <label>BaÅŸlÄ±k ({LOCALES.find(l => l.code === activeTab)?.name})</label>
              <input
                type="text"
                value={formData.translations[activeTab]?.title || ''}
                onChange={(e) => handleTranslationChange(activeTab, 'title', e.target.value)}
                placeholder={`Ã–rn: ${formData.metadata.brand} ${formData.metadata.model}`}
                required
              />
            </div>

            <div className="form-group">
              <label>AÃ§Ä±klama ({LOCALES.find(l => l.code === activeTab)?.name})</label>
              <textarea
                value={formData.translations[activeTab]?.description || ''}
                onChange={(e) => handleTranslationChange(activeTab, 'description', e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        </div>

        {/* Boat Specifications */}
        <div className="boat-specs-section">
          <h3>Tekne Bilgileri</h3>
          <div className="specs-grid">
            <div className="form-group">
              <label>Tekne TÃ¼rÃ¼</label>
              <select
                value={formData.metadata.boatType}
                onChange={(e) => handleMetadataChange('boatType', e.target.value)}
                required
              >
                {BOAT_TYPES.map(type => (
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
                <option value="">Marka SeÃ§in</option>
                {BOAT_BRANDS.map(brand => (
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
              <label>YÄ±l</label>
              <input
                type="number"
                value={formData.metadata.year}
                onChange={(e) => handleMetadataChange('year', Number(e.target.value))}
                min="1980"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group">
              <label>Uzunluk (metre)</label>
              <input
                type="number"
                value={formData.metadata.length}
                onChange={(e) => handleMetadataChange('length', Number(e.target.value))}
                min="5"
                max="200"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label>Motor</label>
              <input
                type="text"
                value={formData.metadata.engine}
                onChange={(e) => handleMetadataChange('engine', e.target.value)}
                placeholder="Ã–rn: 2 x 370 HP Volvo Penta"
                required
              />
            </div>

            <div className="form-group">
              <label>Kabin SayÄ±sÄ±</label>
              <input
                type="number"
                value={formData.metadata.cabins}
                onChange={(e) => handleMetadataChange('cabins', Number(e.target.value))}
                min="0"
                max="20"
              />
            </div>

            <div className="form-group">
              <label>Banyo SayÄ±sÄ±</label>
              <input
                type="number"
                value={formData.metadata.bathrooms}
                onChange={(e) => handleMetadataChange('bathrooms', Number(e.target.value))}
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>FiyatlandÄ±rma</h3>
          <div className="price-grid">
            <div className="form-group">
              <label>GÃ¼nlÃ¼k Fiyat (â‚¬)</label>
              <input
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: Number(e.target.value) }))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>HaftalÄ±k Fiyat (â‚¬)</label>
              <input
                type="number"
                value={formData.price_per_week}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_week: Number(e.target.value) }))}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>AylÄ±k Fiyat (â‚¬)</label>
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
              <label>Marina/Lokasyon</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ã–rn: KaleiÃ§i Marina, Antalya"
                required
              />
            </div>

            <div className="form-group">
              <label>Kapasite (KiÅŸi)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
        </div>

        {/* Boat Features */}
        <div className="features-section">
          <h3>Tekne Ã–zellikleri</h3>
          
          <div className="amenities-checkboxes">
            <h4>Hizmetler ve Olanaklar</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                
                const labels: { [key: string]: string } = {
                  captainIncluded: 'Kaptan Dahil',
                  fuelIncluded: 'YakÄ±t Dahil',
                  wifi: 'WiFi',
                  airConditioning: 'Klima',
                  soundSystem: 'Ses Sistemi',
                  gps: 'GPS Navigasyon',
                  fishingEquipment: 'BalÄ±k Tutma EkipmanÄ±',
                  snorkelEquipment: 'Ånorkel EkipmanÄ±',
                  waterSports: 'Su SporlarÄ±',
                  kitchen: 'Mutfak'
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
            <h4>Ekstra Ã–zellikler</h4>
            <div className="features-checkboxes">
              {BOAT_FEATURES.map(feature => (
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
                  <img src={image} alt={`Tekne ${index + 1}`} />
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
            {loading ? 'Kaydediliyor...' : (isEdit ? 'GÃ¼ncelle' : 'Ä°lan OluÅŸtur')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrapper component that handles search params
function BoatFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <BoatListingForm editId={editId} />;
}

// Loading fallback component
function BoatFormLoading() {
  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">YÃ¼kleniyor...</div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function BoatFormPage() {
  return (
    <Suspense fallback={<BoatFormLoading />}>
      <BoatFormWithParams />
    </Suspense>
  );
}
