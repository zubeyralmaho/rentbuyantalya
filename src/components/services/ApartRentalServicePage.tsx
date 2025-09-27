"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import ServiceFAQ from '@/components/ServiceFAQ';

interface Apartment {
  id: string;
  slug?: string;
  name: string;
  type: 'studio' | '1+1' | '2+1' | '3+1' | '4+1' | 'penthouse';
  bedrooms?: number;
  bathrooms?: number;
  capacity?: number;
  area?: number;
  pricePerDay: number;
  pricePerWeek?: number;
  location?: string;
  features: string[];
  available: boolean;
  rating?: number;
  centerDistance?: number;
  image?: string;
  description?: string;
}

interface ApartRentalServicePageProps {
  locale: string;
  apartments?: Apartment[];
}

export default function ApartRentalServicePage({ locale, apartments = [] }: ApartRentalServicePageProps) {
  const t = useTranslations('services.apartRental');
  const tCommon = useTranslations('common');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from API
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/listings/apart-rental`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.listings)) {
          setListings(data.data.listings);
        }
      }
    } catch (err) {
      console.error('Error fetching apart listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Convert API listings to Apartment format
  const apiApartments: Apartment[] = listings.map((listing: any) => {
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
        : (typeof listing.price_range_min === 'number' ? listing.price_range_min : 100));

    return {
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      type: '2+1' as const,
      pricePerDay: price,
      location: listing.location || 'Antalya',
      features: features,
      available: true,
      image: image,
      description: listing.description
    };
  });

  const displayApartments = apartments.length > 0 ? apartments : apiApartments;

  const getApartmentTypeIcon = (type: string) => {
    switch(type) {
      case 'studio': return '🏠';
      case '1+1': return '🏡';
      case '2+1': return '🏘️';
      case '3+1': return '🏰';
      case '4+1': return '🏯';
      case 'penthouse': return '🏙️';
      default: return '🏠';
    }
  };

  const getApartmentTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'studio': 'Studio',
      '1+1': '1+1 Daire',
      '2+1': '2+1 Daire', 
      '3+1': '3+1 Daire',
      '4+1': '4+1 Daire',
      'penthouse': 'Penthouse'
    };
    return typeMap[type] || type;
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

      {/* Apartments Grid */}
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
      ) : displayApartments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
            Henüz apart ilanı bulunmamaktadır.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayApartments.map((apartment) => (
          <div
            key={apartment.id}
            className="service-card p-0 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = `/${locale}/apart-rental/${apartment.slug || apartment.id}`}
          >
              {/* Image */}
              <div className="relative h-48 w-full mb-4 rounded-t-lg overflow-hidden">
                {apartment.image ? (
                  <Image
                    src={apartment.image}
                    alt={apartment.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white text-4xl">🏠</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{getApartmentTypeIcon(apartment.type)}</div>
              <div>
                <span className="text-xs px-2 py-1 rounded-full" 
                      style={{
                        backgroundColor: 'var(--accent-500)', 
                        color: 'white'
                      }}>
                  {getApartmentTypeName(apartment.type)}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
              {apartment.name}
            </h3>
            
            <p className="text-sm mb-3 flex items-center gap-2" style={{color: 'var(--dark-text-muted)'}}>
              📍 {apartment.location}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Oda:</span> {apartment.bedrooms && apartment.bedrooms > 0 ? `${apartment.bedrooms} Yatak Odası` : 'Studio'}
              </div>
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Banyo:</span> {apartment.bathrooms}
              </div>
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Kapasite:</span> {apartment.capacity} kişi
              </div>
              <div style={{color: 'var(--dark-text-muted)'}}>
                <span className="font-medium">Alan:</span> {apartment.area}m²
              </div>
            </div>

            {/* Rating and Distance */}
            <div className="flex items-center gap-4 mb-4 text-sm" style={{color: 'var(--dark-text-muted)'}}>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span>{apartment.rating}</span>
              </div>
              {apartment.centerDistance && (
                <div className="flex items-center gap-1">
                  <span>🚗</span>
                  <span>{apartment.centerDistance}km merkeze</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold mb-2" style={{color: 'var(--accent-500)'}}>
                {formatPrice(apartment.pricePerDay)} <span className="text-sm font-normal">/ gün</span>
              </div>
              {apartment.pricePerWeek && (
                <div className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
                  Haftalık: {formatPrice(apartment.pricePerWeek)}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-3">
                {apartment.features.slice(0, 3).map((feature, index) => (
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
                {apartment.features.length > 3 && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--dark-bg-secondary)', 
                      color: 'var(--dark-text-muted)',
                      border: '1px solid var(--dark-border)'
                    }}
                  >
                    +{apartment.features.length - 3} özellik
                  </span>
                )}
              </div>
            </div>
            </div>

            {/* Action buttons outside of Link */}
            <div className="p-6 pt-0">
              <div className="flex items-center justify-between">
                {apartment.available ? (
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
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: apartment.name })}`}
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
      <ServiceFAQ serviceType="apart-kiralama" />
    </div>
  );
}