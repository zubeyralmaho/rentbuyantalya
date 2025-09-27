'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FileUpload from '@/components/admin/FileUpload';
import { uploadMultipleFiles, deleteFile, getStorageUrl, type UploadResult } from '@/lib/storage';
import AvailabilityCalendar from '@/components/admin/AvailabilityCalendar';

interface PropertyFormData {
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
    propertyType: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    floors: number;
    buildYear: number;
    furnished: boolean;
    parking: boolean;
    garden: boolean;
    pool: boolean;
    seaView: boolean;
    balcony: boolean;
    elevator: boolean;
    airConditioning: boolean;
    heating: boolean;
    fireplace: boolean;
    security: boolean;
    generator: boolean;
    priceType: string; // 'sale_price', 'monthly_rent'
  };
}

const LOCALES = [
  { code: 'tr', name: 'TÃ¼rkÃ§e' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Ğ ÑƒÑÑĞºĞ¸Ğ¹' },
  { code: 'ar', name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' }
];

const PROPERTY_FEATURES = [
  'Sea View', 'Pool', 'Garden', 'Parking', 'Balcony', 'Elevator',
  'Air Conditioning', 'Heating', 'Fireplace', 'Security System',
  'Generator', 'Built-in Kitchen', 'Walk-in Closet', 'Terrace'
];

const PROPERTY_TYPES = [
  'Apartment', 'Villa', 'Penthouse', 'Duplex', 'Studio', 'Loft',
  'Townhouse', 'Commercial', 'Office', 'Shop', 'Land', 'Building'
];

function PropertyListingForm({ editId }: { editId?: string | null }) {
  const router = useRouter();
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState<PropertyFormData>({
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
      propertyType: 'Apartment',
      area: 0,
      bedrooms: 1,
      bathrooms: 1,
      floors: 1,
      buildYear: new Date().getFullYear(),
      furnished: false,
      parking: false,
      garden: false,
      pool: false,
      seaView: false,
      balcony: false,
      elevator: false,
      airConditioning: false,
      heating: false,
      fireplace: false,
      security: false,
      generator: false,
      priceType: 'sale_price'
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tr');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (isEdit && editId) {
      fetchListing(editId);
    }
  }, [editId, isEdit]);

  const fetchListing = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/listings/properties-for-sale/${id}`);
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
      alert('Hata: Ä°lan bilgileri yÃ¼klenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit 
        ? `/api/admin/listings/properties-for-sale/${editId}`
        : '/api/admin/listings/properties-for-sale';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEdit ? 'Emlak ilanÄ± gÃ¼ncellendi!' : 'Emlak ilanÄ± oluÅŸturuldu!');
        router.push('/admin/listings/properties-for-sale');
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

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h1>{isEdit ? 'Emlak Ä°lanÄ±nÄ± DÃ¼zenle' : 'Yeni Emlak Ä°lanÄ± Ekle'}</h1>
        <button
          type="button"
          onClick={() => router.push('/admin/listings/properties-for-sale')}
          className="back-button"
        >
          â† Geri DÃ¶n
        </button>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
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
                placeholder={`Ã–rn: ${formData.metadata.propertyType} - ${formData.location}`}
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

        {/* Property Specifications */}
        <div className="property-specs-section">
          <h3>Emlak Bilgileri</h3>
          <div className="specs-grid">
            <div className="form-group">
              <label>Emlak TÃ¼rÃ¼</label>
              <select
                value={formData.metadata.propertyType}
                onChange={(e) => handleMetadataChange('propertyType', e.target.value)}
                required
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Alan (mÂ²)</label>
              <input
                type="number"
                value={formData.metadata.area}
                onChange={(e) => handleMetadataChange('area', Number(e.target.value))}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Yatak OdasÄ±</label>
              <input
                type="number"
                value={formData.metadata.bedrooms}
                onChange={(e) => handleMetadataChange('bedrooms', Number(e.target.value))}
                min="0"
                max="20"
              />
            </div>

            <div className="form-group">
              <label>Banyo</label>
              <input
                type="number"
                value={formData.metadata.bathrooms}
                onChange={(e) => handleMetadataChange('bathrooms', Number(e.target.value))}
                min="0"
                max="10"
              />
            </div>

            <div className="form-group">
              <label>Kat SayÄ±sÄ±</label>
              <input
                type="number"
                value={formData.metadata.floors}
                onChange={(e) => handleMetadataChange('floors', Number(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="form-group">
              <label>YapÄ±m YÄ±lÄ±</label>
              <input
                type="number"
                value={formData.metadata.buildYear}
                onChange={(e) => handleMetadataChange('buildYear', Number(e.target.value))}
                min="1950"
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="pricing-section">
          <h3>FiyatlandÄ±rma</h3>
          
          <div className="form-group">
            <label>Fiyat TÃ¼rÃ¼</label>
            <select
              value={formData.metadata.priceType}
              onChange={(e) => handleMetadataChange('priceType', e.target.value)}
              required
            >
              <option value="sale_price">SatÄ±ÅŸ FiyatÄ±</option>
              <option value="monthly_rent">AylÄ±k Kira</option>
            </select>
          </div>

          <div className="price-grid">
            <div className="form-group">
              <label>
                {formData.metadata.priceType === 'sale_price' ? 'SatÄ±ÅŸ FiyatÄ± (â‚¬)' : 'AylÄ±k Kira (â‚¬)'}
              </label>
              <input
                type="number"
                value={formData.metadata.priceType === 'sale_price' ? formData.price_per_month : formData.price_per_day}
                onChange={(e) => {
                  if (formData.metadata.priceType === 'sale_price') {
                    setFormData(prev => ({ ...prev, price_per_month: Number(e.target.value) }));
                  } else {
                    setFormData(prev => ({ ...prev, price_per_day: Number(e.target.value) }));
                  }
                }}
                min="0"
                required
              />
            </div>

            {formData.metadata.priceType === 'monthly_rent' && (
              <>
                <div className="form-group">
                  <label>3 AylÄ±k Kira (â‚¬)</label>
                  <input
                    type="number"
                    value={formData.price_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_week: Number(e.target.value) }))}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>YÄ±llÄ±k Kira (â‚¬)</label>
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
            <label>Lokasyon</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ã–rn: Lara, Antalya"
              required
            />
          </div>
        </div>

        {/* Property Features */}
        <div className="features-section">
          <h3>Emlak Ã–zellikleri</h3>
          
          <div className="amenities-checkboxes">
            <h4>Temel Ã–zellikler</h4>
            <div className="checkbox-grid">
              {Object.entries(formData.metadata).map(([key, value]) => {
                if (typeof value !== 'boolean') return null;
                
                const labels: { [key: string]: string } = {
                  furnished: 'EÅŸyalÄ±',
                  parking: 'Otopark',
                  garden: 'BahÃ§e',
                  pool: 'Havuz',
                  seaView: 'Deniz ManzarasÄ±',
                  balcony: 'Balkon',
                  elevator: 'AsansÃ¶r',
                  airConditioning: 'Klima',
                  heating: 'Kalorifer',
                  fireplace: 'ÅÃ¶mine',
                  security: 'GÃ¼venlik',
                  generator: 'JeneratÃ¶r'
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
              {PROPERTY_FEATURES.map(feature => (
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
              maxFiles={15}
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
                  <img src={image} alt={`Emlak ${index + 1}`} />
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
function PropertyFormWithParams() {
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  
  return <PropertyListingForm editId={editId} />;
}

// Loading fallback component
function PropertyFormLoading() {
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
export default function PropertyFormPage() {
  return (
    <Suspense fallback={<PropertyFormLoading />}>
      <PropertyFormWithParams />
    </Suspense>
  );
}
