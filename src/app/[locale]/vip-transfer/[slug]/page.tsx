'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Users, Plane, Clock, Car, Package } from 'lucide-react';

interface TransferListingData {
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
    vehicleType: string;
    capacity: number;
    luggage: number;
    wifi: boolean;
    airConditioning: boolean;
    childSeat: boolean;
    wheelchairAccessible: boolean;
    luxury: boolean;
  };
  listings_i18n?: [{
    title: string;
    description: string;
    locale: string;
  }];
}

const transferExtras = [
  { id: 'flowers', name: 'Çiçek Karşılama', price: 1000, unit: 'Bir kerelik' },
  { id: 'champagne', name: 'Şampanya Karşılama', price: 2000, unit: 'Bir kerelik' },
  { id: 'childSeat', name: 'Çocuk Koltuğu', price: 0, unit: 'Ücretsiz' },
  { id: 'meetGreet', name: 'Kişisel Karşılama', price: 500, unit: 'Bir kerelik' },
  { id: 'extraStop', name: 'Ekstra Durak', price: 250, unit: 'Durak başına' }
];

const commonLocations = [
  'Antalya Havalimanı',
  'Lara Beach Hotels',
  'Konyaaltı Beach Hotels', 
  'Belek Hotels',
  'Side Hotels',
  'Kemer Hotels',
  'Alanya Hotels',
  'Antalya City Center',
  'Kaleiçi',
  'Antalya Marina'
];

export default function VipTransferDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<TransferListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [transferDate, setTransferDate] = useState('');
  const [transferTime, setTransferTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [childSeats, setChildSeats] = useState(0);
  const [transferDirection, setTransferDirection] = useState<'one-way' | 'round-trip'>('one-way');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [specialWelcome, setSpecialWelcome] = useState<{flowers: boolean, champagne: boolean}>({flowers: false, champagne: false});
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/vip-transfer/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Transfer listing data:', data); // Debug
        setListing(data.listing);
      } catch (error) {
        console.error('Error fetching transfer listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  const calculateExtrasTotal = () => {
    let total = 0;
    if (specialWelcome.flowers) {
      const flowersExtra = transferExtras.find(e => e.id === 'flowers');
      if (flowersExtra) total += flowersExtra.price;
    }
    if (specialWelcome.champagne) {
      const champagneExtra = transferExtras.find(e => e.id === 'champagne');
      if (champagneExtra) total += champagneExtra.price;
    }
    
    Object.entries(selectedExtras).forEach(([extraId, quantity]) => {
      if (quantity > 0) {
        const extra = transferExtras.find(e => e.id === extraId);
        if (extra && extra.price > 0) {
          total += extra.price * quantity;
        }
      }
    });
    
    return total;
  };

  const createGoogleMapsLink = (address: string) => {
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };

  const handleReservation = () => {
    if (!transferDate || !pickupLocation || !dropoffLocation) {
      alert('Lütfen tüm gerekli bilgileri doldurun');
      return;
    }

    if (transferDirection === 'round-trip' && (!returnDate || !returnTime)) {
      alert('Dönüş transfer bilgilerini doldurun');
      return;
    }
    
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    const pickupMapsLink = createGoogleMapsLink(pickupLocation);
    const dropoffMapsLink = createGoogleMapsLink(dropoffLocation);
    
    let message = `🚗 VIP Transfer Rezervasyonu

🚙 Araç: ${title}
📅 Transfer Tarihi: ${transferDate}
🕐 Transfer Saati: ${transferTime}
👥 Yolcu Sayısı: ${guests} kişi

🏁 Alış Yeri: ${pickupLocation}
🗺️ Alış Harita: ${pickupMapsLink}

🏁 Varış Yeri: ${dropoffLocation}
🗺️ Varış Harita: ${dropoffMapsLink}`;

    // Dönüş bilgileri
    if (transferDirection === 'round-trip') {
      message += `\n\n🔄 DÖNÜŞ TRANSFER:
📅 Dönüş Tarihi: ${returnDate}
🕐 Dönüş Saati: ${returnTime}`;
    }

    // Bagaj ve çocuk koltuğu
    if (luggageCount > 0) {
      message += `\n\n🧳 Bagaj Sayısı: ${luggageCount} adet`;
    }

    if (childSeats > 0) {
      message += `\n👶 Çocuk Koltuğu: ${childSeats} adet (ücretsiz)`;
    }

    // Özel karşılama ve ekstralar
    const welcomeExtras = [];
    if (specialWelcome.flowers) welcomeExtras.push('🌸 Çiçek Karşılama');
    if (specialWelcome.champagne) welcomeExtras.push('🍾 Şampanya Karşılama');
    
    const selectedExtrasText = Object.entries(selectedExtras)
      .filter(([_, quantity]) => quantity > 0)
      .map(([extraId, quantity]) => {
        const extra = transferExtras.find(e => e.id === extraId);
        if (extra) {
          return `- ${extra.name}: ${quantity} adet`;
        }
        return '';
      })
      .join('\n');

    if (welcomeExtras.length > 0 || selectedExtrasText) {
      message += `\n\n🌟 Özel Hizmetler:`;
      if (welcomeExtras.length > 0) {
        message += `\n${welcomeExtras.join('\n')}`;
      }
      if (selectedExtrasText) {
        message += `\n${selectedExtrasText}`;
      }
    }

    const extrasTotal = calculateExtrasTotal();
    if (extrasTotal > 0) {
      message += `\n\n💰 Ekstra Hizmetler Tutarı: ${extrasTotal.toLocaleString()} TRY`;
    }

    message += `\n\n📝 Not: Fiyat mesafe ve araç tipine göre belirlenecektir.`;
    
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
            <Plane className="h-4 w-4" />
            <span>VIP Transfer</span>
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
            {listing.metadata?.vehicleType && (
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                <span>{listing.metadata.vehicleType}</span>
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

            {/* Araç Özellikleri */}
            {listing.metadata && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Araç Özellikleri</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {listing.metadata.capacity && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Kapasite</div>
                      <div className="font-medium">{listing.metadata.capacity} kişi</div>
                    </div>
                  )}
                  {listing.metadata.luggage && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Package className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Bagaj</div>
                      <div className="font-medium">{listing.metadata.luggage} adet</div>
                    </div>
                  )}
                  {listing.metadata.vehicleType && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Car className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Araç Tipi</div>
                      <div className="font-medium">{listing.metadata.vehicleType}</div>
                    </div>
                  )}
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm text-gray-600">Hizmet</div>
                    <div className="font-medium">24/7</div>
                  </div>
                </div>

                {/* Premium Özellikler */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.metadata.wifi && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">📶</span>
                      <span className="text-sm font-medium text-blue-900">WiFi</span>
                    </div>
                  )}
                  {listing.metadata.airConditioning && (
                    <div className="flex items-center p-3 bg-cyan-50 rounded-lg">
                      <span className="text-cyan-600 mr-2">❄️</span>
                      <span className="text-sm font-medium text-cyan-900">Klima</span>
                    </div>
                  )}
                  {listing.metadata.luxury && (
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 mr-2">⭐</span>
                      <span className="text-sm font-medium text-yellow-900">Lüks</span>
                    </div>
                  )}
                  {listing.metadata.childSeat && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 mr-2">👶</span>
                      <span className="text-sm font-medium text-green-900">Çocuk Koltuğu</span>
                    </div>
                  )}
                  {listing.metadata.wheelchairAccessible && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 mr-2">♿</span>
                      <span className="text-sm font-medium text-purple-900">Engelli Erişimi</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hizmet Detayları</h2>
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
                  <p className="text-sm font-semibold">Profesyonel Şoför</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Yakıt Dahil</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Sigorta Dahil</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">24/7 Destek</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🚗 Transfer Hizmeti</h4>
                  <p className="text-sm text-blue-800">
                    Fiyat rezervasyon sırasında mesafe ve araç tipine göre belirlenecektir.
                  </p>
                </div>
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-4">
                {/* Transfer Yönü */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔄 Transfer Yönü
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      transferDirection === 'one-way' 
                        ? 'border-blue-500 bg-blue-100 text-blue-800' 
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}>
                      <input
                        type="radio"
                        name="transferDirection"
                        value="one-way"
                        checked={transferDirection === 'one-way'}
                        onChange={(e) => setTransferDirection(e.target.value as 'one-way' | 'round-trip')}
                        className="sr-only"
                      />
                      <span className="text-lg mb-1">➡️</span>
                      <span className="text-sm font-medium">Tek Yön</span>
                    </label>
                    
                    <label className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      transferDirection === 'round-trip' 
                        ? 'border-blue-500 bg-blue-100 text-blue-800' 
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}>
                      <input
                        type="radio"
                        name="transferDirection"
                        value="round-trip"
                        checked={transferDirection === 'round-trip'}
                        onChange={(e) => setTransferDirection(e.target.value as 'one-way' | 'round-trip')}
                        className="sr-only"
                      />
                      <span className="text-lg mb-1">🔄</span>
                      <span className="text-sm font-medium">Çift Yön</span>
                    </label>
                  </div>
                </div>

                {/* Transfer Tarihi ve Saati */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">📅 Transfer Detayları</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tarih</label>
                      <input
                        type="date"
                        required
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Saat</label>
                      <input
                        type="time"
                        required
                        value={transferTime}
                        onChange={(e) => setTransferTime(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Lokasyonlar */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📍 Nereden (Alış Yeri)
                    </label>
                    <select
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Alış yeri seçin</option>
                      {commonLocations.map(location => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📍 Nereye (Varış Yeri)
                    </label>
                    <select
                      required
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Varış yeri seçin</option>
                      {commonLocations.map(location => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dönüş Bilgileri */}
                {transferDirection === 'round-trip' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-yellow-800 mb-2">🔄 Dönüş Transfer</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Dönüş Tarihi</label>
                        <input
                          type="date"
                          required={transferDirection === 'round-trip'}
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          min={transferDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Dönüş Saati</label>
                        <input
                          type="time"
                          required={transferDirection === 'round-trip'}
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yolcu Sayısı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👥 Yolcu Sayısı
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    {Array.from({ length: (listing.max_guests || 8) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} kişi</option>
                    ))}
                  </select>
                </div>

                {/* Ekstra Bilgiler */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🧳 Bagaj Sayısı
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={luggageCount}
                      onChange={(e) => setLuggageCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      👶 Çocuk Koltuğu
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={childSeats}
                      onChange={(e) => setChildSeats(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ücretsiz</p>
                  </div>
                </div>

                {/* Özel Karşılama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🌟 Özel Karşılama
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={specialWelcome.flowers}
                          onChange={(e) => setSpecialWelcome(prev => ({...prev, flowers: e.target.checked}))}
                          className="mr-3"
                        />
                        <span className="text-sm">🌸 Çiçek Karşılama</span>
                      </div>
                      <span className="text-sm text-gray-600">+1.000 TRY</span>
                    </label>
                    
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={specialWelcome.champagne}
                          onChange={(e) => setSpecialWelcome(prev => ({...prev, champagne: e.target.checked}))}
                          className="mr-3"
                        />
                        <span className="text-sm">🍾 Şampanya Karşılama</span>
                      </div>
                      <span className="text-sm text-gray-600">+2.000 TRY</span>
                    </label>
                  </div>
                </div>

                {/* Ekstra Hizmetler Toplamı */}
                {calculateExtrasTotal() > 0 && (
                  <div className="border-t pt-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Ekstra Hizmetler</span>
                        <span className="text-lg font-bold text-blue-600">
                          {calculateExtrasTotal().toLocaleString()} TRY
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rezervasyon Butonu */}
                <button
                  onClick={handleReservation}
                  disabled={!transferDate || !transferTime || !pickupLocation || !dropoffLocation || 
                    (transferDirection === 'round-trip' && (!returnDate || !returnTime))}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Transfer Rezervasyonu Yap
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