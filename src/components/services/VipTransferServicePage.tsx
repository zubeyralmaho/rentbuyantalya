"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ServiceFAQ from '@/components/ServiceFAQ';

interface Vehicle {
  id: string;
  name: string;
  slug?: string;
  type: 'economy' | 'comfort' | 'business' | 'luxury' | 'vip' | 'minibus';
  capacity: number;
  pricePerKm: number;
  basePrice: number;
  features: string[];
  available: boolean;
  image?: string;
}



interface VipTransferPageProps {
  locale: string;
  vehicles?: Vehicle[];
}

export default function VipTransferServicePage({ locale, vehicles = [] }: VipTransferPageProps) {
  const t = useTranslations('services.vipTransfer');
  const tCommon = useTranslations('common');
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API'den VIP Transfer ilanlarını çek
  React.useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/listings/vip-transfer?locale=${locale}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.listings) {
            setListings(result.data.listings);
          }
        } else {
          console.error('Failed to fetch VIP Transfer listings');
        }
      } catch (error) {
        console.error('Error fetching VIP Transfer listings:', error);
        setError('İlanlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [locale]);

  // API'den gelen verileri vehicles prop ile birleştir
  const displayVehicles = listings.length > 0 ? listings.map((listing: any) => ({
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    type: 'vip' as const,
    capacity: listing.features?.find((f: string) => f.includes('Person'))?.match(/\d+/)?.[0] || 4,
    pricePerKm: listing.price_range_min || 0,
    basePrice: listing.price_range_min || 0,
    features: listing.features || [],
    available: true,
    image: listing.images?.[0]
  })) : vehicles;

  const getVehicleTypeIcon = (type: string) => {
    switch(type) {
      case 'economy': return '🚗';
      case 'comfort': return '🚙';
      case 'business': return '🚘';
      case 'luxury': return '🏎️';
      case 'vip': return '✨';
      case 'minibus': return '🚐';
      default: return '🚗';
    }
  };

  const getVehicleTypeName = (type: string) => {
    switch(type) {
      case 'economy': return 'Ekonomi';
      case 'comfort': return 'Konfor';
      case 'business': return 'Business';
      case 'luxury': return 'Lüks';
      case 'vip': return 'VIP';
      case 'minibus': return 'Minibüs';
      default: return 'Araç';
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString()}`;
  };



  return (
    <div className="space-y-12">
      {/* Service Description */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--dark-text)'}}>
          {t('title')}
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{color: 'var(--dark-text-muted)'}}>
          {t('description')}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">İlanlar yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Vehicles Grid */}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayVehicles.length > 0 ? displayVehicles.map((vehicle) => (
          <div 
            key={vehicle.id}
            className="service-card p-6 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => window.location.href = `/${locale}/vip-transfer/${vehicle.slug}`}
          >
            {vehicle.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{getVehicleTypeIcon(vehicle.type)}</div>
              <div>
                <span className="text-xs px-2 py-1 rounded-full" 
                      style={{
                        backgroundColor: 'var(--accent-500)', 
                        color: 'white'
                      }}>
                  {getVehicleTypeName(vehicle.type)}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
              {vehicle.name}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Kapasite:</span> {vehicle.capacity} kişi
              </div>
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Temel Ücret:</span> {formatPrice(vehicle.basePrice)}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-lg font-bold mb-2" style={{color: 'var(--accent-500)'}}>
                {formatPrice(vehicle.pricePerKm)} <span className="text-sm font-normal">/ km</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {vehicle.features.slice(0, 3).map((feature: string, index: number) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--dark-bg-secondary)', 
                      color: 'var(--dark-text-muted)',
                      border: '1px solid var(--dark-border)'
                    }}
                  >
                    {feature}
                  </span>
                ))}
                {vehicle.features.length > 3 && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--dark-bg-secondary)', 
                      color: 'var(--dark-text-muted)',
                      border: '1px solid var(--dark-border)'
                    }}
                  >
                    +{vehicle.features.length - 3} özellik
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {vehicle.available ? (
                <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {tCommon('available')}
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                  {tCommon('notAvailable')}
                </span>
              )}
              
              <div className="space-x-2">
                <a 
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: vehicle.name })}`}
                  className="btn-primary text-sm px-3 py-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tCommon('makeReservation')}
                </a>
              </div>
            </div>
          </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Şu anda müsait araç bulunmamaktadır.</p>
            </div>
          )}
        </div>
      )}



      {/* Service Features */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-6 text-center text-white">
          Transfer Hizmeti Özellikleri
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="text-white">
            <div className="text-2xl mb-2">⏰</div>
            <p className="text-sm">7/24 Hizmet</p>
            <p className="text-xs opacity-75">Kesintisiz</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">👨‍✈️</div>
            <p className="text-sm">Profesyonel Şoför</p>
            <p className="text-xs opacity-75">Deneyimli</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-sm">Sigortalı</p>
            <p className="text-xs opacity-75">Güvenli</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">💧</div>
            <p className="text-sm">Su İkramı</p>
            <p className="text-xs opacity-75">Ücretsiz</p>
          </div>
        </div>
      </div>

      {/* Service FAQ */}
      <ServiceFAQ serviceType="vip-transfer" />
    </div>
  );
}