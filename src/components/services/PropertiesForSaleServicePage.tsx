"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import ServiceFAQ from '@/components/ServiceFAQ';

interface Property {
  id: string;
  slug?: string;
  title: string;
  type: 'apartment' | 'villa' | 'land' | 'commercial' | 'penthouse' | 'office';
  price: number;
  location: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  features: string[];
  available: boolean;
  rating?: number;
  currency: 'TRY' | 'USD' | 'EUR';
  image?: string;
}

interface PropertiesForSaleServicePageProps {
  locale: string;
  properties?: Property[];
}

export default function PropertiesForSaleServicePage({ locale, properties = [] }: PropertiesForSaleServicePageProps) {
  const t = useTranslations('services.propertiesForSale');
  const tCommon = useTranslations('common');
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from API
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/listings/properties-for-sale`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.listings)) {
          setListings(data.data.listings);
        }
      }
    } catch (err) {
      console.error('Error fetching property listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Convert API listings to Property format
  const apiProperties: Property[] = listings.map((listing: any) => {
    const features: string[] = Array.isArray(listing.features) ? listing.features : [];
    const image = (() => {
      const bucket = listing.storage_bucket || 'listings';
      if (Array.isArray(listing.storage_paths) && listing.storage_paths.length > 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${listing.storage_paths[0]}`;
      }
      if (Array.isArray(listing.images) && listing.images.length > 0) return listing.images[0];
      return undefined;
    })();
    const price = typeof listing.daily_price === 'number' && listing.daily_price > 0
      ? listing.daily_price
      : (typeof listing.price_per_day === 'number' && listing.price_per_day > 0
        ? listing.price_per_day
        : (typeof listing.price_range_min === 'number' ? listing.price_range_min : 500000));

    return {
      id: listing.id,
      slug: listing.slug,
      title: listing.name,
      type: 'apartment' as const,
      price: price,
      currency: 'TRY' as const,
      location: listing.location || 'Antalya',
      area: 120,
      features: features,
      available: true,
      image: image
    };
  });

  const displayProperties = properties.length > 0 ? properties : apiProperties;

  const getPropertyTypeIcon = (type: string) => {
    switch(type) {
      case 'apartment': return '🏢';
      case 'villa': return '🏡';
      case 'land': return '🌍';
      case 'commercial': return '🏪';
      case 'penthouse': return '🏙️';
      case 'office': return '🏢';
      default: return '🏘️';
    }
  };

  const getPropertyTypeName = (type: string) => {
    switch(type) {
      case 'apartment': return 'Daire';
      case 'villa': return 'Villa';
      case 'land': return 'Arsa';
      case 'commercial': return 'İş Yeri';
      case 'penthouse': return 'Penthouse';
      case 'office': return 'Ofis';
      default: return 'Emlak';
    }
  };

  const formatPrice = (price: number, currency: string = 'TRY') => {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₺';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M ${currencySymbol}`;
    }
    return `${price.toLocaleString()} ${currencySymbol}`;
  };

  const getStarRating = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 ? '⭐' : '');
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

      {/* Properties Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
            {tCommon('loading')}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-500">
            {error}
          </div>
        </div>
      ) : displayProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
            Henüz emlak ilanı bulunmamaktadır.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayProperties.map((property) => (
          <div
            key={property.id}
            className="service-card p-0 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = `/${locale}/properties-for-sale/${property.slug || property.id}`}
          >
              {/* Image */}
              <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
                {property.image ? (
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🏢</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getPropertyTypeIcon(property.type)}</div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full" 
                        style={{
                          backgroundColor: 'var(--accent-500)', 
                          color: 'white'
                        }}>
                    {getPropertyTypeName(property.type)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {property.rating && (
                  <div className="text-xs" style={{color: 'var(--dark-text-muted)'}}>
                    {getStarRating(property.rating)} {property.rating}
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
              {property.title}
            </h3>
            
            <p className="text-sm mb-3 flex items-center gap-2" style={{color: 'var(--dark-text-muted)'}}>
              📍 {property.location}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">{property.area}</span> m²
              </div>
              {property.bedrooms && (
                <>
                  <div style={{color: 'var(--dark-text-muted)'}}>
                    <span className="font-medium">{property.bedrooms}</span> yatak odası
                  </div>
                  <div style={{color: 'var(--dark-text-muted)'}}>
                    <span className="font-medium">{property.bathrooms}</span> banyo
                  </div>
                </>
              )}
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold mb-2" style={{color: 'var(--accent-500)'}}>
                {formatPrice(property.price, property.currency)}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {property.features.slice(0, 3).map((feature, index) => (
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
                {property.features.length > 3 && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--dark-bg-secondary)', 
                      color: 'var(--dark-text-muted)',
                      border: '1px solid var(--dark-border)'
                    }}
                  >
                    +{property.features.length - 3} özellik
                  </span>
                )}
              </div>
            </div>
              </div>

            {/* Action buttons outside of Link */}
            <div className="p-6 pt-0">
              <div className="flex items-center justify-between">
                {property.available ? (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                    {tCommon('available')}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                    Satıldı
                  </span>
                )}
                
                <div className="space-x-2">
                  <a 
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: property.title })}`}
                    className="btn-primary text-sm px-3 py-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    İletişim
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Services Included */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center p-6 service-card">
          <div className="text-3xl mb-3">📋</div>
          <h4 className="font-bold mb-2" style={{color: 'var(--dark-text)'}}>
            Hukuki Danışmanlık
          </h4>
          <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
            Satış sürecinde tam hukuki destek ve tapu işlemleri danışmanlığı.
          </p>
        </div>
        <div className="text-center p-6 service-card">
          <div className="text-3xl mb-3">💰</div>
          <h4 className="font-bold mb-2" style={{color: 'var(--dark-text)'}}>
            Finansman Desteği
          </h4>
          <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
            Kredi çekme sürecinde yardım ve en uygun finansman seçenekleri.
          </p>
        </div>
        <div className="text-center p-6 service-card">
          <div className="text-3xl mb-3">📸</div>
          <h4 className="font-bold mb-2" style={{color: 'var(--dark-text)'}}>
            Profesyonel Çekim
          </h4>
          <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
            Satılık mülkleriniz için profesyonel fotoğraf ve drone çekimi.
          </p>
        </div>
      </div>

      {/* Investment Information */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-6 text-center text-white">
          Yatırım Fırsatları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <h4 className="font-bold mb-2">🎯 Yüksek Getiri Potansiyeli</h4>
            <p className="text-sm opacity-90 mb-4">
              Antalya'da emlak yatırımları yıllık %8-15 arası değer artışı gösteriyor.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">🌍 Uluslararası Talep</h4>
            <p className="text-sm opacity-90 mb-4">
              Yabancı yatırımcıların yoğun ilgisi ile değerli lokasyonlar.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">🏖️ Turizm Merkezi</h4>
            <p className="text-sm opacity-90 mb-4">
              Yıllık 15+ milyon turist ile kira geliri garantisi.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-2">🏗️ Gelişen Altyapı</h4>
            <p className="text-sm opacity-90 mb-4">
              Yeni projeler ve ulaşım ağı ile artan değer potansiyeli.
            </p>
          </div>
        </div>
      </div>

      {/* Service FAQ */}
      <ServiceFAQ serviceType="emlak-satış" />
    </div>
  );
}