'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Users, Car, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface CarListingData {
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
  max_guests: number;
  min_rental_days: number;
  daily_price?: number;
  segment_id?: string;
  car_segments?: {
    id: string;
    name: string;
    slug: string;
  };
  metadata?: {
    transmission: string;
    fuel_type: string;
    doors: number;
    luggage: number;
    year: number;
  };
  listings_i18n?: [{
    title: string;
    description: string;
    locale: string;
  }];
}

const carExtras = [
  { id: 'km1000', name: '1000 km ek paket', price: 7000, type: 'once', unit: 'Bir kerelik' },
  { id: 'km2000', name: '2000 km ek paket', price: 10000, type: 'once', unit: 'Bir kerelik' },
  { id: 'phoneHolder', name: 'Telefon Tutacağı', price: 500, type: 'once', unit: 'Bir kerelik' },
  { id: 'babySeat', name: 'Bebek Koltuğu (0-6 ay)', price: 150, type: 'daily', unit: 'Günlük' },
  { id: 'childSeat', name: 'Çocuk koltuğu 1 yaş üstü', price: 200, type: 'daily', unit: 'Günlük' },
  { id: 'simCard', name: 'Sim Kart', price: 2000, type: 'once', unit: 'Bir kerelik' },
  { id: 'powerbank', name: 'Powerbank', price: 1000, type: 'once', unit: 'Bir kerelik' }
];

const insuranceOptions = [
  { id: 'standard', name: 'Standart Sigorta', price: 0, type: 'daily', unit: 'Ücretsiz', description: 'Temel sigorta kapsamı dahil' },
  { id: 'miniInsurance', name: 'Lastik - Cam - Far Sigortası', price: 400, type: 'daily', unit: 'Günlük', description: 'Mini hasar kapsamı' },
  { id: 'fullKasko', name: 'Ful Kasko', price: 600, type: 'daily', unit: 'Günlük', description: 'Tam kapsamlı sigorta' }
];

const dropOffLocations = [
  { id: 'merkez_ofis', name: 'Merkez Ofis', defaultFee: 0 },
  { id: 'antalya_havalimanı_ic_hatlar', name: 'Antalya Havalimanı İç Hatlar', defaultFee: 150 },
  { id: 'antalya_havalimanı_dis_hatlar_t1', name: 'Antalya Havalimanı Dış Hatlar T1', defaultFee: 150 },
  { id: 'antalya_havalimanı_dis_hatlar_t2', name: 'Antalya Havalimanı Dış Hatlar T2', defaultFee: 150 },
  { id: 'adrese_teslim', name: 'Adrese Teslim', defaultFee: 250 },
  { id: 'belek', name: 'Belek', defaultFee: 200 },
  { id: 'kundu_oteller_bölgesi', name: 'Kundu Oteller Bölgesi', defaultFee: 100 },
  { id: 'lara_bölgesi', name: 'Lara Bölgesi', defaultFee: 100 },
  { id: 'kaleiçi', name: 'Kaleiçi', defaultFee: 50 },
  { id: 'konyaaltı', name: 'Konyaaltı', defaultFee: 75 }
];

export default function CarRentalDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<CarListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: boolean}>({});
  const [selectedInsurance, setSelectedInsurance] = useState('standard'); // Default olarak standart sigorta
  const [dropOffFee, setDropOffFee] = useState(0);
  const [isExtrasOpen, setIsExtrasOpen] = useState(false); // Ekstralar listesi açık/kapalı
  const [isInsuranceOpen, setIsInsuranceOpen] = useState(false); // Sigorta listesi açık/kapalı
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  const [driverInfo, setDriverInfo] = useState({
    fullName: '',
    birthDate: '',
    flightNotes: '',
    phone: '',
    email: '',
    specialNotes: '',
    createAccount: false,
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/car-rental/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Car listing data:', data); // Debug
        setListing(data.listing);
      } catch (error) {
        console.error('Error fetching car listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  // Drop-off fee hesaplama
  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      const fee = calculateDropOffFee(pickupLocation, dropoffLocation);
      setDropOffFee(fee);
    }
  }, [pickupLocation, dropoffLocation]);

  const calculateDropOffFee = (pickupLoc: string, dropoffLoc: string) => {
    if (pickupLoc === dropoffLoc) return 0;
    if (pickupLoc === 'Merkez Ofis' || dropoffLoc === 'Merkez Ofis') return 0;
    
    const dropoffLocationData = dropOffLocations.find(loc => 
      dropoffLoc.toLowerCase().includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(dropoffLoc.toLowerCase())
    );
    
    return dropoffLocationData?.defaultFee || 0;
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    const dailyPrice = listing?.daily_price || listing?.price_per_day || 0;
    let basePrice = days >= 7 && listing?.price_per_week 
      ? Math.floor(days / 7) * listing.price_per_week + (days % 7) * dailyPrice
      : days * dailyPrice;

    // Extras hesaplama (checkbox mantığı)
    let extrasTotal = 0;
    Object.entries(selectedExtras).forEach(([extraId, isSelected]) => {
      if (isSelected) {
        const extra = carExtras.find(e => e.id === extraId);
        if (extra) {
          if (extra.type === 'daily') {
            extrasTotal += extra.price * days;
          } else {
            extrasTotal += extra.price;
          }
        }
      }
    });

    // Sigorta hesaplama
    const selectedInsuranceOption = insuranceOptions.find(ins => ins.id === selectedInsurance);
    let insuranceTotal = 0;
    if (selectedInsuranceOption && selectedInsuranceOption.price > 0) {
      insuranceTotal = selectedInsuranceOption.price * days;
    }
    
    return basePrice + extrasTotal + insuranceTotal + dropOffFee;
  };

  const handleReservation = () => {
    if (!checkIn || !checkOut || !pickupLocation || !dropoffLocation) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < (listing?.min_rental_days || 2)) {
      alert(`Minimum kiralama süresi ${listing?.min_rental_days || 2} gündür`);
      return;
    }
    
    const total = calculateTotal();
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    
    // WhatsApp mesajı oluştur
    const selectedExtrasText = Object.entries(selectedExtras)
      .filter(([_, isSelected]) => isSelected)
      .map(([extraId, _]) => {
        const extra = carExtras.find(e => e.id === extraId);
        if (extra) {
          const extraPrice = extra.type === 'daily' 
            ? extra.price * days 
            : extra.price;
          return `- ${extra.name}: ${extraPrice.toLocaleString()} TRY (${extra.unit})`;
        }
        return '';
      })
      .join('\n');

    const selectedInsuranceOption = insuranceOptions.find(ins => ins.id === selectedInsurance);
    const insuranceText = selectedInsuranceOption ? `🛡️ Sigorta: ${selectedInsuranceOption.name}` : '';

    let message = `🚗 Araç Kiralama Rezervasyonu

📋 Araç: ${title}
📅 Alış Tarihi: ${checkIn}
📅 Dönüş Tarihi: ${checkOut}
🚗 Alış Yeri: ${pickupLocation}
🏁 Dönüş Yeri: ${dropoffLocation}
💰 Toplam Fiyat: ${total.toLocaleString()} TRY

👤 Sürücü Bilgileri:
Ad Soyad: ${driverInfo.fullName}
Doğum Tarihi: ${driverInfo.birthDate}
Telefon: ${driverInfo.phone}
E-posta: ${driverInfo.email}`;

    if (selectedExtrasText) {
      message += `\n\n📋 Seçilen Ekstralar:\n${selectedExtrasText}`;
    }

    if (insuranceText) {
      message += `\n\n${insuranceText}`;
    }

    if (dropOffFee > 0) {
      message += `\n\n🚗 Farklı Lokasyon Teslim Ücreti: ${dropOffFee.toLocaleString()} TRY`;
    }

    if (driverInfo.flightNotes) {
      message += `\nUçuş Notları: ${driverInfo.flightNotes}`;
    }

    if (driverInfo.specialNotes) {
      message += `\nÖzel Notlar: ${driverInfo.specialNotes}`;
    }

    message += `\n\n💳 Ödeme Yöntemi: ${paymentMethod === 'cash' ? 'Nakit' : 'Banka Havalesi / EFT'}`;
    
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
            <Car className="h-4 w-4" />
            <span>Araç Kiralama</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">{listing.location}</span>
            </div>
            {listing.max_guests && (
              <div className="flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">{listing.max_guests} kişi</span>
              </div>
            )}
            {listing.car_segments && (
              <div className="flex items-center">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">{listing.car_segments.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sol taraf - Resimler ve Detaylar */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Resim Galerisi */}
            {images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-[4/3] sm:aspect-[3/2] bg-gray-200">
                  <img
                    src={getImageUrl(images[selectedImages], selectedImages)}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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

            {/* Araç Detayları */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Araç Detayları</h2>
              
              {/* Teknik Özellikler */}
              {listing.metadata && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {listing.metadata.transmission && (
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Şanzıman</div>
                      <div className="font-medium text-sm sm:text-base">{listing.metadata.transmission}</div>
                    </div>
                  )}
                  {listing.metadata.fuel_type && (
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Yakıt</div>
                      <div className="font-medium text-sm sm:text-base">{listing.metadata.fuel_type}</div>
                    </div>
                  )}
                  {listing.metadata.doors && (
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Kapı</div>
                      <div className="font-medium text-sm sm:text-base">{listing.metadata.doors}</div>
                    </div>
                  )}
                  {listing.metadata.luggage && (
                    <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs sm:text-sm text-gray-600">Bagaj</div>
                      <div className="font-medium text-sm sm:text-base">{listing.metadata.luggage}</div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed mb-4">{description}</p>
              
              {/* Özellikler */}
              {listing.features && listing.features.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Araç Özellikleri</h3>
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
                  <p className="text-sm font-semibold">Kasko Sigortası</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Tam Deposu Teslim</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">GPS Navigasyon</p>
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">24/7 Destek</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {dailyPrice.toLocaleString()} TRY
                  </span>
                  <span className="text-sm sm:text-base text-gray-500">/ gün</span>
                </div>
                {listing.price_per_week && (
                  <div className="text-sm text-gray-600">
                    Haftalık: {listing.price_per_week.toLocaleString()} TRY
                  </div>
                )}
                {listing.min_rental_days > 1 && (
                  <div className="text-sm text-orange-600 mt-1">
                    Minimum {listing.min_rental_days} gün
                  </div>
                )}
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-4">
                {/* Tarih Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alış Tarihi
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dönüş Tarihi
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {/* Minimum süre uyarısı */}
                {checkIn && checkOut && (
                  (() => {
                    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                    if (days < 2) {
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-sm">⚠️ Minimum kiralama süresi 2 gündür</p>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}

                {/* Lokasyon Seçimi */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alış Yeri
                    </label>
                    <select
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    >
                      <option value="">Alış yeri seçin</option>
                      {dropOffLocations.map(location => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dönüş Yeri
                    </label>
                    <select
                      required
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    >
                      <option value="">Dönüş yeri seçin</option>
                      {dropOffLocations.map(location => (
                        <option key={location.id} value={location.name}>
                          {location.name} {location.defaultFee > 0 && `(+${location.defaultFee} TRY)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ekstralar */}
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsExtrasOpen(!isExtrasOpen)}
                    className="w-full flex items-center justify-between py-2 text-left"
                  >
                    <h4 className="font-medium text-gray-900">Ekstra Hizmetler</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {Object.values(selectedExtras).filter(Boolean).length} seçili
                      </span>
                      {isExtrasOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {isExtrasOpen && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {carExtras.map(extra => (
                          <li key={extra.id} className="flex items-center space-x-3 py-2 px-3 bg-white rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                            <input
                              type="checkbox"
                              id={extra.id}
                              checked={selectedExtras[extra.id] || false}
                              onChange={(e) => setSelectedExtras(prev => ({
                                ...prev,
                                [extra.id]: e.target.checked
                              }))}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor={extra.id} className="flex-1 cursor-pointer">
                              <div className="text-sm font-medium text-gray-900">{extra.name}</div>
                              <div className="text-xs text-gray-500">{extra.price.toLocaleString()} TRY ({extra.unit})</div>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Sigorta Seçenekleri */}
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsInsuranceOpen(!isInsuranceOpen)}
                    className="w-full flex items-center justify-between py-2 text-left"
                  >
                    <h4 className="font-medium text-gray-900">Sigorta Seçenekleri</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {insuranceOptions.find(ins => ins.id === selectedInsurance)?.name}
                      </span>
                      {isInsuranceOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  {isInsuranceOpen && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {insuranceOptions.map(insurance => (
                          <div key={insurance.id} className="flex items-center space-x-3 py-2 px-3 bg-white rounded-md border border-gray-200 hover:border-blue-300 transition-colors">
                            <input
                              type="radio"
                              id={insurance.id}
                              name="insurance"
                              value={insurance.id}
                              checked={selectedInsurance === insurance.id}
                              onChange={(e) => setSelectedInsurance(e.target.value)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor={insurance.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{insurance.name}</div>
                                  <div className="text-xs text-gray-500">{insurance.description}</div>
                                </div>
                                <div className="text-sm font-medium text-gray-700">
                                  {insurance.price === 0 ? 'Ücretsiz' : `${insurance.price.toLocaleString()} TRY (${insurance.unit})`}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Drop-off ücreti */}
                {dropOffFee > 0 && (
                  <div className="border-t pt-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-yellow-800">
                          Farklı Lokasyon Teslim Ücreti
                        </span>
                        <span className="text-sm font-bold text-yellow-900">
                          {dropOffFee.toLocaleString()} TRY
                        </span>
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        {pickupLocation} → {dropoffLocation}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sürücü Bilgileri */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Sürücü Bilgileri</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Ad Soyad *"
                      required
                      value={driverInfo.fullName}
                      onChange={(e) => setDriverInfo(prev => ({...prev, fullName: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Doğum Tarihi *"
                      required
                      value={driverInfo.birthDate}
                      onChange={(e) => setDriverInfo(prev => ({...prev, birthDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon *"
                      required
                      value={driverInfo.phone}
                      onChange={(e) => setDriverInfo(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="E-posta *"
                      required
                      value={driverInfo.email}
                      onChange={(e) => setDriverInfo(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {/* Ödeme Seçenekleri */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Ödeme Yöntemi</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Nakit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">Banka Havalesi / EFT</span>
                    </label>
                  </div>
                </div>

                {/* Toplam */}
                {checkIn && checkOut && (
                  <div className="border-t pt-3">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Toplam Fiyat</span>
                        <span className="text-lg sm:text-xl font-bold text-blue-600">
                          {calculateTotal().toLocaleString()} TRY
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rezervasyon Butonu */}
                <button
                  onClick={handleReservation}
                  disabled={!checkIn || !checkOut || !pickupLocation || !dropoffLocation || !driverInfo.fullName || !driverInfo.phone}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Rezervasyon Yap
                </button>

                <div className="text-center text-xs sm:text-sm text-gray-500">
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