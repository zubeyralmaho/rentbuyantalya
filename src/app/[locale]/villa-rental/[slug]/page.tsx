'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Users, Home, Bed, Bath, Square, Star, Wifi } from 'lucide-react';

interface VillaListingData {
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
  price_per_week: number;
  price_per_month: number;
  max_guests: number;
  capacity: number;
  min_rental_days: number;
  daily_price?: number;
  metadata?: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    pool: boolean;
    wifi: boolean;
    airConditioning: boolean;
    kitchen: boolean;
    parking: boolean;
    garden: boolean;
    seaView: boolean;
    beachDistance: number;
    propertyType: string;
  };
  listings_i18n?: [{
    title: string;
    description: string;
    locale: string;
    features_text?: string;
    location_details?: string;
  }];
}

interface AvailabilityData {
  date: string;
  is_available: boolean;
  price: number;
  min_nights: number;
}

export default function VillaRentalDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<VillaListingData | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/villa-rental/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Villa listing data:', data); // Debug
        setListing(data.listing);
        setAvailability(data.availability || []);
      } catch (error) {
        console.error('Error fetching villa listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  const isDateAvailable = (dateString: string): boolean => {
    const availabilityItem = availability.find(item => item.date === dateString);
    return availabilityItem ? availabilityItem.is_available : true;
  };

  const getPriceForDate = (dateString: string): number => {
    const availabilityItem = availability.find(item => item.date === dateString);
    return availabilityItem?.price || listing?.daily_price || listing?.price_per_day || 0;
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    const dailyPrice = listing?.daily_price || listing?.price_per_day || 0;
    
    // Haftalık indirim varsa uygula
    if (days >= 7 && listing?.price_per_week) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * listing.price_per_week + remainingDays * dailyPrice;
    }
    
    // Aylık indirim varsa uygula
    if (days >= 30 && listing?.price_per_month) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return months * listing.price_per_month + remainingDays * dailyPrice;
    }
    
    return days * dailyPrice;
  };

  const handleReservation = () => {
    if (!checkIn || !checkOut) {
      alert('Lütfen giriş ve çıkış tarihlerini seçin');
      return;
    }
    
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < (listing?.min_rental_days || 1)) {
      alert(`Minimum konaklama süresi ${listing?.min_rental_days || 1} gecedir`);
      return;
    }

    if (guests > (listing?.max_guests || listing?.capacity || 1)) {
      alert(`Maksimum ${listing?.max_guests || listing?.capacity} kişi konaklayabilir`);
      return;
    }
    
    const total = calculateTotal();
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    
    const message = `🏡 Villa Kiralama Rezervasyonu

🏨 Villa: ${title}
📍 Konum: ${listing?.location}
📅 Giriş: ${checkIn}
📅 Çıkış: ${checkOut}
👥 Misafir Sayısı: ${guests} kişi
🛏️ ${listing?.metadata?.bedrooms || 0} yatak odası, ${listing?.metadata?.bathrooms || 0} banyo
🏊‍♀️ ${listing?.metadata?.pool ? 'Özel havuzlu' : 'Havuzsuz'}
🌊 ${listing?.metadata?.seaView ? 'Deniz manzaralı' : ''}
💰 Toplam Fiyat: ${total.toLocaleString()} TRY

📝 Özel istekleriniz varsa belirtebilirsiniz.`;
    
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
  const locationDetails = listing.listings_i18n?.[0]?.location_details || listing.location;
  const dailyPrice = listing.daily_price || listing.price_per_day || 0;

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
            <Home className="h-4 w-4" />
            <span>Villa Kiralama</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center text-gray-600 space-x-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{locationDetails}</span>
            </div>
            {(listing.max_guests || listing.capacity) && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{listing.max_guests || listing.capacity} kişi</span>
              </div>
            )}
            {listing.metadata?.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2" />
                <span>{listing.metadata.bedrooms} yatak odası</span>
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

            {/* Villa Özellikleri */}
            {listing.metadata && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Villa Özellikleri</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {listing.metadata.bedrooms && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Yatak Odası</div>
                      <div className="font-medium">{listing.metadata.bedrooms}</div>
                    </div>
                  )}
                  {listing.metadata.bathrooms && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Bath className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Banyo</div>
                      <div className="font-medium">{listing.metadata.bathrooms}</div>
                    </div>
                  )}
                  {listing.metadata.area && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Square className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Alan</div>
                      <div className="font-medium">{listing.metadata.area} m²</div>
                    </div>
                  )}
                  {listing.metadata.beachDistance !== undefined && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm text-gray-600">Plaja Mesafe</div>
                      <div className="font-medium">
                        {listing.metadata.beachDistance === 0 ? 'Sıfır' : `${listing.metadata.beachDistance}m`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Özellikler */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {listing.metadata.pool && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">🏊‍♀️</span>
                      <span className="text-sm font-medium text-blue-900">Özel Havuz</span>
                    </div>
                  )}
                  {listing.metadata.seaView && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">🌊</span>
                      <span className="text-sm font-medium text-blue-900">Deniz Manzarası</span>
                    </div>
                  )}
                  {listing.metadata.garden && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 mr-2">🌿</span>
                      <span className="text-sm font-medium text-green-900">Bahçe</span>
                    </div>
                  )}
                  {listing.metadata.parking && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 mr-2">🚗</span>
                      <span className="text-sm font-medium text-gray-900">Otopark</span>
                    </div>
                  )}
                  {listing.metadata.wifi && (
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Wifi className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">WiFi</span>
                    </div>
                  )}
                  {listing.metadata.airConditioning && (
                    <div className="flex items-center p-3 bg-cyan-50 rounded-lg">
                      <span className="text-cyan-600 mr-2">❄️</span>
                      <span className="text-sm font-medium text-cyan-900">Klima</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Villa Hakkında</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
              
              {/* Özellikler */}
              {listing.features && listing.features.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Dahil Olan Özellikler</h3>
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

            {/* Konum Bilgisi */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum ve Çevre</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{locationDetails}</span>
                </div>
                {listing.metadata?.beachDistance !== undefined && (
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3">🏖️</span>
                    <span className="text-gray-700">
                      {listing.metadata.beachDistance === 0 
                        ? 'Plaj kenarında' 
                        : `Plaja ${listing.metadata.beachDistance} metre`}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">🏪</span>
                  <span className="text-gray-700">Market ve restoranlara yürüme mesafesi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {dailyPrice.toLocaleString()} TRY
                  </span>
                  <span className="text-gray-500">/ gece</span>
                </div>
                {listing.price_per_week && (
                  <div className="text-sm text-gray-600">
                    Haftalık: {listing.price_per_week.toLocaleString()} TRY
                  </div>
                )}
                {listing.price_per_month && (
                  <div className="text-sm text-gray-600">
                    Aylık: {listing.price_per_month.toLocaleString()} TRY
                  </div>
                )}
                {listing.min_rental_days > 1 && (
                  <div className="text-sm text-orange-600 mt-1">
                    Minimum {listing.min_rental_days} gece
                  </div>
                )}
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-4">
                {/* Tarih Seçimi */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giriş
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Çıkış
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Misafir Sayısı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Misafir Sayısı
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    {Array.from({ length: (listing.max_guests || listing.capacity || 10) }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} kişi</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimum {listing.max_guests || listing.capacity} kişi
                  </p>
                </div>

                {/* Uygunluk Kontrolü */}
                {checkIn && !isDateAvailable(checkIn) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">⚠️ Seçilen tarih müsait değil</p>
                  </div>
                )}

                {/* Toplam Fiyat */}
                {checkIn && checkOut && (
                  <div className="border-t pt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Fiyat Detayları
                    </h3>
                    
                    {(() => {
                      const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              {dailyPrice.toLocaleString()} TRY × {days} gece
                            </span>
                            <span className="text-sm text-gray-900">
                              {(dailyPrice * days).toLocaleString()} TRY
                            </span>
                          </div>
                          
                          {/* Haftalık indirim */}
                          {days >= 7 && listing.price_per_week && (
                            <div className="flex justify-between items-center mb-2 text-green-600">
                              <span className="text-sm">Haftalık indirim</span>
                              <span className="text-sm">
                                -{((dailyPrice * days) - calculateTotal()).toLocaleString()} TRY
                              </span>
                            </div>
                          )}
                          
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Toplam</span>
                              <span className="text-xl font-bold text-blue-600">
                                {calculateTotal().toLocaleString()} TRY
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Rezervasyon Butonu */}
                <button
                  onClick={handleReservation}
                  disabled={!checkIn || !checkOut || !isDateAvailable(checkIn)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Rezervasyon Yap
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