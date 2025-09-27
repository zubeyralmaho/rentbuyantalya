"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ServiceFAQ from '@/components/ServiceFAQ';

interface CarRentalItem {
  id: string;
  name: string;
  slug?: string;
  category: string; // e.g., Ekonomik | Orta | Komfort | Premium | ATV JEEP (or legacy values)
  pricePerDay: number;
  features: string[];
  image?: string;
  available: boolean;
}

interface CarRentalPageProps {
  locale: string;
  items?: CarRentalItem[];
}

export default function CarRentalServicePage({ locale, items }: CarRentalPageProps) {
  const t = useTranslations('services.rentACar');
  const tCommon = useTranslations('common');
  
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Car segments based on user requirements - aligned with DB slugs
  const segments: Array<{
    id: 'economic' | 'mid-class' | 'comfort' | 'premium' | 'atv-jeep';
    name: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'economic',
      name: 'Ekonomik',
      description: 'Şehir içi ve kısa seyahatler için en uygun fiyatlı araçlar',
      icon: '💰',
    },
    {
      id: 'mid-class',
      name: 'Orta',
      description: 'Konfor ve ekonomi dengesini sunan modeller',
      icon: '🚗',
    },
    {
      id: 'comfort',
      name: 'Komfort',
      description: 'Üst düzey konfor ve teknolojiye sahip araçlar',
      icon: '✨',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Lüks ve prestij segmenti',
      icon: '🏎️',
    },
    {
      id: 'atv-jeep',
      name: 'ATV JEEP',
      description: 'Macera ve off-road deneyimi için ATV ve Jeep',
      icon: '🛻',
    }
  ];

  // Helper to normalize legacy categories to our segment ids
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const mapCategoryToSegmentId = (category: string): typeof segments[number]['id'] | null => {
    const n = normalize(category);
    if (['ekonomik', 'economy', 'economic', 'budget'].includes(n)) return 'economic';
    if (['orta', 'mid', 'mid-class', 'middle'].includes(n)) return 'mid-class';
    if (['komfort', 'comfort', 'comfort-class'].includes(n)) return 'comfort';
    if (['premium', 'luxury', 'ust', 'ust-segment', 'upper', 'uper', 'u-st'].includes(n)) return 'premium';
    if (['atv-jeep', 'atv', 'jeep', 'atv-jeep-4x4', 'atv-jeep-off-road', 'atv-jeep-atv/jeep', 'atv-jeep-atv-jeep', 'atv/jeep', 'off-road'].includes(n)) return 'atv-jeep';
    return null;
  };

  const itemsBySegment = useMemo(() => {
    const map: Record<string, CarRentalItem[]> = {};
    segments.forEach(s => { map[s.id] = []; });
    const source: CarRentalItem[] = (items && items.length > 0)
      ? items
      : listings.map((l: any) => {
          const features: string[] = Array.isArray(l.features) ? l.features : [];
          const derive = (): typeof segments[number]['id'] => {
            // Preferred: use segment slug from API if present
            const segSlug: string | undefined = l?.car_segments?.slug || undefined;
            if (segSlug) {
              const s = segSlug.toLowerCase();
              if (s === 'economic' || s === 'economy' || s === 'ekonomik') return 'economic';
              if (s === 'mid-class' || s === 'orta') return 'mid-class';
              if (s === 'comfort' || s === 'komfort') return 'comfort';
              if (s === 'premium' || s === 'ust' || s === 'luxury') return 'premium';
              if (s === 'atv-jeep' || s === 'atv' || s === 'jeep') return 'atv-jeep';
            }
            const fset = new Set(features);
            // ATV/JEEP if clear off-road signals
            if (['4wd','4x4','off_road','off-road','atv','jeep'].some(k => fset.has(k))) return 'atv-jeep';
            // Premium if luxury features
            if (['leather_seats','premium_sound','sunroof','navigation','nav','massage_seats'].some(k => fset.has(k))) return 'premium';
            // Comfort if comfort-related
            if (['comfort','comfort_class','wide_body','large_trunk'].some(k => fset.has(k))) return 'comfort';
            // Mid-class if typical modern features
            if (['automatic_transmission','gps','bluetooth','cruise_control'].some(k => fset.has(k))) return 'mid-class';
            // Otherwise economic
            return 'economic';
          };
          const segId = derive();
          const price = typeof l.daily_price === 'number' && l.daily_price > 0
            ? l.daily_price
            : (typeof l.price_per_day === 'number' && l.price_per_day > 0
              ? l.price_per_day
              : (typeof l.price_range_min === 'number' ? l.price_range_min : 0));
          const image = (() => {
            const bucket = l.storage_bucket || 'listings'
            if (Array.isArray(l.storage_paths) && l.storage_paths.length > 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
              return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${l.storage_paths[0]}`
            }
            if (Array.isArray(l.images) && l.images.length > 0) return l.images[0]
            return undefined
          })();
          return {
            id: l.id,
            slug: l.slug,
            name: l.name,
            category: segId,
            pricePerDay: price,
            features,
            image,
            available: true
          } as CarRentalItem;
        });

    source.forEach(item => {
      const seg = mapCategoryToSegmentId(item.category) ?? mapCategoryToSegmentId(item.name) ?? null;
      if (seg && map[seg]) map[seg].push(item);
    });
    return map as Record<typeof segments[number]['id'], CarRentalItem[]>;
  }, [items, listings]);

  // Helper to fetch listings, optionally filtered by segment on the server
  const fetchListings = async (segment?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      const qs = segment ? `?segment=${encodeURIComponent(segment)}` : '';
      const res = await fetch(`/api/listings/rent-a-car${qs}`);
      const json = await res.json();
      
      console.log('API Response:', {
        url: `/api/listings/rent-a-car${qs}`,
        status: res.status,
        data: json
      });
      
      if (!res.ok) throw new Error(json.error || 'İlanlar alınamadı');
      const fetchedListings = json?.data?.listings || [];
      
      console.log('Fetched listings:', fetchedListings.map((l: any) => ({
        id: l.id,
        name: l.name,
        segment_id: l.segment_id,
        car_segments: l.car_segments
      })));
      
      setListings(fetchedListings);
    } catch (e: any) {
      setError(e?.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch (all) if items prop not supplied
  useEffect(() => {
    if (!items || items.length === 0) {
      fetchListings(null);
    }
  }, [items]);

  // When a segment is selected, refetch only that segment from the API
  useEffect(() => {
    if ((!items || items.length === 0) && selectedSegment) {
      fetchListings(selectedSegment);
    }
  }, [selectedSegment]);

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

      {/* Segment Selection */}
      {!selectedSegment && (
        <div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <div 
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id)}
                className="service-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-4">{segment.icon}</div>
                <h4 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
                  {segment.name}
                </h4>
                <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
                  {segment.description}
                </p>
                <div className="mt-3 text-xs" style={{color: 'var(--dark-text-muted)'}}>
                  {itemsBySegment[segment.id]?.length || 0} araç
                </div>
              </div>
            ))}
          </div>
          {loading && (
            <div className="text-center text-sm mt-4" style={{color: 'var(--dark-text-muted)'}}>
              Yükleniyor...
            </div>
          )}
          {error && (
            <div className="text-center text-sm mt-2 text-red-500">{error}</div>
          )}
        </div>
      )}

      {/* Back Button and Selected Segment Cars */}
      {selectedSegment && (
        <div>
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setSelectedSegment(null)}
              className="btn-secondary mr-4"
            >
              ← Geri Dön
            </button>
            <h3 className="text-xl font-bold" style={{color: 'var(--dark-text)'}}>
              {segments.find(s => s.id === selectedSegment)?.name} Araçları
            </h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(() => {
              const seg = segments.find(s => s.id === selectedSegment);
              if (!seg) return null;
              const cars = itemsBySegment[seg.id] || [];

              if (!cars || cars.length === 0) {
                return (
                  <div className="col-span-full text-center" style={{color: 'var(--dark-text-muted)'}}>
                    Bu segmentte şu anda listelenen araç bulunmuyor.
                  </div>
                );
              }

              return cars.map((item) => {
                const features = Array.isArray(item.features)
                  ? item.features
                  : (typeof item.features === 'string' ? [item.features] : []);

                const icon = seg.icon;
                const itemSlug = item.slug || `car-${item.id.slice(-4)}`;
                return (
                  <div key={item.id} className="service-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                       onClick={() => window.location.href = `/${locale}/car-rental/${itemSlug}`}>
                      <div className="text-4xl mb-4">{icon}</div>
                    {item.image && (
                      <div className="mb-3">
                        <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
                      </div>
                    )}

                    <h3 className="text-lg font-bold mb-2" style={{color: 'var(--dark-text)'}}>
                      {item.name}
                    </h3>

                    <div className="text-2xl font-bold mb-3" style={{color: 'var(--accent-500)'}}>
                      ₺{item.pricePerDay}
                      <span className="text-sm font-normal ml-1" style={{color: 'var(--dark-text-muted)'}}>
                        {tCommon('perDay')}
                      </span>
                    </div>

                    <ul className="text-sm space-y-1 mb-4" style={{color: 'var(--dark-text-muted)'}}>
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center justify-center gap-2">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2">
                      {item.available ? (
                        <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                          {tCommon('available')}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                          {tCommon('notAvailable')}
                        </span>
                      )}

                      <div className="mt-3">
                        <a
                          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${tCommon('whatsappMessage', { service: item.name })}`}
                          className="btn-primary text-sm px-4 py-2"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {tCommon('makeReservation')}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Additional Features */}
      {selectedSegment && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
        <h3 className="text-xl font-bold mb-6 text-center text-white">
          {t('features.standardTitle')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="text-white">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-sm">{t('features.insurance')}</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">⛽</div>
            <p className="text-sm">{t('features.fullTank')}</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">📍</div>
            <p className="text-sm">{t('features.gps')}</p>
          </div>
          <div className="text-white">
            <div className="text-2xl mb-2">📞</div>
            <p className="text-sm">{t('features.support')}</p>
          </div>
        </div>
      </div>
      )}

      {/* Service FAQ */}
      <ServiceFAQ serviceType="rent-a-car" />
    </div>
  );
}