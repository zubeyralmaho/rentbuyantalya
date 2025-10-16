'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Users, Bed, Bath, Maximize, Calendar, Wifi, Car, Waves } from 'lucide-react';

interface ApartListingData {
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
    bedrooms: number;
    bathrooms: number;
    area: number;
    floor: number;
    totalFloors: number;
    balcony: boolean;
    furnished: boolean;
    airConditioning: boolean;
    wifi: boolean;
    parking: boolean;
    elevator: boolean;
    pool: boolean;
    sea_view: boolean;
    mountain_view: boolean;
    city_view: boolean;
  };
  listings_i18n?: [{
    title: string;
    description: string;
    locale: string;
  }];
}

export default function ApartRentalDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<ApartListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/apart-rental/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Apart listing data:', data); // Debug
        setListing(data.listing);
      } catch (error) {
        console.error('Error fetching apart listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing) return 0;
    
    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff <= 0) return 0;
    
    const dailyRate = listing.price_per_day || listing.daily_price || 0;
    return dailyRate * dayDiff;
  };

  const getMinCheckoutDate = () => {
    if (!checkIn || !listing?.min_rental_days) return checkIn;
    
    const checkinDate = new Date(checkIn);
    checkinDate.setDate(checkinDate.getDate() + listing.min_rental_days);
    return checkinDate.toISOString().split('T')[0];
  };

  const handleReservation = () => {
    if (!checkIn || !checkOut) {
      alert('Lütfen giriş ve çıkış tarihlerini seçin');
      return;
    }

    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);
    const dayDiff = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 3600 * 24));
    
    if (dayDiff < (listing?.min_rental_days || 1)) {
      alert(`Minimum kiralama süresi ${listing?.min_rental_days || 1} gündür`);
      return;
    }
    
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    const totalPrice = calculateTotalPrice();
    
    let message = `🏠 Apart Kiralama Rezervasyonu

🏢 Apart: ${title}
📍 Konum: ${listing?.location}
📅 Giriş: ${checkIn}
📅 Çıkış: ${checkOut}
📊 Süre: ${dayDiff} gece
👥 Misafir: ${guests} kişi`;

    // Apart özellikleri
    if (listing?.metadata) {
      message += `\n\n🏠 Apart Detayları:`;
      if (listing.metadata.bedrooms) message += `\n🛏️ ${listing.metadata.bedrooms} yatak odası`;
      if (listing.metadata.bathrooms) message += `\n🚿 ${listing.metadata.bathrooms} banyo`;
      if (listing.metadata.area) message += `\n📐 ${listing.metadata.area}m² alan`;
      if (listing.metadata.floor && listing.metadata.totalFloors) {
        message += `\n🏢 ${listing.metadata.floor}/${listing.metadata.totalFloors} kat`;
      }
    }

    // Manzara bilgileri
    const views = [];
    if (listing?.metadata?.sea_view) views.push('🌊 Deniz manzarası');
    if (listing?.metadata?.mountain_view) views.push('🏔️ Dağ manzarası');
    if (listing?.metadata?.city_view) views.push('🏙️ Şehir manzarası');
    
    if (views.length > 0) {
      message += `\n\n👀 Manzara:\n${views.join('\n')}`;
    }

    // Özel istekler
    if (specialRequests) {
      message += `\n\n📝 Özel İstekler:\n${specialRequests}`;
    }

    // Fiyat bilgisi
    if (totalPrice > 0) {
      const dailyRate = listing?.price_per_day || listing?.daily_price || 0;
      message += `\n\n💰 Fiyat Detayı:`;
      message += `\n- Günlük: ${dailyRate.toLocaleString()} TRY`;
      message += `\n- ${dayDiff} gece: ${totalPrice.toLocaleString()} TRY`;
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
            <span>🏢</span>
            <span>Apart Kiralama</span>
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

            {/* Apart Özellikleri */}
            {listing.metadata && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Apart Özellikleri</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {listing.metadata.bedrooms && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Bed className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Yatak Odası</div>
                      <div className="font-medium">{listing.metadata.bedrooms}</div>
                    </div>
                  )}
                  {listing.metadata.bathrooms && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Bath className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Banyo</div>
                      <div className="font-medium">{listing.metadata.bathrooms}</div>
                    </div>
                  )}
                  {listing.metadata.area && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Maximize className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">Alan</div>
                      <div className="font-medium">{listing.metadata.area}m²</div>
                    </div>
                  )}
                  {listing.metadata.floor && listing.metadata.totalFloors && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-2xl mb-2 block">🏢</span>
                      <div className="text-sm text-gray-600">Kat</div>
                      <div className="font-medium">{listing.metadata.floor}/{listing.metadata.totalFloors}</div>
                    </div>
                  )}
                </div>

                {/* Manzara Özellikleri */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">👀 Manzara</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {listing.metadata.sea_view && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Waves className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Deniz</span>
                      </div>
                    )}
                    {listing.metadata.mountain_view && (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600 mr-2">🏔️</span>
                        <span className="text-sm font-medium text-green-900">Dağ</span>
                      </div>
                    )}
                    {listing.metadata.city_view && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 mr-2">🏙️</span>
                        <span className="text-sm font-medium text-gray-900">Şehir</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Apart Imkanları */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🏠 Apart İmkanları</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.metadata.wifi && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Wifi className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">WiFi</span>
                      </div>
                    )}
                    {listing.metadata.airConditioning && (
                      <div className="flex items-center p-3 bg-cyan-50 rounded-lg">
                        <span className="text-cyan-600 mr-2">❄️</span>
                        <span className="text-sm font-medium text-cyan-900">Klima</span>
                      </div>
                    )}
                    {listing.metadata.parking && (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Car className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">Otopark</span>
                      </div>
                    )}
                    {listing.metadata.elevator && (
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 mr-2">🛗</span>
                        <span className="text-sm font-medium text-purple-900">Asansör</span>
                      </div>
                    )}
                    {listing.metadata.pool && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 mr-2">🏊</span>
                        <span className="text-sm font-medium text-blue-900">Havuz</span>
                      </div>
                    )}
                    {listing.metadata.balcony && (
                      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-600 mr-2">🏡</span>
                        <span className="text-sm font-medium text-yellow-900">Balkon</span>
                      </div>
                    )}
                    {listing.metadata.furnished && (
                      <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-600 mr-2">🪑</span>
                        <span className="text-sm font-medium text-orange-900">Eşyalı</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apart Hakkında</h2>
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
                  <p className="text-sm font-semibold">Temizlik Hizmeti</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Çarşaf Havlu</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">7/24 Destek</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Check-in Desteği</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {(listing.price_per_day || listing.daily_price || 0).toLocaleString()} TRY
                  </div>
                  <div className="text-sm text-gray-600">gecelik</div>
                </div>
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-4">
                {/* Tarihler */}
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
                      min={getMinCheckoutDate()}
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
                    {Array.from({ length: listing.max_guests || 8 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} misafir</option>
                    ))}
                  </select>
                </div>

                {/* Minimum Kalış Süresi */}
                {listing.min_rental_days && listing.min_rental_days > 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Minimum {listing.min_rental_days} gece konaklama gereklidir
                    </div>
                  </div>
                )}

                {/* Özel İstekler */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Özel İstekler
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
                {checkIn && checkOut && calculateTotalPrice() > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>{(listing.price_per_day || listing.daily_price || 0).toLocaleString()} TRY x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))} gece</span>
                        <span>{calculateTotalPrice().toLocaleString()} TRY</span>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Toplam</span>
                        <span className="text-xl font-bold text-blue-600">
                          {calculateTotalPrice().toLocaleString()} TRY
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rezervasyon Butonu */}
                <button
                  onClick={handleReservation}
                  disabled={!checkIn || !checkOut}
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