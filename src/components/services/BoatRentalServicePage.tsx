"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import ServiceFAQ from '@/components/ServiceFAQ';

interface Boat {
  id: string;
  name: string;
  slug?: string;
  type: 'yacht' | 'sailboat' | 'motorboat' | 'catamaran' | 'gulet';
  capacity?: number;
  length?: number;
  pricePerDay: number;
  features: string[];
  available: boolean;
  location?: string;
  image?: string;
  description?: string;
}

interface BoatLocation {
  id: 'antalya' | 'kemer' | 'kas' | 'fethiye' | 'bodrum';
  name: string;
  description: string;
  image: string;
  icon: string;
}

interface BoatRentalServicePageProps {
  locale: string;
  boats?: Boat[];
}

export default function BoatRentalServicePage({ locale, boats = [] }: BoatRentalServicePageProps) {
  const t = useTranslations('services.boatRental');
  const tCommon = useTranslations('common');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Boat locations with images
  const locations: BoatLocation[] = [
    {
      id: 'antalya',
      name: 'Antalya',
      description: 'Akdeniz\'in incisi Antalya\'da tekne kiralama',
      image: '/services/antalyaboat.jpg',
      icon: '🏖️',
    },
    {
      id: 'kemer',
      name: 'Kemer',
      description: 'Kemer\'de doğa ile iç içe tekne turu',
      image: '/services/kemerboat.jpg',
      icon: '🏔️',
    },
    {
      id: 'kas',
      name: 'Kaş',
      description: 'Kaş\'ın büyülü koylarında tekne keyfi',
      image: '/services/kasboat.jpg',
      icon: '🌊',
    },
    {
      id: 'fethiye',
      name: 'Fethiye',
      description: 'Fethiye\'nin eşsiz mavi yolculuğu',
      image: '/services/fethiyeboat.jpg',
      icon: '⛵',
    },
    {
      id: 'bodrum',
      name: 'Bodrum',
      description: 'Bodrum\'da lüks tekne deneyimi',
      image: '/services/bodrumboat.jpg',
      icon: '🛥️',
    }
  ];

  // Debug: Log all image paths
  useEffect(() => {
    console.log('🖼️ Boat location images:');
    locations.forEach(loc => {
      console.log(`${loc.id}: ${loc.image}`);
    });
  }, []);

  // Helper to normalize location names
  const normalizeLocation = (location: string): typeof locations[number]['id'] | null => {
    const n = location.toLowerCase().trim();
    if (n.includes('antalya')) return 'antalya';
    if (n.includes('kemer')) return 'kemer';
    if (n.includes('kaş') || n.includes('kas')) return 'kas';
    if (n.includes('fethiye')) return 'fethiye';
    if (n.includes('bodrum')) return 'bodrum';
    return null;
  };

  // Fetch listings from API
  const fetchListings = async (location?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      const url = location 
        ? `/api/listings/boat-rental?location=${encodeURIComponent(location)}`
        : `/api/listings/boat-rental`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.listings)) {
          setListings(data.data.listings);
        }
      }
    } catch (err) {
      console.error('Error fetching boat listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(selectedLocation);
  }, [selectedLocation]);

  // Group boats by location
  const boatsByLocation = useMemo(() => {
    const map: Record<string, Boat[]> = {};
    locations.forEach(loc => { map[loc.id] = []; });
    
    const source: Boat[] = listings.map((listing: any) => {
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
          : (typeof listing.price_range_min === 'number' ? listing.price_range_min : 500));

      return {
        id: listing.id,
        slug: listing.slug,
        name: listing.name,
        type: 'yacht' as const,
        pricePerDay: price,
        location: listing.location || 'Antalya',
        features: features,
        available: true,
        image: image,
        description: listing.description
      };
    });

    // Group boats by their location
    source.forEach(boat => {
      const locationId = normalizeLocation(boat.location || 'antalya') || 'antalya';
      if (map[locationId]) {
        map[locationId].push(boat);
      }
    });

    return map as Record<typeof locations[number]['id'], Boat[]>;
  }, [listings]);

  // Use boats for selected location or all boats if no location selected
  const displayBoats: Boat[] = selectedLocation && locations.find(loc => loc.id === selectedLocation) 
    ? boatsByLocation[selectedLocation as keyof typeof boatsByLocation] || [] 
    : listings.map((listing: any): Boat => {
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
          : (typeof listing.price_range_min === 'number' ? listing.price_range_min : 500));

      return {
        id: listing.id,
        slug: listing.slug,
        name: listing.name,
        type: 'yacht' as const,
        pricePerDay: price,
        location: listing.location || 'Antalya',
        features: features,
        available: true,
        image: image,
        description: listing.description
      };
    });

  const getBoatTypeIcon = (type: string) => {
    switch(type) {
      case 'yacht': return '🛥️';
      case 'sailboat': return '⛵';
      case 'motorboat': return '🚤';
      case 'catamaran': return '⛵';
      case 'gulet': return '🚢';
      default: return '🛥️';
    }
  };

  const getBoatTypeName = (type: string) => {
    try {
      return t(`boatTypes.${type}`);
    } catch {
      return type.charAt(0).toUpperCase() + type.slice(1);
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

      {/* Location Selection */}
      {!selectedLocation ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="cursor-pointer hover:scale-105 transition-transform rounded-lg overflow-hidden shadow-lg bg-white"
              onClick={() => setSelectedLocation(location.id)}
            >
              {/* Sadece resim ve üzerine yazı */}
              <div className="relative h-64 w-full">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('❌ Image load error:', location.image);
                    e.currentTarget.src = '/logo.png';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', location.image);
                  }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Content over image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{location.icon}</span>
                    <h3 className="text-xl font-bold">
                      {t(`locations.${location.id}`)}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-white/90 mb-3">
                    {t(`locationDescriptions.${location.id}`)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium bg-blue-600 px-3 py-1 rounded-full">
                      {boatsByLocation[location.id]?.length || 0} {t('boatsAvailable')}
                    </span>
                    <div className="text-white">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Back Button & Selected Location */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedLocation(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← {t('backToLocations')}
            </button>
            <div className="text-right">
              <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>
                {selectedLocation && `${t(`locations.${selectedLocation}`)} Tekneleri`}
              </h3>
              <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
                {displayBoats.length} {t('boatsFound')}
              </p>
            </div>
          </div>

          {/* Boats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayBoats.map((boat: Boat) => (
          <div 
            key={boat.id}
            className="service-card p-6"
          >
            {/* Clickable area for boat details */}
            <Link 
              href={`/${locale}/boat-rental/${boat.slug || boat.id}`}
              className="block cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{getBoatTypeIcon(boat.type)}</div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full" 
                        style={{
                          backgroundColor: 'var(--accent-500)', 
                          color: 'white'
                        }}>
                    {getBoatTypeName(boat.type)}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
                {boat.name}
              </h3>
              
              <p className="text-sm mb-3 flex items-center gap-2" style={{color: 'var(--dark-text-muted)'}}>
                ⚓ {boat.location}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div style={{color: 'var(--dark-text-muted)'}}>
                  <span className="font-medium">Kapasite:</span> {boat.capacity} kişi
                </div>
                <div style={{color: 'var(--dark-text-muted)'}}>
                  <span className="font-medium">Uzunluk:</span> {boat.length}m
                </div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold mb-2" style={{color: 'var(--accent-500)'}}>
                  {formatPrice(boat.pricePerDay)} <span className="text-sm font-normal">/ gün</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {boat.features.slice(0, 3).map((feature: string, index: number) => (
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
                  {boat.features.length > 3 && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: 'var(--dark-bg-secondary)', 
                        color: 'var(--dark-text-muted)',
                        border: '1px solid var(--dark-border)'
                      }}
                    >
                      +{boat.features.length - 3} özellik
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Action area - separate from link */}
            <div className="flex items-center justify-between">
              {boat.available ? (
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
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: boat.name })}`}
                  className="btn-primary text-sm px-3 py-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()} // Prevent parent click
                >
                  {tCommon('makeReservation')}
                </a>
              </div>
            </div>
          </div>
            ))}
          </div>
        </>
      )}

      {/* Service FAQ */}
      <ServiceFAQ serviceType="tekne-kiralama" />
    </div>
  );
}