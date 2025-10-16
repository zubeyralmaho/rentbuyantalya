'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Users, Calendar, Clock, Anchor, Waves } from 'lucide-react';

interface BoatListingData {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  storage_paths?: string[];
  storage_bucket?: string;
  features: string[];
  location: string;
  price_per_day: number;
  max_guests: number;
  min_rental_days: number;
  daily_price?: number;
  metadata?: {
    boatType: string;
    length: number;
    capacity: number;
    cabins: number;
    crew: boolean;
    skipperIncluded: boolean;
    fuel: 'included' | 'extra';
    equipment: string[];
  };
  listings_i18n?: [{
    title: string;
    description: string;
    locale: string;
  }];
}

const tourOptions = [
  { id: 'half-day', name: 'Yarım Gün Turu', duration: '4 saat', basePrice: 0 },
  { id: 'full-day', name: 'Tam Gün Turu', duration: '8 saat', basePrice: 1.5 },
  { id: 'sunset', name: 'Gün Batımı Turu', duration: '3 saat', basePrice: 1.2 },
  { id: 'private-charter', name: 'Özel Kiralama', duration: 'Esnek', basePrice: 2 },
  { id: 'multi-day', name: 'Çok Günlük', duration: '2+ gün', basePrice: 0.8 }
];

const boatExtras = [
  { id: 'lunch', name: 'Öğle Yemeği', price: 1500, unit: 'Kişi başına' },
  { id: 'snorkeling', name: 'Şnorkel Ekipmanları', price: 500, unit: 'Set başına' },
  { id: 'fishing', name: 'Balık Tutma Ekipmanları', price: 800, unit: 'Set başına' },
  { id: 'photographer', name: 'Profesyonel Fotoğrafçı', price: 3000, unit: 'Bir kerelik' },
  { id: 'transfers', name: 'Hotel Transfer', price: 1000, unit: 'Araç başına' }
];

const popularRoutes = [
  'Kemer Marina',
  'Phaselis Antik Kenti',
  'Moonlight Beach',
  'Three Islands Tour',
  'Olympos Beach',
  'Adrasan Bay',
  'Suluada Island',
  'Cirali Beach'
];

export default function BoatRentalDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<BoatListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [tourDate, setTourDate] = useState('');
  const [tourType, setTourType] = useState('half-day');
  const [guests, setGuests] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [customRoute, setCustomRoute] = useState('');
  const [departureTime, setDepartureTime] = useState('09:00');
  const [skipperNeeded, setSkipperNeeded] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>({});
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/boat-rental/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Boat listing data:', data); // Debug
        setListing(data.listing);
      } catch (error) {
        console.error('Error fetching boat listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  const selectedTourOption = tourOptions.find(option => option.id === tourType);

  const calculatePrice = () => {
    if (!listing || !selectedTourOption) return 0;
    
    const basePrice = listing.price_per_day || listing.daily_price || 0;
    const tourMultiplier = selectedTourOption.basePrice || 1;
    const tourPrice = basePrice * tourMultiplier;
    
    // Ekstra hizmetler
    let extrasTotal = 0;
    Object.entries(selectedExtras).forEach(([extraId, quantity]) => {
      if (quantity > 0) {
        const extra = boatExtras.find(e => e.id === extraId);
        if (extra) {
          if (extra.unit === 'Kişi başına') {
            extrasTotal += extra.price * quantity * guests;
          } else {
            extrasTotal += extra.price * quantity;
          }
        }
      }
    });
    
    return tourPrice + extrasTotal;
  };

  const handleReservation = () => {
    if (!tourDate) {
      alert('Lütfen tur tarihini seçin');
      return;
    }

    if (!selectedRoute && !customRoute) {
      alert('Lütfen tur rotasını seçin');
      return;
    }
    
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    const selectedTour = tourOptions.find(t => t.id === tourType);
    const route = selectedRoute || customRoute;
    
    let message = `⛵ Tekne Kiralama Rezervasyonu

🚤 Tekne: ${title}
📅 Tur Tarihi: ${tourDate}
🕐 Kalkış Saati: ${departureTime}
👥 Kişi Sayısı: ${guests} kişi

🎯 Tur Tipi: ${selectedTour?.name} (${selectedTour?.duration})
🗺️ Rota: ${route}
👨‍✈️ Kaptan: ${skipperNeeded ? 'Dahil' : 'Kendi kaptan'}`;

    // Ekstra hizmetler
    const selectedExtrasText = Object.entries(selectedExtras)
      .filter(([_, quantity]) => quantity > 0)
      .map(([extraId, quantity]) => {
        const extra = boatExtras.find(e => e.id === extraId);
        if (extra) {
          if (extra.unit === 'Kişi başına') {
            return `- ${extra.name}: ${quantity} kişi x ${extra.price.toLocaleString()} TRY`;
          } else {
            return `- ${extra.name}: ${quantity} adet x ${extra.price.toLocaleString()} TRY`;
          }
        }
        return '';
      })
      .join('\n');

    if (selectedExtrasText) {
      message += `\n\n🌟 Ekstra Hizmetler:\n${selectedExtrasText}`;
    }

    if (specialRequests) {
      message += `\n\n📝 Özel İstekler:\n${specialRequests}`;
    }

    const totalPrice = calculatePrice();
    if (totalPrice > 0) {
      message += `\n\n💰 Tahmini Tutar: ${totalPrice.toLocaleString()} TRY`;
    }
    
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '905071564700';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{commonT('loading')}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    notFound();
  }

  const title = listing.listings_i18n?.[0]?.title || listing.name;
  const description = listing.listings_i18n?.[0]?.description || listing.description;

  // Resim URL'si oluştur
  const getImageUrl = (path: string, index: number) => {
    if (path.startsWith('http')) return path;
    if (listing.storage_paths && listing.storage_paths[index] && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const bucket = listing.storage_bucket || 'listings';
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${listing.storage_paths[index]}`;
    }
    return path;
  };

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Anchor className="h-4 w-4" />
            <span>Tekne Kiralama</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center text-gray-600 space-x-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{listing.location}</span>
            </div>
            {listing.max_guests && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{listing.max_guests} kişi</span>
              </div>
            )}
            {listing.metadata?.boatType && (
              <div className="flex items-center">
                <Waves className="h-5 w-5 mr-2" />
                <span>{listing.metadata.boatType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol taraf - Resimler ve Detaylar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resim Galerisi */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-[3/2] bg-gray-200">
                  <img
                    src={getImageUrl(images[selectedImages], selectedImages)}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImages(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 ${
                            selectedImages === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={getImageUrl(image, index)}
                            alt={`${title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tekne Özellikleri */}
            {listing.metadata && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tekne Özellikleri</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {listing.metadata.length && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Anchor className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Uzunluk</div>
                      <div className="font-medium">{listing.metadata.length}m</div>
                    </div>
                  )}
                  {listing.metadata.capacity && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Kapasite</div>
                      <div className="font-medium">{listing.metadata.capacity} kişi</div>
                    </div>
                  )}
                  {listing.metadata.cabins && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-2xl mb-2 block">🛏️</span>
                      <div className="text-sm text-gray-600">Kabin</div>
                      <div className="font-medium">{listing.metadata.cabins} adet</div>
                    </div>
                  )}
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-2xl mb-2 block">👨‍✈️</span>
                    <div className="text-sm text-gray-600">Kaptan</div>
                    <div className="font-medium">{listing.metadata.skipperIncluded ? 'Dahil' : 'Opsiyonel'}</div>
                  </div>
                </div>

                {/* Yakıt ve Ekipman Bilgisi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">⛽ Yakıt</h4>
                    <p className="text-sm text-blue-800">
                      {listing.metadata.fuel === 'included' ? 'Yakıt dahil' : 'Yakıt ekstra ücretli'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">👨‍👩‍👧‍👦 Mürettebat</h4>
                    <p className="text-sm text-green-800">
                      {listing.metadata.crew ? 'Mürettebat dahil' : 'Sadece kaptan'}
                    </p>
                  </div>
                </div>

                {/* Tekne Ekipmanları */}
                {listing.metadata.equipment && listing.metadata.equipment.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🎒 Tekne Ekipmanları</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {listing.metadata.equipment.map((equipment, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{equipment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tekne Hakkında</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
              
              {/* Özellikler */}
              {listing.features && listing.features.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dahil Olan Hizmetler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {listing.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{feature.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Standart Dahil Hizmetler */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-center text-white">
                Standart Dahil Hizmetler
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="text-white">
                  <p className="text-sm font-semibold">Güvenlik Ekipmanları</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Sigorta</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">İlk Yardım</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Güneş Şemsiyeleri</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">⛵ Tekne Turu</h4>
                  <p className="text-sm text-blue-800">
                    Fiyat tur tipine ve süreye göre değişmektedir.
                  </p>
                </div>
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-4">
                {/* Tur Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Tur Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                {/* Tur Tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 Tur Tipi
                  </label>
                  <div className="space-y-2">
                    {tourOptions.map(option => (
                      <label key={option.id} className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        tourType === option.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="tourType"
                            value={option.id}
                            checked={tourType === option.id}
                            onChange={(e) => setTourType(e.target.value)}
                            className="sr-only"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.duration}</div>
                          </div>
                        </div>
                        {option.basePrice !== 0 && (
                          <div className="text-sm text-gray-600">
                            {option.basePrice > 1 ? `+${((option.basePrice - 1) * 100).toFixed(0)}%` : 
                             option.basePrice < 1 ? `-${((1 - option.basePrice) * 100).toFixed(0)}%` : 'Baz fiyat'}
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Kalkış Saati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🕐 Kalkış Saati
                  </label>
                  <select
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00 (Sunset)</option>
                  </select>
                </div>

                {/* Kişi Sayısı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👥 Kişi Sayısı
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    {Array.from({ length: (listing.max_guests || 12) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} kişi</option>
                    ))}
                  </select>
                </div>

                {/* Rota Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🗺️ Tur Rotası
                  </label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 mb-2"
                  >
                    <option value="">Popüler rotalardan seçin</option>
                    {popularRoutes.map(route => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Veya özel rota yazın..."
                    value={customRoute}
                    onChange={(e) => setCustomRoute(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                {/* Kaptan */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-yellow-800">👨‍✈️ Kaptan Gerekli</span>
                      <p className="text-xs text-yellow-700">Deneyimli kaptan olmadan tekne kiralamak mümkün değildir</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={skipperNeeded}
                      onChange={(e) => setSkipperNeeded(e.target.checked)}
                      className="ml-3"
                    />
                  </label>
                </div>

                {/* Ekstra Hizmetler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌟 Ekstra Hizmetler
                  </label>
                  <div className="space-y-2">
                    {boatExtras.map(extra => (
                      <div key={extra.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="text-sm font-medium">{extra.name}</div>
                          <div className="text-xs text-gray-500">{extra.price.toLocaleString()} TRY / {extra.unit}</div>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={selectedExtras[extra.id] || 0}
                          onChange={(e) => setSelectedExtras(prev => ({
                            ...prev,
                            [extra.id]: Number(e.target.value)
                          }))}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Özel İstekler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Özel İstekler
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                {/* Fiyat Hesaplama */}
                {calculatePrice() > 0 && (
                  <div className="border-t pt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Tur ücreti</span>
                        <span className="text-sm">{((listing.price_per_day || 0) * (selectedTourOption?.basePrice || 1)).toLocaleString()} TRY</span>
                      </div>
                      
                      {Object.entries(selectedExtras).filter(([_, qty]) => qty > 0).map(([extraId, quantity]) => {
                        const extra = boatExtras.find(e => e.id === extraId);
                        if (!extra) return null;
                        
                        const price = extra.unit === 'Kişi başına' 
                          ? extra.price * quantity * guests 
                          : extra.price * quantity;
                          
                        return (
                          <div key={extraId} className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">{extra.name}</span>
                            <span className="text-sm">{price.toLocaleString()} TRY</span>
                          </div>
                        );
                      })}
                      
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Toplam</span>
                          <span className="text-lg font-bold text-blue-600">
                            {calculatePrice().toLocaleString()} TRY
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rezervasyon Butonu */}
                <button
                  onClick={handleReservation}
                  disabled={!tourDate || (!selectedRoute && !customRoute)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Tekne Turu Rezervasyonu Yap
                </button>

                <div className="text-center text-sm text-gray-500">
                  WhatsApp üzerinden rezervasyon tamamlanır
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}