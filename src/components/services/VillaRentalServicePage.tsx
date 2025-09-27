"use client";

import React, { useEffect, useState, useMemo } from 'react';
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

interface VillaLocation {
  id: 'antalya' | 'belek' | 'kemer' | 'kas' | 'fethiye' | 'bodrum';
  name: string;
  description: string;
  image: string;
  icon: string;
}

interface VillaRentalServicePageProps {
  locale: string;
  villas?: Villa[];
}

export default function VillaRentalServicePage({ locale, villas = [] }: VillaRentalServicePageProps) {
  const t = useTranslations('services.villaRental');
  const tCommon = useTranslations('common');
  
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Villa locations with images
  const locations: VillaLocation[] = [
    {
      id: 'antalya',
      name: 'Antalya Merkez',
      description: 'Antalya merkez bölgesinde lüks villa kiralama',
      image: '/services/antalyaboat.jpg',
      icon: '🏙️',
    },
    {
      id: 'belek',
      name: 'Belek',
      description: 'Belek\'in golf sahalarına yakın villalar',
      image: '/services/belekboat.jpg',
      icon: '⛳',
    },
    {
      id: 'kemer',
      name: 'Kemer',
      description: 'Kemer\'de doğa ile iç içe villa tatili',
      image: '/services/kemerboat.jpg',
      icon: '🏔️',
    },
    {
      id: 'kas',
      name: 'Kaş',
      description: 'Kaş\'ın büyülü atmosferinde villa kiralama',
      image: '/services/kasboat.jpg',
      icon: '🌊',
    },
    {
      id: 'fethiye',
      name: 'Fethiye',
      description: 'Fethiye\'nin eşsiz manzaralı villaları',
      image: '/services/fethiyeboat.jpg',
      icon: '⛵',
    },
    {
      id: 'bodrum',
      name: 'Bodrum',
      description: 'Bodrum\'da deniz manzaralı lüks villalar',
      image: '/services/bodrumboat.jpg',
      icon: '🏛️',
    }
  ];

  // Helper to normalize location names
  const normalizeLocation = (location: string): typeof locations[number]['id'] | null => {
    const n = location.toLowerCase().trim();
    if (n.includes('antalya')) return 'antalya';
    if (n.includes('belek')) return 'belek';
    if (n.includes('kemer')) return 'kemer';
    if (n.includes('kaş') || n.includes('kas')) return 'kas';
    if (n.includes('fethiye')) return 'fethiye';
    if (n.includes('bodrum')) return 'bodrum';
    return null;
  };

  // Fetch listings from API
  const fetchListings = async (locationFilter?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/listings/villa-rental`;
      if (locationFilter) {
        url += `?location=${encodeURIComponent(locationFilter)}`;
      }
      const res = await fetch(url);
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
    fetchListings(selectedLocation || undefined);
  }, [selectedLocation]);

  // Group villas by location
  const villasByLocation = useMemo(() => {
    const map: Record<typeof locations[number]['id'], Villa[]> = {} as Record<typeof locations[number]['id'], Villa[]>;
    
    // Initialize map
    locations.forEach(loc => {
      map[loc.id] = [];
    });

    // Convert API listings to Villa format and group by location
    const source = listings.map((listing: any) => {
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

    // Group villas by their location
    source.forEach(villa => {
      const locationId = normalizeLocation(villa.location || 'antalya') || 'antalya';
      if (map[locationId]) {
        map[locationId].push(villa);
      }
    });

    return map as Record<typeof locations[number]['id'], Villa[]>;
  }, [listings]);

  // Use villas for selected location or all villas if no location selected
  const displayVillas: Villa[] = selectedLocation && locations.find(loc => loc.id === selectedLocation) 
    ? villasByLocation[selectedLocation as keyof typeof villasByLocation] || [] 
    : listings.map((listing: any): Villa => {
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

  // Legacy API support for props villas - merged with location-based display
  const propsVillas = villas.length > 0 ? villas : [];
  const finalDisplayVillas = propsVillas.length > 0 ? propsVillas : displayVillas;

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
                      {location.name}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-white/90 mb-3">
                    {location.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium bg-blue-600 px-3 py-1 rounded-full">
                      {villasByLocation[location.id]?.length || 0} villa mevcut
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
          {/* Back to locations and current location info */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedLocation(null)}
              className="btn-secondary"
            >
              ← Lokasyonlara Geri Dön
            </button>
            
            <div className="text-right">
              <h3 className="text-lg font-semibold" style={{color: 'var(--dark-text)'}}>
                {selectedLocation && `${locations.find(l => l.id === selectedLocation)?.name} Villaları`}
              </h3>
              <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
                {finalDisplayVillas.length} villa bulundu
              </p>
            </div>
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
          ) : finalDisplayVillas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
                Henüz villa ilanı bulunmamaktadır.
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {finalDisplayVillas.map((villa) => (
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
        </>
      )}

      {/* Service FAQ */}
      <ServiceFAQ serviceType="villa-kiralama" />
    </div>
  );
}