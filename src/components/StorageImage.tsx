'use client'

import { useState } from 'react'
import { getStorageUrl, type BucketName } from '@/lib/storage'

interface StorageImageProps {
  storagePath?: string | null
  bucketName?: BucketName
  fallbackUrl?: string | null
  alt?: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export default function StorageImage({
  storagePath,
  bucketName = 'listings',
  fallbackUrl,
  alt = '',
  className = '',
  width,
  height,
  priority = false
}: StorageImageProps) {
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Önce storage path'ini dene, yoksa fallback URL kullan
  const getImageUrl = (): string | null => {
    if (storagePath && bucketName && !imageError) {
      return getStorageUrl(storagePath, bucketName)
    }
    return fallbackUrl || null
  }

  const imageUrl = getImageUrl()

  const handleError = () => {
    setImageError(true)
    setLoading(false)
  }

  const handleLoad = () => {
    setLoading(false)
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Fotoğraf yok</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">Yükleniyor...</span>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 ${className}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  )
}

// Hook for getting storage image URL
export function useStorageImage(storagePath?: string | null, bucketName?: BucketName) {
  if (!storagePath || !bucketName) return null
  return getStorageUrl(storagePath, bucketName)
}