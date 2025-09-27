"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import ServiceFAQ from '@/components/ServiceFAQ';

interface Villa {
  id: string;
  slug?: string;
  name: string;
  type: 'villa' | 'apartment' | 'penthouse' | 'bungalow';
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  area?: number;
  pricePerNight: number;
  location?: string;
  features: string[];
  available: boolean;
  rating?: number;
  beachDistance?: number;
  image?: string;
  description?: string;
}

interface VillaRentalServicePageProps {
  locale: string;
  villas?: Villa[];
}

export default function VillaRentalServicePage({ locale, villas = [] }: VillaRentalServicePageProps) {
  const t = useTranslations('services.villaRental');
  const tCommon = useTranslations('common');
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from API
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/listings/villa-rental`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.listings)) {
          setListings(data.data.listings);
        }
      }
    } catch (err) {
      console.error('Error fetching villa listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Convert API listings to Villa format
  const apiVillas: Villa[] = listings.map((listing: any) => {
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
        : (typeof listing.price_range_min === 'number' ? listing.price_range_min : 200));

    return {
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      type: 'villa' as const,
      pricePerNight: price,
      location: listing.location || 'Antalya',
      features: features,
      available: true,
      image: image,
      description: listing.description
    };
  });

  const displayVillas = villas.length > 0 ? villas : apiVillas;

  const getVillaTypeIcon = (type: string) => {
    switch(type) {
      case 'villa': return '🏡';
      case 'apartment': return '🏠';
      case 'penthouse': return '🏢';
      case 'bungalow': return '🏘️';
      default: return '🏡';
    }
  };

  const getVillaTypeName = (type: string) => {
    switch(type) {
      case 'villa': return 'Villa';
      case 'apartment': return 'Apart';
      case 'penthouse': return 'Penthouse';
      case 'bungalow': return 'Bungalov';
      default: return 'Konaklama';
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString()}`;
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

      {/* Villas Grid */}
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
      ) : displayVillas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
            Henüz villa ilanı bulunmamaktadır.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayVillas.map((villa) => (
          <div 
            key={villa.id}
            className="service-card p-0 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = `/${locale}/villa-rental/${villa.slug || villa.id}`}
          >
              {/* Image */}
              <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
                {villa.image ? (
                  <Image
                    src={villa.image}
                    alt={villa.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🏡</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getVillaTypeIcon(villa.type)}</div>
                    <div>
                      <span className="text-xs px-2 py-1 rounded-full" 
                            style={{
                              backgroundColor: 'var(--accent-500)', 
                              color: 'white'
                            }}>
                        {getVillaTypeName(villa.type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {villa.rating && (
                      <div className="text-xs" style={{color: 'var(--dark-text-muted)'}}>
                        {getStarRating(villa.rating)} {villa.rating}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
                  {villa.name}
                </h3>
                
                <p className="text-sm mb-3 flex items-center gap-2" style={{color: 'var(--dark-text-muted)'}}>
                  📍 {villa.location}
                  {villa.beachDistance !== undefined && (
                    <span className="text-xs">
                      • {villa.beachDistance === 0 ? 'Plaja Sıfır' : `Plaja ${villa.beachDistance}m`}
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div style={{color: 'var(--dark-text-muted)'}}>
                    <span className="font-medium">{villa.bedrooms}</span> yatak odası
                  </div>
                  <div style={{color: 'var(--dark-text-muted)'}}>
                    <span className="font-medium">{villa.capacity}</span> kişi
                  </div>
                  <div style={{color: 'var(--dark-text-muted)'}}>
                    <span className="font-medium">{villa.area}</span> m²
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold mb-2" style={{color: 'var(--accent-500)'}}>
                    {formatPrice(villa.pricePerNight)} <span className="text-sm font-normal">/ gece</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {villa.features.slice(0, 3).map((feature, index) => (
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
                    {villa.features.length > 3 && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: 'var(--dark-bg-secondary)', 
                          color: 'var(--dark-text-muted)',
                          border: '1px solid var(--dark-border)'
                        }}
                      >
                        +{villa.features.length - 3} özellik
                      </span>
                    )}
                  </div>
                </div>
              </div>

            {/* Action buttons outside of Link */}
            <div className="p-6 pt-0">
              <div className="flex items-center justify-between">
                {villa.available ? (
                  <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                    {tCommon('available')}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                    {tCommon('notAvailable')}
                  </span>
                )}
                
                <div className="space-x-2">
                  <a 
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: villa.name })}`}
                    className="btn-primary text-sm px-3 py-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tCommon('makeReservation')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}





      {/* Service FAQ */}
      <ServiceFAQ serviceType="villa-kiralama" />
    </div>
  );
}