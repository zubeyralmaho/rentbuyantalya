'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { MapPin, Home, Maximize, Bed, Bath, Car, Phone, Calculator, CreditCard, FileText } from 'lucide-react';

interface PropertyListingData {
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
    propertyType: string;
    rooms: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    plot_area?: number;
    floor: number;
    totalFloors: number;
    buildYear: number;
    condition: string;
    heating: string;
    balcony: boolean;
    garden: boolean;
    pool: boolean;
    parking: boolean;
    elevator: boolean;
    price_per_sqm: number;
    deed_status: string;
    credit_eligible: boolean;
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

const creditCalculatorRates = [
  { bank: 'Ziraat Bankası', rate: 45, term: 240 },
  { bank: 'Vakıfbank', rate: 44, term: 240 },
  { bank: 'Halkbank', rate: 46, term: 240 },
  { bank: 'İş Bankası', rate: 43, term: 240 },
  { bank: 'Garanti BBVA', rate: 42, term: 240 }
];

export default function PropertiesSaleDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale: string }> 
}) {
  const t = useTranslations('listing');
  const commonT = useTranslations('common');
  
  const [listing, setListing] = useState<PropertyListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState(0);
  const [downPayment, setDownPayment] = useState(30);
  const [loanTerm, setLoanTerm] = useState(120);
  const [selectedBank, setSelectedBank] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    const fetchListingData = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/listings/properties-for-sale/${resolvedParams.slug}?locale=${resolvedParams.locale}`);
        
        if (!response.ok) {
          notFound();
          return;
        }

        const data = await response.json();
        console.log('Property listing data:', data); // Debug
        setListing(data.listing);
      } catch (error) {
        console.error('Error fetching property listing:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [params]);

  const calculateMonthlyPayment = () => {
    if (!listing?.price_per_day) return 0;
    
    const totalPrice = listing.price_per_day;
    const loanAmount = totalPrice * (100 - downPayment) / 100;
    const selectedBankData = creditCalculatorRates[selectedBank];
    const monthlyRate = selectedBankData.rate / 100 / 12;
    const termMonths = Math.min(loanTerm, selectedBankData.term);
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return monthlyPayment;
  };

  const handleContactRequest = () => {
    if (!customerName || !customerPhone) {
      alert('Lütfen ad soyad ve telefon bilgilerini doldurun');
      return;
    }
    
    const title = listing?.listings_i18n?.[0]?.title || listing?.name || '';
    const totalPrice = listing?.price_per_day || 0;
    const pricePerSqm = listing?.metadata?.price_per_sqm || 0;
    
    let message = `🏠 Emlak Satış Talebi

🏢 Emlak: ${title}
📍 Konum: ${listing?.location}
💰 Fiyat: ${totalPrice.toLocaleString()} TRY`;

    if (pricePerSqm > 0) {
      message += `\n📐 m² Fiyat: ${pricePerSqm.toLocaleString()} TRY/m²`;
    }

    // Emlak özellikleri
    if (listing?.metadata) {
      message += `\n\n🏠 Emlak Detayları:`;
      if (listing.metadata.propertyType) message += `\n🏗️ Tip: ${listing.metadata.propertyType}`;
      if (listing.metadata.rooms) message += `\n🏠 Oda: ${listing.metadata.rooms}`;
      if (listing.metadata.area) message += `\n📐 İç alan: ${listing.metadata.area}m²`;
      if (listing.metadata.plot_area) message += `\n🌿 Arsa: ${listing.metadata.plot_area}m²`;
      if (listing.metadata.buildYear) message += `\n📅 Yapım: ${listing.metadata.buildYear}`;
      if (listing.metadata.deed_status) message += `\n📜 Tapu: ${listing.metadata.deed_status}`;
    }

    // Kredi hesaplama
    if (listing?.metadata?.credit_eligible) {
      const monthlyPayment = calculateMonthlyPayment();
      const downPaymentAmount = totalPrice * downPayment / 100;
      const selectedBankData = creditCalculatorRates[selectedBank];
      
      message += `\n\n💳 Kredi Hesaplama:`;
      message += `\n🏦 Banka: ${selectedBankData.bank}`;
      message += `\n💰 Peşinat: ${downPaymentAmount.toLocaleString()} TRY (%${downPayment})`;
      message += `\n📅 Vade: ${loanTerm} ay`;
      message += `\n💵 Aylık: ${monthlyPayment.toLocaleString()} TRY`;
    }

    // İletişim bilgileri
    message += `\n\n👤 İletişim:`;
    message += `\n📛 Ad Soyad: ${customerName}`;
    message += `\n📞 Telefon: ${customerPhone}`;
    if (customerEmail) message += `\n📧 E-posta: ${customerEmail}`;

    // Randevu bilgileri
    if (appointmentDate && appointmentTime) {
      message += `\n\n📅 Randevu Talebi:`;
      message += `\n📅 Tarih: ${appointmentDate}`;
      message += `\n🕐 Saat: ${appointmentTime}`;
    }

    // Özel istekler
    if (specialRequests) {
      message += `\n\n📝 Özel İstekler:\n${specialRequests}`;
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
            <Home className="h-4 w-4" />
            <span>Satılık Emlak</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center text-gray-600 space-x-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{listing.location}</span>
            </div>
            {listing.metadata?.propertyType && (
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                <span>{listing.metadata.propertyType}</span>
              </div>
            )}
            {listing.metadata?.rooms && (
              <div className="flex items-center">
                <Bed className="h-5 w-5 mr-2" />
                <span>{listing.metadata.rooms}</span>
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

            {/* Emlak Özellikleri */}
            {listing.metadata && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Emlak Özellikleri</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {listing.metadata.area && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Maximize className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm text-gray-600">İç Alan</div>
                      <div className="font-medium">{listing.metadata.area}m²</div>
                    </div>
                  )}
                  {listing.metadata.plot_area && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <span className="text-2xl mb-2 block">🌿</span>
                      <div className="text-sm text-gray-600">Arsa</div>
                      <div className="font-medium">{listing.metadata.plot_area}m²</div>
                    </div>
                  )}
                  {listing.metadata.bedrooms && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Bed className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm text-gray-600">Yatak Odası</div>
                      <div className="font-medium">{listing.metadata.bedrooms}</div>
                    </div>
                  )}
                  {listing.metadata.bathrooms && (
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <Bath className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
                      <div className="text-sm text-gray-600">Banyo</div>
                      <div className="font-medium">{listing.metadata.bathrooms}</div>
                    </div>
                  )}
                </div>

                {/* Fiyat Bilgileri */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">💰 Fiyat Detayları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {(listing.price_per_day || 0).toLocaleString()} TRY
                      </div>
                      <div className="text-sm text-green-600">Toplam Fiyat</div>
                    </div>
                    {listing.metadata.price_per_sqm && (
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {listing.metadata.price_per_sqm.toLocaleString()} TRY
                        </div>
                        <div className="text-sm text-blue-600">m² Fiyat</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Teknik Detaylar */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {listing.metadata.buildYear && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl mb-2 block">📅</span>
                      <div className="text-sm text-gray-600">Yapım Yılı</div>
                      <div className="font-medium">{listing.metadata.buildYear}</div>
                    </div>
                  )}
                  {listing.metadata.floor && listing.metadata.totalFloors && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl mb-2 block">🏢</span>
                      <div className="text-sm text-gray-600">Kat</div>
                      <div className="font-medium">{listing.metadata.floor}/{listing.metadata.totalFloors}</div>
                    </div>
                  )}
                  {listing.metadata.condition && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl mb-2 block">⭐</span>
                      <div className="text-sm text-gray-600">Durum</div>
                      <div className="font-medium">{listing.metadata.condition}</div>
                    </div>
                  )}
                </div>

                {/* Emlak İmkanları */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">🏠 Emlak İmkanları</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.metadata.pool && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 mr-2">🏊</span>
                        <span className="text-sm font-medium text-blue-900">Havuz</span>
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
                        <Car className="h-5 w-5 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Otopark</span>
                      </div>
                    )}
                    {listing.metadata.elevator && (
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 mr-2">🛗</span>
                        <span className="text-sm font-medium text-purple-900">Asansör</span>
                      </div>
                    )}
                    {listing.metadata.balcony && (
                      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-600 mr-2">🏡</span>
                        <span className="text-sm font-medium text-yellow-900">Balkon</span>
                      </div>
                    )}
                    {listing.metadata.sea_view && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 mr-2">🌊</span>
                        <span className="text-sm font-medium text-blue-900">Deniz Manzarası</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tapu ve Kredi Durumu */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.metadata.deed_status && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-900">Tapu Durumu</span>
                      </div>
                      <div className="text-sm text-yellow-800">{listing.metadata.deed_status}</div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Kredi Uygunluğu</span>
                    </div>
                    <div className="text-sm text-green-800">
                      {listing.metadata.credit_eligible ? 'Kredi ile satın alınabilir' : 'Peşin satış'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Açıklama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emlak Hakkında</h2>
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

            {/* Kredi Hesaplama */}
            {listing.metadata?.credit_eligible && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  <Calculator className="h-5 w-5 inline mr-2" />
                  Kredi Hesaplama
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peşinat Oranı (%)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="80"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">%{downPayment}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kredi Vadesi (Ay)
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="240"
                      step="12"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">{loanTerm} ay</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banka Seçimi
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {creditCalculatorRates.map((bank, index) => (
                        <option key={index} value={index}>
                          {bank.bank} (%{bank.rate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Kredi Hesabı Sonucu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-blue-600">Peşinat Tutarı</div>
                      <div className="text-xl font-bold text-blue-900">
                        {((listing.price_per_day || 0) * downPayment / 100).toLocaleString()} TRY
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Kredi Tutarı</div>
                      <div className="text-xl font-bold text-blue-900">
                        {((listing.price_per_day || 0) * (100 - downPayment) / 100).toLocaleString()} TRY
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Aylık Ödeme</div>
                      <div className="text-xl font-bold text-blue-900">
                        {calculateMonthlyPayment().toLocaleString()} TRY
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sağ taraf - İletişim */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {(listing.price_per_day || 0).toLocaleString()} TRY
                  </div>
                  {listing.metadata?.price_per_sqm && (
                    <div className="text-sm text-gray-600">
                      {listing.metadata.price_per_sqm.toLocaleString()} TRY/m²
                    </div>
                  )}
                </div>
              </div>

              {/* İletişim Formu */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  <Phone className="h-5 w-5 inline mr-2" />
                  İletişim Bilgileri
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Adınızı ve soyadınızı girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="0555 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Randevu Tarihi
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Randevu Saati
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Saat seçin</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Özel İstekler / Notlar
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Kredi durumu, özel istekler vs."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <button
                  onClick={handleContactRequest}
                  disabled={!customerName || !customerPhone}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  İletişim Talebi Gönder
                </button>

                <div className="text-center text-sm text-gray-500">
                  WhatsApp üzerinden iletişim kurulacaktır
                </div>

                {/* Hızlı İletişim */}
                <div className="border-t pt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📞 Hızlı Arama</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Anında bilgi almak için doğrudan arayın
                    </p>
                    <a
                      href="tel:+905071564700"
                      className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                      📞 Hemen Ara
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}