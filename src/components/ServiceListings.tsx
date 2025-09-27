'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Listing {
  id: string
  name: string
  slug: string
  images: string[]
  features: string[]
  price_range_min?: number
  price_range_max?: number
  daily_price?: number
  location?: string
  description?: string
}

interface ServiceListingsProps {
  serviceSlug: string
  locale: string
}

export default function ServiceListings({ serviceSlug, locale }: ServiceListingsProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [serviceSlug])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/listings/${serviceSlug}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch listings')
      }

      setListings(result.data.listings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return null
    return new Intl.NumberFormat('tr-TR').format(price) + ' ₺'
  }

  const getPriceDisplay = (listing: Listing) => {
    if (listing.daily_price) {
      return (
        <div className="text-xl font-bold text-blue-600">
          {formatPrice(listing.daily_price)} <span className="text-sm text-gray-600">/gün</span>
        </div>
      )
    }
    if (listing.price_range_min && listing.price_range_max) {
      return (
        <div className="text-lg font-bold text-blue-600">
          {formatPrice(listing.price_range_min)} - {formatPrice(listing.price_range_max)}
        </div>
      )
    }
    return (
      <div className="text-sm text-gray-600">
        Fiyat bilgisi için iletişime geçin
      </div>
    )
  }

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, string> = {
      'klimali': '❄️',
      'manuel_vites': '🚗',
      'otomatik_vites': '⚙️',
      '4_kapi': '🚪',
      'yakit_tasarruflu': '⛽',
      'deri_koltuk': '🪑',
      'gps': '🧭',
      'bluetooth': '📶',
      'sunroof': '☀️',
      'profesyonel_sofor': '👨‍✈️',
      'luks_arac': '✨',
      '24_7': '🕐',
      'karsilama_servisi': '🤝',
      'rehber': '👨‍🏫',
      'esnek_program': '📋',
      'kaptan': '⚓',
      'yakit_dahil': '⛽',
      'yemek': '🍽️',
      'snorkel': '🤿',
      'muzik_sistemi': '🎵',
      'luks_kabinler': '🛏️',
      'jakuzi': '🛁',
      'chef': '👨‍🍳',
      'bar': '🍸',
      'su_sporlari': '🏄',
      'ozel_havuz': '🏊',
      'deniz_manzarasi': '🌊',
      'wifi': '📶',
      'mutfak': '🍳',
      'bahce': '🌳',
      'infinity_havuz': '🏊‍♂️',
      'spa': '💆',
      'fitness': '💪',
      'chef_mutfagi': '👨‍🍳',
      '2+1': '🏠',
      'site_icinde': '🏢',
      'otopark': '🅿️',
      'asansor': '🛗',
      'golf_sahasi': '⛳',
      '4+1': '🏡'
    }
    return icons[feature] || '✓'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchListings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz İlan Bulunmuyor</h3>
        <p className="text-gray-600">Bu hizmet için yakında yeni ilanlar eklenecek.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mevcut İlanlar</h2>
        <p className="text-gray-600">Size uygun seçenekleri keşfedin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/${locale}/${serviceSlug}/${listing.slug}`}
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
          >
            <div className="relative h-48">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder on image error
                    const target = e.target as HTMLImageElement
                    target.src = '/logo.png'
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="text-4xl text-gray-400">🏢</div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {listing.name}
              </h3>

              {listing.location && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <span className="mr-1">📍</span>
                  <span className="line-clamp-1">{listing.location}</span>
                </div>
              )}

              {listing.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {listing.description}
                </p>
              )}

              {listing.features && listing.features.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {listing.features.slice(0, 4).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                      >
                        <span className="mr-1">{getFeatureIcon(feature)}</span>
                        <span className="capitalize">{feature.replace('_', ' ')}</span>
                      </span>
                    ))}
                    {listing.features.length > 4 && (
                      <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        +{listing.features.length - 4} daha
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                {getPriceDisplay(listing)}
                <div className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                  Detayları Gör →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}