// Client-side storage helpers now call our API route which uses
// a Supabase service role on the server to bypass RLS safely.

export type BucketName = 'listings' | 'services' | 'pages' | 'blog'

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

/**
 * Dosya yükleme fonksiyonu
 * @param file - Yüklenecek dosya
 * @param bucketName - Hangi bucket'a yüklenecek
 * @param fileName - Özel dosya adı (opsiyonel)
 * @returns Upload sonucu
 */
export async function uploadFile(
  file: File,
  bucketName: BucketName,
  fileName?: string
): Promise<UploadResult> {
  try {
    // Dosya boyutu kontrolü (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'Dosya boyutu 10MB\'dan büyük olamaz'
      }
    }
    
    // Desteklenen dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Sadece JPEG, PNG ve WebP formatları desteklenir'
      }
    }
    // Dosya adını oluştur
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const finalFileName = fileName || `${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`
    
    // API route üzerinden upload (service role ile RLS engeli yok)
    const form = new FormData()
    form.append('file', file)
    form.append('bucketName', bucketName)
    form.append('fileName', finalFileName)

    const res = await fetch('/api/storage', {
      method: 'POST',
      body: form
    })

    if (!res.ok) {
      const err = await safeJson(res)
      const msg = err?.error || `Upload failed (${res.status})`
      return { success: false, error: msg }
    }

    const json = await res.json()
    return { success: true, path: json.path, url: json.url }
    
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Dosya yüklenirken bir hata oluştu'
    }
  }
}

/**
 * Dosya silme fonksiyonu
 * @param path - Silinecek dosyanın path'i
 * @param bucketName - Hangi bucket'tan silinecek
 * @returns Silme sonucu
 */
export async function deleteFile(
  path: string,
  bucketName: BucketName
): Promise<{ success: boolean; error?: string }> {
  try {
    // URL verildiyse path'e çevir
    const normalizedPath = toStoragePath(path, bucketName)

    const url = `/api/storage?bucket=${encodeURIComponent(bucketName)}&path=${encodeURIComponent(normalizedPath)}`
    const res = await fetch(url, { method: 'DELETE' })

    if (!res.ok) {
      const err = await safeJson(res)
      const msg = err?.error || `Delete failed (${res.status})`
      return { success: false, error: msg }
    }

    return { success: true }
    
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: 'Dosya silinirken bir hata oluştu'
    }
  }
}

/**
 * Storage'dan public URL alma fonksiyonu
 * @param path - Dosya path'i
 * @param bucketName - Bucket adı
 * @returns Public URL
 */
export function getStorageUrl(path: string, bucketName: BucketName): string {
  // Public bucketlar için public URL formatı:
  // {SUPABASE_URL}/storage/v1/object/public/{bucketName}/{path}
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return path
  return `${base}/storage/v1/object/public/${bucketName}/${path}`
}

/**
 * Dosya path'ini bucket adından ayırma
 * @param fullPath - Tam path (bucket/path formatında)
 * @returns Bucket adı ve dosya path'i
 */
export function parseStoragePath(fullPath: string): { bucket: BucketName; path: string } | null {
  const parts = fullPath.split('/')
  if (parts.length < 2) return null
  
  const bucket = parts[0] as BucketName
  const path = parts.slice(1).join('/')
  
  return { bucket, path }
}

/**
 * Çoklu dosya yükleme fonksiyonu
 * @param files - Yüklenecek dosyalar
 * @param bucketName - Hangi bucket'a yüklenecek
 * @returns Upload sonuçları
 */
export async function uploadMultipleFiles(
  files: FileList | File[],
  bucketName: BucketName
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  
  for (const file of Array.from(files)) {
    const result = await uploadFile(file, bucketName)
    results.push(result)
  }
  
  return results
}

/**
 * Eski dosyayı sil ve yenisini yükle
 * @param oldPath - Silinecek eski dosya path'i
 * @param newFile - Yüklenecek yeni dosya
 * @param bucketName - Bucket adı
 * @returns Upload sonucu
 */
export async function replaceFile(
  oldPath: string | null,
  newFile: File,
  bucketName: BucketName
): Promise<UploadResult> {
  try {
    // Yeni dosyayı yükle
    const uploadResult = await uploadFile(newFile, bucketName)
    
    if (uploadResult.success && oldPath) {
      // Eski dosyayı sil (hata olsa bile devam et)
      await deleteFile(oldPath, bucketName)
    }
    
    return uploadResult
    
  } catch (error) {
    console.error('Replace file error:', error)
    return {
      success: false,
      error: 'Dosya değiştirilirken bir hata oluştu'
    }
  }
}

// Yardımcılar
async function safeJson(res: Response): Promise<any | null> {
  try { return await res.json() } catch { return null }
}

function toStoragePath(maybeUrl: string, bucketName: BucketName): string {
  // Zaten plain path ise döndür
  if (!maybeUrl.startsWith('http')) return maybeUrl
  try {
    const u = new URL(maybeUrl)
    // /storage/v1/object/public/{bucketName}/{path}
    const marker = `/storage/v1/object/public/${bucketName}/`
    const idx = u.pathname.indexOf(marker)
    if (idx >= 0) {
      return decodeURIComponent(u.pathname.substring(idx + marker.length))
    }
    // Eski format veya custom CDN ise son segment fallback (riskli ama çalışır)
    const parts = u.pathname.split('/')
    return decodeURIComponent(parts[parts.length - 1] || '')
  } catch {
    // URL parse edilemezse olduğu gibi döndür
    return maybeUrl
  }
}