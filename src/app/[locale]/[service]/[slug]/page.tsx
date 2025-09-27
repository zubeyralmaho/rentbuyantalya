'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Users, Euro, Wifi, Car, Home, Anchor, Plane, Building2, Star } from 'lucide-react';
import { notFound } from 'next/navigation';

interface ListingData {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  features: string[];
  location: string;
  price_per_day: number;
  price_per_week: number;
  max_guests: number;
  min_rental_days: number;
  services: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  listings_i18n: [{
    title: string;
    description: string;
    features_text: string;
    location_details: string;
  }];
}

interface AvailabilityData {
  date: string;
  is_available: boolean;
  price: number;
  min_nights: number;
}

const iconMap = {
  car: Car,
  plane: Plane,
  anchor: Anchor,
  home: Home,
  building: Building2,
};

export default function ListingDetailPage({ 
  params 
}: { 
  params: Promise<{ service: string; slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  const [listing, setListing] = useState<ListingData | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [selectedTour, setSelectedTour] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentService, setCurrentService] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [transferLocation, setTransferLocation] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapSelectionFor, setMapSelectionFor] = useState<'pickup' | 'dropoff' | 'transfer' | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [mapInputValue, setMapInputValue] = useState('');
  
  // VIP Transfer Extra Fields
  const [luggageCount, setLuggageCount] = useState(0);
  const [childSeats, setChildSeats] = useState(0);
  const [specialWelcome, setSpecialWelcome] = useState<{flowers: boolean, champagne: boolean}>({flowers: false, champagne: false});
  
  // Car Rental Extra Fields
  const [selectedExtras, setSelectedExtras] = useState<{[key: string]: number}>({});
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
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [dropOffFee, setDropOffFee] = useState(0);

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        setCurrentService(resolvedParams.service);
        const response = await fetch(`/api/listings/${resolvedParams.service}/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        setListing(data.listing);
        setAvailability(data.availability || []);
      } catch (error) {
        console.error('Error fetching listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  // Drop-off fee hesaplama (pickup ve dropoff location değiştiğinde)
  useEffect(() => {
    if (currentService === 'car-rental' && pickupLocation && dropoffLocation) {
      const fee = calculateDropOffFee(pickupLocation, dropoffLocation);
      setDropOffFee(fee);
    }
  }, [pickupLocation, dropoffLocation, currentService]);

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

  const ServiceIcon = iconMap[listing.services.icon as keyof typeof iconMap] || Home;
  const i18nData = listing.listings_i18n?.[0];
  const title = i18nData?.title || listing.name;
  const description = i18nData?.description || listing.description;
  const featuresText = i18nData?.features_text || listing.features.join(', ');
  const locationDetails = i18nData?.location_details || listing.location;

  // Yaygın konumlar
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

  // Car Rental Extras
  const carExtras = [
    { id: 'km1000', name: '1000 km ek paket', price: 7000, type: 'once', unit: 'Bir kerelik' },
    { id: 'km2000', name: '2000 km ek paket', price: 10000, type: 'once', unit: 'Bir kerelik' },
    { id: 'phoneHolder', name: 'Telefon Tutacağı', price: 500, type: 'once', unit: 'Bir kerelik' },
    { id: 'babySeat', name: 'Bebek Koltuğu (0-6 ay)', price: 150, type: 'daily', unit: 'Günlük' },
    { id: 'childSeat', name: 'Çocuk koltuğu 1 yaş üstü', price: 200, type: 'daily', unit: 'Günlük' },
    { id: 'miniInsurance', name: 'Lastik-Cam-Far Sigortası (mini hasar)', price: 400, type: 'daily', unit: 'Günlük' },
    { id: 'simCard', name: 'Sim Kart', price: 2000, type: 'once', unit: 'Bir kerelik' },
    { id: 'fullKasko', name: 'Ful kasko', price: 600, type: 'daily', unit: 'Günlük' },
    { id: 'powerbank', name: 'Powerbank', price: 1000, type: 'once', unit: 'Bir kerelik' }
  ];

  // VIP Transfer Extras
  const transferExtras = [
    { id: 'flowers', name: 'Çiçek Karşılama', price: 1000, unit: 'Bir kerelik' },
    { id: 'champagne', name: 'Şampanya Karşılama', price: 2000, unit: 'Bir kerelik' }
  ];

  // Drop-off Locations
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

  // Availability kontrolü için helper function
  const isDateAvailable = (dateString: string): boolean => {
    const availabilityItem = availability.find(item => item.date === dateString);
    return availabilityItem ? availabilityItem.is_available : true; // Default olarak müsait kabul et
  };

  // Minimum gece sayısını al
  const getMinNights = (dateString: string): number => {
    const availabilityItem = availability.find(item => item.date === dateString);
    return availabilityItem?.min_nights || listing?.min_rental_days || 1;
  };

  // Tarih için özel fiyat varsa al
  const getPriceForDate = (dateString: string): number => {
    const availabilityItem = availability.find(item => item.date === dateString);
    return availabilityItem?.price || listing?.price_per_day || 0;
  };

  // Drop-off fee hesaplama fonksiyonu
  const calculateDropOffFee = (pickupLoc: string, dropoffLoc: string) => {
    // Eğer aynı yerse ücretsiz
    if (pickupLoc === dropoffLoc) return 0;
    
    // Eğer pickup veya dropoff merkez ofis ise ücretsiz
    if (pickupLoc === 'Merkez Ofis' || dropoffLoc === 'Merkez Ofis') return 0;
    
    // Dropoff location'ı bul ve ücretini al
    const dropoffLocationData = dropOffLocations.find(loc => 
      dropoffLoc.toLowerCase().includes(loc.name.toLowerCase()) ||
      loc.name.toLowerCase().includes(dropoffLoc.toLowerCase())
    );
    
    // Listing'den özel drop-off ücretleri varsa onları kullan (gelecekte admin'den gelecek)
    // Şimdilik default ücretleri kullan
    return dropoffLocationData?.defaultFee || 0;
  };

  const openMapSelector = (type: 'pickup' | 'dropoff' | 'transfer') => {
    setMapSelectionFor(type);
    setSelectedMapLocation(null);
    setMapInputValue('');
    setShowMapModal(true);
  };

  const confirmMapLocation = () => {
    if (selectedMapLocation && mapSelectionFor) {
      const address = selectedMapLocation.address;
      console.log('Confirming location:', address, 'for:', mapSelectionFor); // Debug log
      if (mapSelectionFor === 'pickup') {
        setPickupLocation(address);
      } else if (mapSelectionFor === 'dropoff') {
        setDropoffLocation(address);
      } else if (mapSelectionFor === 'transfer') {
        setTransferLocation(address);
      }
    }
    setShowMapModal(false);
    setSelectedMapLocation(null);
    setMapSelectionFor(null);
    setMapInputValue('');
  };

  const calculateTotal = () => {
    // Properties for sale için fiyat döndürme (satış fiyatı)
    if (currentService === 'properties-for-sale') {
      return listing?.price_per_day || 0;
    }
    
    // Tekne için özel fiyatlandırma
    if (currentService === 'boat-rental') {
      if (!selectedDate || !selectedTour) return 0;
      
      // Tur tipine göre fiyat hesaplama
      let multiplier = 1;
      if (selectedTour === 'morning' || selectedTour === 'evening') {
        multiplier = 0.6; // Yarım gün turu %60
      } else if (selectedTour === 'fullday') {
        multiplier = 1; // Tam gün normal fiyat
      }
      
      return Math.round(listing.price_per_day * multiplier);
    }
    
    // Diğer servisler için mevcut hesaplama
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    
    let basePrice = days >= 7 && listing.price_per_week 
      ? Math.floor(days / 7) * listing.price_per_week + (days % 7) * listing.price_per_day
      : days * listing.price_per_day;

    // Car rental extras hesaplama
    if (currentService === 'car-rental') {
      let extrasTotal = 0;
      Object.entries(selectedExtras).forEach(([extraId, quantity]) => {
        if (quantity > 0) {
          const extra = carExtras.find(e => e.id === extraId);
          if (extra) {
            if (extra.type === 'daily') {
              extrasTotal += extra.price * days * quantity;
            } else {
              extrasTotal += extra.price * quantity;
            }
          }
        }
      });
      basePrice += extrasTotal;
      
      // Drop-off fee ekle
      basePrice += dropOffFee;
    }

    // VIP Transfer extras hesaplama
    if (currentService === 'vip-transfer') {
      let extrasTotal = 0;
      if (specialWelcome.flowers) {
        const flowersExtra = transferExtras.find(e => e.id === 'flowers');
        if (flowersExtra) extrasTotal += flowersExtra.price;
      }
      if (specialWelcome.champagne) {
        const champagneExtra = transferExtras.find(e => e.id === 'champagne');
        if (champagneExtra) extrasTotal += champagneExtra.price;
      }
      basePrice += extrasTotal;
    }

    return basePrice;
  };

  const createGoogleMapsLink = (address: string) => {
    // Eğer adres koordinat içeriyorsa onları çıkar
    const coordMatch = address.match(/\(([0-9.-]+),\s*([0-9.-]+)\)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://maps.google.com/?q=${lat},${lng}`;
    }
    // Koordinat yoksa adres ismini kullan
    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  };

  const handleReservation = async () => {
    // Tekne için özel validasyon
    if (currentService === 'boat-rental') {
      if (!selectedDate || !selectedTour) {
        alert(t('selectDates'));
        return;
      }
      
      const total = calculateTotal();
      const tourNames = {
        morning: t('morningTour'),
        evening: t('eveningTour'),
        fullday: t('fullDayTour')
      };
      
      const message = `${t('reservationMessage', {
        title,
        checkIn: selectedDate,
        checkOut: tourNames[selectedTour as keyof typeof tourNames],
        guests,
        total
      })}`;
      
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '905071564700';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    // VIP Transfer için özel validasyon
    if (currentService === 'vip-transfer') {
      if (!checkIn || !checkOut || !transferLocation || !pickupLocation) {
        alert(t('selectPickupDropoffDates'));
        return;
      }
      
      const total = calculateTotal();
      const pickupMapsLink = createGoogleMapsLink(pickupLocation);
      const dropoffMapsLink = createGoogleMapsLink(transferLocation);
      
      let message = `${t('reservationMessage', {
        title,
        checkIn,
        checkOut,
        guests,
        total
      })}\n\n� Alış Yeri: ${pickupLocation}\n🗺️ Alış Harita: ${pickupMapsLink}\n\n🏁 Varış Yeri: ${transferLocation}\n🗺️ Varış Harita: ${dropoffMapsLink}`;

      // Bagaj sayısı ekle
      if (luggageCount > 0) {
        message += `\n\n🧳 Bagaj Sayısı: ${luggageCount} adet`;
      }

      // Çocuk koltuğu ekle
      if (childSeats > 0) {
        message += `\n👶 Çocuk Koltuğu: ${childSeats} adet (ücretsiz)`;
      }

      // Özel karşılama ekstalar
      const welcomeExtras = [];
      if (specialWelcome.flowers) welcomeExtras.push('🌸 Çiçek Karşılama');
      if (specialWelcome.champagne) welcomeExtras.push('🍾 Şampanya Karşılama');
      
      if (welcomeExtras.length > 0) {
        message += `\n\n🌟 Özel Karşılama:\n${welcomeExtras.map(extra => `- ${extra}`).join('\n')}`;
      }
      
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '905071564700';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    
    // Car Rental için özel validasyon
    if (currentService === 'car-rental') {
      if (!checkIn || !checkOut || !pickupLocation || !dropoffLocation) {
        alert(t('selectDates'));
        return;
      }
      
      const total = calculateTotal();
      const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
      
      if (days < listing.min_rental_days) {
        alert(t('minimumDays', { days: listing.min_rental_days }));
        return;
      }
      
      const pickupMapsLink = createGoogleMapsLink(pickupLocation);
      const dropoffMapsLink = createGoogleMapsLink(dropoffLocation);
      
      // Extras listesi oluştur
      const selectedExtrasText = Object.entries(selectedExtras)
        .filter(([_, quantity]) => quantity > 0)
        .map(([extraId, quantity]) => {
          const extra = carExtras.find(e => e.id === extraId);
          if (extra) {
            const extraPrice = extra.type === 'daily' 
              ? extra.price * days * quantity 
              : extra.price * quantity;
            return `- ${extra.name}: ${extraPrice.toLocaleString()} TRY (${extra.unit})`;
          }
          return '';
        })
        .join('\n');

      let message = `${t('reservationMessage', {
        title,
        checkIn,
        checkOut,
        guests,
        total
      })}\n\n🚗 Alış Yeri: ${pickupLocation}\n🗺️ Alış Harita: ${pickupMapsLink}\n\n🏁 Dönüş Yeri: ${dropoffLocation}\n🗺️ Dönüş Harita: ${dropoffMapsLink}`;

      // Extras varsa ekle
      if (selectedExtrasText) {
        message += `\n\n📋 Seçilen Ekstralar:\n${selectedExtrasText}`;
      }

      // Drop-off fee varsa ekle
      if (dropOffFee > 0) {
        message += `\n\n🚗 Farklı Lokasyon Teslim Ücreti: ${dropOffFee.toLocaleString()} TRY`;
        message += `\n(${pickupLocation} → ${dropoffLocation})`;
      }

      // Driver info ekle
      message += `\n\n👤 Sürücü Bilgileri:`;
      message += `\nAd Soyad: ${driverInfo.fullName}`;
      message += `\nDoğum Tarihi: ${driverInfo.birthDate}`;
      message += `\nTelefon: ${driverInfo.phone}`;
      message += `\nE-posta: ${driverInfo.email}`;
      
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
      return;
    }
    
    // Diğer servisler için mevcut validasyon
    if (!checkIn || !checkOut) {
      alert(t('selectDates'));
      return;
    }

    const total = calculateTotal();
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

    if (days < listing.min_rental_days) {
      alert(t('minimumDays', { days: listing.min_rental_days }));
      return;
    }

    // Rezervasyon formunu göster veya WhatsApp'a yönlendir
    const message = t('reservationMessage', {
      title,
      checkIn,
      checkOut,
      guests,
      total
    });

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP || '905071564700';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <ServiceIcon className="h-4 w-4" />
            <span>{listing.services.name}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{locationDetails}</span>
            {listing.max_guests && (
              <>
                <Users className="h-5 w-5 ml-6 mr-2" />
                <span>{listing.max_guests} {t('guests')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol taraf - Resimler ve Detaylar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resim Galerisi */}
            {listing.images && listing.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img
                    src={listing.images[selectedImages]}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {listing.images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {listing.images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImages(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 ${
                            selectedImages === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
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

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('description')}</h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Özellikler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('features')}</h2>
              <p className="text-gray-700">{featuresText}</p>
              
              {listing.features && listing.features.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="capitalize">{feature.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sağ taraf - Rezervasyon */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                {currentService === 'boat-rental' ? (
                  // Tekne için fiyat gösterimi
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.round(listing.price_per_day * 0.6)} TRY
                      </span>
                      <span className="text-gray-500">/ Yarım Gün</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Tam Gün: {listing.price_per_day} TRY
                    </div>
                    <div className="text-xs text-gray-500">
                      • Sabah turu: 5 saat (10:00-15:00)<br/>
                      • Akşam turu: 4 saat (16:00-20:00)<br/>
                      • Tam gün turu: 10 saat
                    </div>
                  </>
                ) : currentService === 'properties-for-sale' ? (
                  // Emlak satış için fiyat gösterimi
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {listing.price_per_day?.toLocaleString()} TRY
                      </span>
                      <span className="text-gray-500">Satış Fiyatı</span>
                    </div>
                    {listing.price_per_week && (
                      <div className="text-sm text-gray-600">
                        m² Fiyatı: {Math.round(listing.price_per_day / (listing.price_per_week || 100))?.toLocaleString()} TRY
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      • Fiyat görüşmeye açıktır<br/>
                      • Krediye uygun<br/>
                      • Tapu devir masrafları alıcıya aittir
                    </div>
                  </>
                ) : (
                  // Diğer servisler için normal fiyat gösterimi  
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {listing.price_per_day} TRY
                      </span>
                      <span className="text-gray-500">{t('perDay')}</span>
                    </div>
                    {listing.price_per_week && (
                      <div className="text-sm text-gray-600">
                        {t('weekly')}: {listing.price_per_week} TRY
                      </div>
                    )}
                    {listing.min_rental_days > 1 && (
                      <div className="text-sm text-orange-600 mt-1">
                        {t('minimumDays', { days: listing.min_rental_days })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Rezervasyon Formu */}
              <div className="space-y-3">
                {currentService === 'boat-rental' ? (
                  // Tekne için özel form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tourDate')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
                          selectedDate && !isDateAvailable(selectedDate) 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                      {selectedDate && !isDateAvailable(selectedDate) && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Bu tarih müsait değil
                        </p>
                      )}
                      {selectedDate && isDateAvailable(selectedDate) && (
                        <p className="text-sm text-green-600 mt-1">
                          ✅ Bu tarih müsait
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('selectTour')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedTour}
                        onChange={(e) => setSelectedTour(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">{t('selectTour')}</option>
                        <option value="morning">{t('morningTour')}</option>
                        <option value="evening">{t('eveningTour')}</option>
                        <option value="fullday">{t('fullDayTour')}</option>
                      </select>
                    </div>
                  </>
                ) : currentService === 'properties-for-sale' ? (
                  // Properties for Sale için özel form
                  <>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">🏠 Emlak Satış Detayları</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <div className="flex justify-between">
                            <span>Tip:</span>
                            <span>{listing.features?.[0] || 'Daire'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Konum:</span>
                            <span>{listing.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fiyat:</span>
                            <span className="font-semibold">{listing.price_per_day?.toLocaleString()} TRY</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Bu emlak hakkında detaylı bilgi almak ve görüntüleme randevusu ayarlamak için iletişime geçin.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  // Diğer servisler için form
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkIn')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{
                            colorScheme: 'light'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkOut')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={(() => {
                            if (!checkIn) return new Date().toISOString().split('T')[0];
                            const minDate = new Date(checkIn);
                            // Car rental için minimum 2 gün
                            if (currentService === 'car-rental') {
                              minDate.setDate(minDate.getDate() + 2);
                            } else {
                              minDate.setDate(minDate.getDate() + 1);
                            }
                            return minDate.toISOString().split('T')[0];
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{
                            colorScheme: 'light'
                          }}
                        />
                      </div>
                    </div>

                    {/* Car Rental için minimum süre uyarısı */}
                    {currentService === 'car-rental' && checkIn && checkOut && (
                      (() => {
                        const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                        if (days < 2) {
                          return (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                              <p className="text-sm text-red-700">
                                ⚠️ {t('minimumRentalDays')}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}

                    {/* VIP Transfer için konum seçimleri */}
                    {currentService === 'vip-transfer' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('pickupLocationVip')} <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <select
                                required
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              >
                                <option value="">{t('selectPickupLocation')}</option>
                                {/* Seçilen konum listede yoksa onu da ekle */}
                                {pickupLocation && !commonLocations.includes(pickupLocation) && (
                                  <option value={pickupLocation}>{pickupLocation}</option>
                                )}
                                {commonLocations.map(location => (
                                  <option key={location} value={location}>{location}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openMapSelector('pickup')}
                                className="w-full px-3 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              >
                                📍 {t('selectFromMapPickup')}
                              </button>
                              {/* Seçilen konum varsa göster */}
                              {pickupLocation && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                  <p className="text-sm text-green-800">
                                    ✅ {t('pickupLabel')} {pickupLocation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('dropoffLocationVip')} <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <select
                                required
                                value={transferLocation}
                                onChange={(e) => setTransferLocation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              >
                                <option value="">{t('selectDropoffLocation')}</option>
                                {/* Seçilen konum listede yoksa onu da ekle */}
                                {transferLocation && !commonLocations.includes(transferLocation) && (
                                  <option value={transferLocation}>{transferLocation}</option>
                                )}
                                {commonLocations.map(location => (
                                  <option key={location} value={location}>{location}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openMapSelector('transfer')}
                                className="w-full px-3 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              >
                                📍 {t('selectFromMapDropoff')}
                              </button>
                              {/* Seçilen konum varsa göster */}
                              {transferLocation && (
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                  <p className="text-sm text-green-800">
                                    ✅ {t('dropoffLabel')} {transferLocation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* VIP Transfer Ekstra Alanlar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              🧳 {t('luggageCount')}
                            </label>
                            <select
                              value={luggageCount}
                              onChange={(e) => setLuggageCount(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            >
                              <option value={0}>{t('noLuggage')}</option>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{t('luggageItems', { count: num })}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              👶 {t('childSeats')}
                            </label>
                            <select
                              value={childSeats}
                              onChange={(e) => setChildSeats(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            >
                              <option value={0}>{t('noChildSeats')}</option>
                              {Array.from({ length: 4 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{t('childSeatItems', { count: num })}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Özel Karşılama Ekstalar */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">🌟 {t('specialWelcome')}</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id="flowers"
                                  checked={specialWelcome.flowers}
                                  onChange={(e) => setSpecialWelcome(prev => ({...prev, flowers: e.target.checked}))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="flowers" className="text-sm font-medium text-gray-700">
                                  🌸 {t('flowerWelcome')}
                                </label>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">1.000 TRY</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id="champagne"
                                  checked={specialWelcome.champagne}
                                  onChange={(e) => setSpecialWelcome(prev => ({...prev, champagne: e.target.checked}))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="champagne" className="text-sm font-medium text-gray-700">
                                  🍾 {t('champagneWelcome')}
                                </label>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">2.000 TRY</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Car Rental için alış-dönüş yeri seçimi */}
                    {currentService === 'car-rental' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('pickupLocation')} <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            <select
                              required
                              value={pickupLocation}
                              onChange={(e) => setPickupLocation(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            >
                              <option value="">{t('selectLocation')}</option>
                              {/* Seçilen konum listede yoksa onu da ekle */}
                              {pickupLocation && !commonLocations.includes(pickupLocation) && (
                                <option value={pickupLocation}>{pickupLocation}</option>
                              )}
                              {commonLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openMapSelector('pickup')}
                              className="w-full px-3 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              📍 {t('selectFromMap')}
                            </button>
                            {/* Seçilen konum varsa göster */}
                            {pickupLocation && (
                              <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                  ✅ <strong>Alış yeri:</strong> {pickupLocation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('dropoffLocation')} <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            <select
                              required
                              value={dropoffLocation}
                              onChange={(e) => setDropoffLocation(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            >
                              <option value="">{t('selectLocation')}</option>
                              {/* Seçilen konum listede yoksa onu da ekle */}
                              {dropoffLocation && !commonLocations.includes(dropoffLocation) && (
                                <option value={dropoffLocation}>{dropoffLocation}</option>
                              )}
                              {commonLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openMapSelector('dropoff')}
                              className="w-full px-3 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              📍 {t('selectFromMap')}
                            </button>
                            {/* Seçilen konum varsa göster */}
                            {dropoffLocation && (
                              <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                  ✅ <strong>Bırakış yeri:</strong> {dropoffLocation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Misafir sayısı sadece gerekli servislerde göster */}
                {currentService !== 'car-rental' && currentService !== 'properties-for-sale' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('guestCount')}
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      {Array.from({ 
                        length: Math.min(listing.max_guests || 10, 20) 
                      }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} {t('guests')}</option>
                      ))}
                    </select>
                    {listing.max_guests && (
                      <p className="text-xs text-gray-500 mt-1">
                        Maksimum {listing.max_guests} kişi
                      </p>
                    )}
                  </div>
                )}

                {/* Car Rental Extras ve Driver Info */}
                {currentService === 'car-rental' && (
                  <>
                    {/* Rezervasyon Ekstralari */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('carRentalExtras')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {carExtras.map(extra => (
                          <div key={extra.id} className="p-3 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                            <div className="flex items-start space-x-2">
                              <input
                                type="checkbox"
                                id={extra.id}
                                checked={selectedExtras[extra.id] > 0}
                                onChange={(e) => {
                                  setSelectedExtras(prev => ({
                                    ...prev,
                                    [extra.id]: e.target.checked ? 1 : 0
                                  }));
                                }}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <label htmlFor={extra.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {extra.name}
                                </label>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-sm font-semibold text-blue-600">
                                    {extra.price.toLocaleString()} TRY
                                  </span>
                                  <span className="text-xs text-gray-500">{extra.unit}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Drop-off Ücreti */}
                    {dropOffFee > 0 && (
                      <div className="border-t pt-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800">
                                🚗 {t('differentLocationFee')}
                              </h4>
                              <p className="text-xs text-yellow-700 mt-1">
                                {pickupLocation} → {dropoffLocation}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-yellow-800">
                                {dropOffFee.toLocaleString()} TRY
                              </span>
                              <div className="text-xs text-yellow-600">{t('oneTime')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sürücü Bilgileri */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('driverInfo')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('fullName')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={driverInfo.fullName}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder={t('fullNamePlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('birthDate')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            max={(() => {
                              const today = new Date();
                              today.setFullYear(today.getFullYear() - 18);
                              return today.toISOString().split('T')[0];
                            })()}
                            value={driverInfo.birthDate}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('phone')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            pattern="[0-9\s\+\-\(\)]+"
                            value={driverInfo.phone}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder={t('phonePlaceholderFormat')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('email')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={driverInfo.email}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, email: e.target.value }))}
                            placeholder={t('emailPlaceholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('flightNotes')}
                          </label>
                          <textarea
                            value={driverInfo.flightNotes}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, flightNotes: e.target.value }))}
                            placeholder={t('flightNotesPlaceholder')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('specialNotes')}
                          </label>
                          <textarea
                            value={driverInfo.specialNotes}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, specialNotes: e.target.value }))}
                            placeholder={t('specialNotesPlaceholder')}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          />
                        </div>

                        {/* Üyelik seçeneği */}
                        <div className="md:col-span-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="createAccount"
                            checked={driverInfo.createAccount}
                            onChange={(e) => setDriverInfo(prev => ({ ...prev, createAccount: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="createAccount" className="text-sm text-gray-700">
                            {t('createAccount')}
                          </label>
                        </div>

                        {/* Şifre alanları (sadece üye olmak istiyorsa) */}
                        {driverInfo.createAccount && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('password')} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="password"
                                required={driverInfo.createAccount}
                                minLength={6}
                                value={driverInfo.password}
                                onChange={(e) => setDriverInfo(prev => ({ ...prev, password: e.target.value }))}
                                placeholder={t('passwordMinLength')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('confirmPassword')} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="password"
                                required={driverInfo.createAccount}
                                value={driverInfo.confirmPassword}
                                onChange={(e) => setDriverInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder={t('confirmPasswordPlaceholder')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ödeme Seçenekleri */}
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('paymentOptions')}</h3>
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="cash"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="cash" className="text-sm font-medium text-gray-700">
                            {t('cash')}
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="transfer"
                            name="payment"
                            value="transfer"
                            checked={paymentMethod === 'transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="transfer" className="text-sm font-medium text-gray-700">
                            {t('bankTransfer')}
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {((currentService === 'boat-rental' && selectedDate && selectedTour) || 
                  (currentService !== 'boat-rental' && currentService !== 'properties-for-sale' && checkIn && checkOut) ||
                  (currentService === 'properties-for-sale')) && (
                  <div className="border-t pt-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {currentService === 'properties-for-sale' ? 'Fiyat Bilgisi' : t('priceBreakdown')}
                    </h3>
                    
                    {currentService === 'properties-for-sale' ? (
                      <>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Satış Fiyatı</span>
                          <span className="font-semibold">{calculateTotal().toLocaleString()} TRY</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          • Pazarlık yapılabilir<br/>
                          • Peşin ödeme indirim fırsatı<br/>
                          • Kredi imkanı mevcuttur
                        </div>
                      </>
                    ) : currentService === 'boat-rental' ? (
                      <>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{selectedTour && t(selectedTour === 'morning' ? 'morningTour' : selectedTour === 'evening' ? 'eveningTour' : 'fullDayTour')}</span>
                          <span>{listing.price_per_day * guests} TRY</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 text-lg border-t pt-2">
                          <span>{t('total')}</span>
                          <span>{calculateTotal()} TRY</span>
                        </div>
                      </>
                    ) : currentService === 'car-rental' ? (
                      <>
                        {/* Ana kiralama fiyatı */}
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {t('carRental')} ({Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} {t('days')})
                          </span>
                          <span>{listing.price_per_day * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} TRY</span>
                        </div>
                        
                        {/* Seçili ekstralar */}
                        {Object.entries(selectedExtras).some(([_, quantity]) => quantity > 0) && (
                          <>
                            {Object.entries(selectedExtras).map(([extraId, quantity]) => {
                              if (quantity === 0) return null;
                              const extra = carExtras.find(e => e.id === extraId);
                              if (!extra) return null;
                              const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                              const totalPrice = extra.type === 'daily' ? extra.price * days * quantity : extra.price * quantity;
                              return (
                                <div key={extraId} className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>{extra.name} {extra.type === 'daily' ? `(${days} ${t('days')})` : ''}</span>
                                  <span>{totalPrice.toLocaleString()} TRY</span>
                                </div>
                              );
                            })}
                          </>
                        )}
                        
                        {/* Drop-off ücreti */}
                        {dropOffFee > 0 && (
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{t('differentLocationFee')}</span>
                            <span>{dropOffFee.toLocaleString()} TRY</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-semibold text-gray-900 text-lg border-t pt-2">
                          <span>{t('total')}</span>
                          <span>{calculateTotal()} TRY</span>
                        </div>
                      </>
                    ) : currentService === 'vip-transfer' ? (
                      <>
                        {/* Ana transfer fiyatı */}
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{t('vipTransferService')}</span>
                          <span>{listing.price_per_day} TRY</span>
                        </div>
                        
                        {/* Özel karşılama ekstalar */}
                        {(specialWelcome.flowers || specialWelcome.champagne) && (
                          <>
                            {specialWelcome.flowers && (
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>🌸 {t('flowerWelcome')}</span>
                                <span>1.000 TRY</span>
                              </div>
                            )}
                            {specialWelcome.champagne && (
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>🍾 {t('champagneWelcome')}</span>
                                <span>2.000 TRY</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Ücretsiz hizmetler bilgisi */}
                        {(luggageCount > 0 || childSeats > 0) && (
                          <div className="text-xs text-green-600 mb-2 p-2 bg-green-50 rounded">
                            ✅ {t('freeIncluded')}<br/>
                            {luggageCount > 0 && `• ${luggageCount} ${t('luggageTransport')}`}<br/>
                            {childSeats > 0 && `• ${childSeats} ${t('childSeat')}`}
                          </div>
                        )}
                        
                        <div className="flex justify-between font-semibold text-gray-900 text-lg border-t pt-2">
                          <span>{t('total')}</span>
                          <span>{calculateTotal()} TRY</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>
                            {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} {t('days')}
                          </span>
                          <span>{listing.price_per_day * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) * guests} TRY</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 text-lg border-t pt-2">
                          <span>{t('total')}</span>
                          <span>{calculateTotal()} TRY</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={handleReservation}
                  disabled={(() => {
                    if (currentService === 'boat-rental') {
                      return !selectedDate || !selectedTour;
                    }
                    if (currentService === 'vip-transfer') {
                      return !checkIn || !checkOut || !transferLocation || !pickupLocation;
                    }
                    if (currentService === 'car-rental') {
                      const hasRequiredFields = checkIn && checkOut && pickupLocation && dropoffLocation;
                      if (!hasRequiredFields) return true;
                      const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                      return days < 2;
                    }
                    if (currentService === 'properties-for-sale') {
                      return false; // Properties for sale için hiçbir validation yok, direkt iletişim
                    }
                    return !checkIn || !checkOut;
                  })()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t('makeReservation')}
                </button>

                <div className="text-center text-sm text-gray-500">
                  {t('whatsappInfo')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harita Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header - Sabit */}
            <div className="flex justify-between items-center p-6 pb-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('mapSelect')}
              </h3>
              <button
                onClick={() => {
                  setShowMapModal(false);
                  setSelectedMapLocation(null);
                  setMapSelectionFor(null);
                  setMapInputValue('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Adres girme alanı */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('enterLocationAddress')}
                </label>
                <input
                  type="text"
                  value={mapInputValue}
                  placeholder={t('locationExample')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  onChange={(e) => {
                    const address = e.target.value;
                    setMapInputValue(address);
                    if (address.trim()) {
                      setSelectedMapLocation({
                        lat: 36.8969,
                        lng: 30.7133,
                        address: address.trim()
                      });
                    } else {
                      setSelectedMapLocation(null);
                    }
                  }}
                />
              </div>

              <div className="mb-4">
                <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=Antalya,Turkey&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  ></iframe>
                  
                  {/* Harita üzerine tıklama için overlay */}
                  <div 
                    className="absolute inset-0 cursor-crosshair"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      // Antalya bölgesi için koordinat hesaplama
                      const lat = 36.9 - (y / rect.height) * 0.2; // 36.8 - 37.0 arası
                      const lng = 30.6 + (x / rect.width) * 0.3; // 30.6 - 30.9 arası
                      
                      // Basit adres oluşturma (gerçek uygulamada reverse geocoding kullanılır)
                      const neighborhoods = ['Lara', 'Konyaaltı', 'Muratpaşa', 'Kepez', 'Aksu', 'Döşemealtı'];
                      const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
                      const address = `${randomNeighborhood}, Antalya (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                      
                      setSelectedMapLocation({ lat, lng, address });
                      setMapInputValue(address);
                    }}
                  >
                    {/* Seçilen konum işareti */}
                    {selectedMapLocation && (
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="bg-red-500 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="mt-1 bg-white px-2 py-1 rounded shadow-lg text-xs text-black whitespace-nowrap max-w-48 truncate">
                          {selectedMapLocation.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📍 Haritaya tıklayarak konum seçin, yukarıdaki kutucuğa yazın veya aşağıdan hızlı seçim yapın
                </p>
              </div>

              {/* Hızlı konum seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veya hızlı seçim yapın:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonLocations.map(location => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => {
                        setMapInputValue(location);
                        setSelectedMapLocation({
                          lat: 36.8969,
                          lng: 30.7133,
                          address: location
                        });
                      }}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seçilen konum bilgisi */}
              {selectedMapLocation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{t('selectedLocation')}:</strong> {selectedMapLocation.address}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer - Sabit */}
            <div className="p-6 pt-4 border-t">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    setSelectedMapLocation(null);
                    setMapSelectionFor(null);
                    setMapInputValue('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {t('closeMap')}
                </button>
                <button
                  onClick={confirmMapLocation}
                  disabled={!selectedMapLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {t('confirmLocation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}