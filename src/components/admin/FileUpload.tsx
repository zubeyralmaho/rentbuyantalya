'use client'

import { useState, useRef } from 'react'
import { uploadFile, deleteFile, type BucketName, type UploadResult } from '@/lib/storage'

interface FileUploadProps {
  bucketName: BucketName
  currentImageUrl?: string | null
  onUploadSuccess: (result: UploadResult) => void
  onUploadError: (error: string) => void
  onDelete?: () => void
  label?: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
}

export default function FileUpload({
  bucketName,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  onDelete,
  label = 'Fotoğraf Seç',
  accept = 'image/*',
  multiple = false,
  maxFiles = 1
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return

    const filesToUpload = multiple ? 
      Array.from(files).slice(0, maxFiles) : 
      [files[0]]

    setIsUploading(true)

    try {
      if (multiple) {
        const results: UploadResult[] = []
        for (const file of filesToUpload) {
          const result = await uploadFile(file, bucketName)
          results.push(result)
          if (result.success) {
            onUploadSuccess(result)
          } else {
            onUploadError(result.error || 'Upload failed')
          }
        }
      } else {
        const result = await uploadFile(filesToUpload[0], bucketName)
        if (result.success) {
          onUploadSuccess(result)
        } else {
          onUploadError(result.error || 'Upload failed')
        }
      }
    } catch (error) {
      onUploadError('Dosya yüklenirken bir hata oluştu')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDeleteImage = async () => {
    if (!currentImageUrl || !onDelete) return

    try {
      // URL'den path'i çıkar
      const urlParts = currentImageUrl.split('/')
      const path = urlParts[urlParts.length - 1]
      
      if (path) {
        await deleteFile(path, bucketName)
      }
      onDelete()
    } catch (error) {
      onUploadError('Fotoğraf silinirken bir hata oluştu')
    }
  }

  return (
    <div className="file-upload-container">
      {currentImageUrl && (
        <div className="current-image-container">
          <img 
            src={currentImageUrl} 
            alt="Current" 
            className="current-image"
          />
          {onDelete && (
            <button 
              type="button"
              onClick={handleDeleteImage}
              className="delete-image-btn"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          {isUploading ? (
            <>
              <div className="upload-spinner"></div>
              <p>Yükleniyor...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <p>{label}</p>
              <p className="upload-hint">
                Sürükleyip bırakın veya tıklayın
              </p>
              <p className="upload-info">
                JPEG, PNG, WebP • Max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .file-upload-container {
          width: 100%;
        }

        .current-image-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .current-image {
          max-width: 200px;
          max-height: 150px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #4a5568;
        }

        .delete-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #e53e3e;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .delete-image-btn:hover {
          background: #c53030;
        }

        .upload-area {
          border: 2px dashed #4a5568;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #1a202c;
        }

        .upload-area:hover,
        .upload-area.drag-over {
          border-color: #63b3ed;
          background: #2d3748;
        }

        .upload-area.uploading {
          pointer-events: none;
          opacity: 0.7;
        }

        .upload-content {
          color: #a0aec0;
        }

        .upload-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .upload-content p {
          margin: 0.25rem 0;
        }

        .upload-hint {
          font-size: 0.9rem;
          color: #718096;
        }

        .upload-info {
          font-size: 0.8rem;
          color: #4a5568;
        }

        .upload-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #4a5568;
          border-top: 2px solid #63b3ed;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}