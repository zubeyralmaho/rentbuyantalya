'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import { getStorageUrl, type BucketName, type UploadResult } from '@/lib/storage';
import { Page, GeneralFaq, Campaign, BlogPost } from '@/types/database';

type ContentType = 'pages' | 'faqs' | 'campaigns' | 'blog';

interface ContentFormProps {
  type: ContentType;
  item?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function ContentForm({ type, item, onClose, onSave }: ContentFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Initialize empty form data based on type
      switch (type) {
        case 'pages':
          setFormData({
            page_type: 'about',
            slug: '',
            title_tr: '',
            title_en: '',
            title_ru: '',
            title_ar: '',
            content_tr: '',
            content_en: '',
            content_ru: '',
            content_ar: '',
            meta_title_tr: '',
            meta_title_en: '',
            meta_title_ru: '',
            meta_title_ar: '',
            meta_description_tr: '',
            meta_description_en: '',
            meta_description_ru: '',
            meta_description_ar: '',
            published: false,
            featured: false
          });
          break;
        case 'faqs':
          setFormData({
            question_tr: '',
            question_en: '',
            question_ru: '',
            question_ar: '',
            answer_tr: '',
            answer_en: '',
            answer_ru: '',
            answer_ar: '',
            display_order: 0,
            published: true
          });
          break;
        case 'campaigns':
          setFormData({
            title_tr: '',
            title_en: '',
            title_ru: '',
            title_ar: '',
            description_tr: '',
            description_en: '',
            description_ru: '',
            description_ar: '',
            content_tr: '',
            content_en: '',
            content_ru: '',
            content_ar: '',
            discount_percentage: '',
            discount_amount: '',
            valid_from: '',
            valid_until: '',
            image_url: '',
            campaign_code: '',
            active: true,
            featured: false
          });
          break;
        case 'blog':
          setFormData({
            slug: '',
            title_tr: '',
            title_en: '',
            title_ru: '',
            title_ar: '',
            excerpt_tr: '',
            excerpt_en: '',
            excerpt_ru: '',
            excerpt_ar: '',
            content_tr: '',
            content_en: '',
            content_ru: '',
            content_ar: '',
            featured_image: '',
            category: '',
            tags: [],
            meta_title_tr: '',
            meta_title_en: '',
            meta_title_ru: '',
            meta_title_ar: '',
            meta_description_tr: '',
            meta_description_en: '',
            meta_description_ru: '',
            meta_description_ar: '',
            published: false,
            featured: false
          });
          break;
      }
    }
  }, [type, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      switch (type) {
        case 'pages':
          endpoint = '/api/pages';
          break;
        case 'faqs':
          endpoint = '/api/general-faqs';
          break;
        case 'campaigns':
          endpoint = '/api/campaigns';
          break;
        case 'blog':
          endpoint = '/api/blog';
          break;
      }

      const method = item ? 'PUT' : 'POST';
      const requestData = item ? { ...formData, id: item.id } : formData;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kayıt başarısız');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Storage handlers
  const getBucketName = (): BucketName => {
    switch (type) {
      case 'pages': return 'pages';
      case 'blog': return 'blog';
      case 'campaigns': return 'pages';
      default: return 'pages';
    }
  };

  const handleImageUpload = (result: UploadResult) => {
    if (result.success && result.path) {
      updateFormData('storage_path', result.path);
      updateFormData('storage_bucket', getBucketName());
      setUploadError('');
    }
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
  };

  const handleImageDelete = () => {
    updateFormData('storage_path', null);
    updateFormData('storage_bucket', null);
  };

  const getCurrentImageUrl = () => {
    if (formData.storage_path && formData.storage_bucket) {
      return getStorageUrl(formData.storage_path, formData.storage_bucket);
    }
    // Fallback to old image_url field
    return formData.image_url || formData.featured_image || null;
  };

  const renderForm = () => {
    switch (type) {
      case 'pages':
        return renderPageForm();
      case 'faqs':
        return renderFaqForm();
      case 'campaigns':
        return renderCampaignForm();
      case 'blog':
        return renderBlogForm();
      default:
        return null;
    }
  };

  const renderPageForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Sayfa Türü</label>
          <select
            value={formData.page_type || ''}
            onChange={(e) => updateFormData('page_type', e.target.value)}
            className="admin-input"
            required
          >
            <option value="about">Hakkımızda</option>
            <option value="general-faq">Genel SSS</option>
            <option value="campaigns">Kampanyalar</option>
            <option value="blog">Blog</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => updateFormData('slug', e.target.value)}
            className="admin-input"
            placeholder="hakkimizda"
            required
          />
        </div>
      </div>

      {/* Başlık Alanları */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Türkçe) *</label>
          <input
            type="text"
            value={formData.title_tr || ''}
            onChange={(e) => updateFormData('title_tr', e.target.value)}
            className="admin-input"
            required
          />
        </div>
        <div>
          <label className="admin-label">Başlık (İngilizce)</label>
          <input
            type="text"
            value={formData.title_en || ''}
            onChange={(e) => updateFormData('title_en', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Rusça)</label>
          <input
            type="text"
            value={formData.title_ru || ''}
            onChange={(e) => updateFormData('title_ru', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Başlık (Arapça)</label>
          <input
            type="text"
            value={formData.title_ar || ''}
            onChange={(e) => updateFormData('title_ar', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Fotoğraf Upload */}
      <div>
        <label className="admin-label">Sayfa Fotoğrafı</label>
        <FileUpload
          bucketName={getBucketName()}
          currentImageUrl={getCurrentImageUrl()}
          onUploadSuccess={handleImageUpload}
          onUploadError={handleImageError}
          onDelete={handleImageDelete}
          label="Sayfa fotoğrafı seç"
        />
        {uploadError && (
          <p className="text-red-500 text-sm mt-1">{uploadError}</p>
        )}
      </div>

      {/* İçerik Alanları */}
      <div>
        <label className="admin-label">İçerik (Türkçe) *</label>
        <textarea
          value={formData.content_tr || ''}
          onChange={(e) => updateFormData('content_tr', e.target.value)}
          className="admin-textarea"
          rows={8}
          required
        />
      </div>

      <div>
        <label className="admin-label">İçerik (İngilizce)</label>
        <textarea
          value={formData.content_en || ''}
          onChange={(e) => updateFormData('content_en', e.target.value)}
          className="admin-textarea"
          rows={6}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Rusça)</label>
        <textarea
          value={formData.content_ru || ''}
          onChange={(e) => updateFormData('content_ru', e.target.value)}
          className="admin-textarea"
          rows={6}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Arapça)</label>
        <textarea
          value={formData.content_ar || ''}
          onChange={(e) => updateFormData('content_ar', e.target.value)}
          className="admin-textarea"
          rows={6}
        />
      </div>

      <div className="flex gap-4">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => updateFormData('published', e.target.checked)}
          />
          <span>Yayında</span>
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.featured || false}
            onChange={(e) => updateFormData('featured', e.target.checked)}
          />
          <span>Öne Çıkan</span>
        </label>
      </div>
    </div>
  );

  const renderFaqForm = () => (
    <div className="space-y-4">
      {/* Soru Alanları */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Soru (Türkçe) *</label>
          <input
            type="text"
            value={formData.question_tr || ''}
            onChange={(e) => updateFormData('question_tr', e.target.value)}
            className="admin-input"
            required
          />
        </div>
        <div>
          <label className="admin-label">Soru (İngilizce)</label>
          <input
            type="text"
            value={formData.question_en || ''}
            onChange={(e) => updateFormData('question_en', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Soru (Rusça)</label>
          <input
            type="text"
            value={formData.question_ru || ''}
            onChange={(e) => updateFormData('question_ru', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Soru (Arapça)</label>
          <input
            type="text"
            value={formData.question_ar || ''}
            onChange={(e) => updateFormData('question_ar', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Cevap Alanları */}
      <div>
        <label className="admin-label">Cevap (Türkçe) *</label>
        <textarea
          value={formData.answer_tr || ''}
          onChange={(e) => updateFormData('answer_tr', e.target.value)}
          className="admin-textarea"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="admin-label">Cevap (İngilizce)</label>
        <textarea
          value={formData.answer_en || ''}
          onChange={(e) => updateFormData('answer_en', e.target.value)}
          className="admin-textarea"
          rows={4}
        />
      </div>

      <div>
        <label className="admin-label">Cevap (Rusça)</label>
        <textarea
          value={formData.answer_ru || ''}
          onChange={(e) => updateFormData('answer_ru', e.target.value)}
          className="admin-textarea"
          rows={4}
        />
      </div>

      <div>
        <label className="admin-label">Cevap (Arapça)</label>
        <textarea
          value={formData.answer_ar || ''}
          onChange={(e) => updateFormData('answer_ar', e.target.value)}
          className="admin-textarea"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Sıralama</label>
          <input
            type="number"
            value={formData.display_order || 0}
            onChange={(e) => updateFormData('display_order', parseInt(e.target.value))}
            className="admin-input"
          />
        </div>
        <div className="flex items-center">
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={formData.published || false}
              onChange={(e) => updateFormData('published', e.target.checked)}
            />
            <span>Yayında</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCampaignForm = () => (
    <div className="space-y-4">
      {/* Başlık Alanları */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Türkçe) *</label>
          <input
            type="text"
            value={formData.title_tr || ''}
            onChange={(e) => updateFormData('title_tr', e.target.value)}
            className="admin-input"
            required
          />
        </div>
        <div>
          <label className="admin-label">Başlık (İngilizce)</label>
          <input
            type="text"
            value={formData.title_en || ''}
            onChange={(e) => updateFormData('title_en', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Rusça)</label>
          <input
            type="text"
            value={formData.title_ru || ''}
            onChange={(e) => updateFormData('title_ru', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Başlık (Arapça)</label>
          <input
            type="text"
            value={formData.title_ar || ''}
            onChange={(e) => updateFormData('title_ar', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Fotoğraf Upload */}
      <div>
        <label className="admin-label">Kampanya Fotoğrafı</label>
        <FileUpload
          bucketName={getBucketName()}
          currentImageUrl={getCurrentImageUrl()}
          onUploadSuccess={handleImageUpload}
          onUploadError={handleImageError}
          onDelete={handleImageDelete}
          label="Kampanya fotoğrafı seç"
        />
        {uploadError && (
          <p className="text-red-500 text-sm mt-1">{uploadError}</p>
        )}
      </div>

      {/* Açıklama Alanları */}
      <div>
        <label className="admin-label">Açıklama (Türkçe) *</label>
        <textarea
          value={formData.description_tr || ''}
          onChange={(e) => updateFormData('description_tr', e.target.value)}
          className="admin-textarea"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="admin-label">Açıklama (İngilizce)</label>
        <textarea
          value={formData.description_en || ''}
          onChange={(e) => updateFormData('description_en', e.target.value)}
          className="admin-textarea"
          rows={3}
        />
      </div>

      <div>
        <label className="admin-label">Açıklama (Rusça)</label>
        <textarea
          value={formData.description_ru || ''}
          onChange={(e) => updateFormData('description_ru', e.target.value)}
          className="admin-textarea"
          rows={3}
        />
      </div>

      <div>
        <label className="admin-label">Açıklama (Arapça)</label>
        <textarea
          value={formData.description_ar || ''}
          onChange={(e) => updateFormData('description_ar', e.target.value)}
          className="admin-textarea"
          rows={3}
        />
      </div>

      {/* İçerik Alanları */}
      <div>
        <label className="admin-label">İçerik (Türkçe) *</label>
        <textarea
          value={formData.content_tr || ''}
          onChange={(e) => updateFormData('content_tr', e.target.value)}
          className="admin-textarea"
          rows={5}
          required
        />
      </div>

      <div>
        <label className="admin-label">İçerik (İngilizce)</label>
        <textarea
          value={formData.content_en || ''}
          onChange={(e) => updateFormData('content_en', e.target.value)}
          className="admin-textarea"
          rows={5}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Rusça)</label>
        <textarea
          value={formData.content_ru || ''}
          onChange={(e) => updateFormData('content_ru', e.target.value)}
          className="admin-textarea"
          rows={5}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Arapça)</label>
        <textarea
          value={formData.content_ar || ''}
          onChange={(e) => updateFormData('content_ar', e.target.value)}
          className="admin-textarea"
          rows={5}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="admin-label">İndirim Yüzdesi</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.discount_percentage || ''}
            onChange={(e) => updateFormData('discount_percentage', parseInt(e.target.value) || null)}
            className="admin-input"
            placeholder="15"
          />
        </div>
        <div>
          <label className="admin-label">İndirim Miktarı (TL)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.discount_amount || ''}
            onChange={(e) => updateFormData('discount_amount', parseFloat(e.target.value) || null)}
            className="admin-input"
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="admin-label">Kampanya Kodu</label>
          <input
            type="text"
            value={formData.campaign_code || ''}
            onChange={(e) => updateFormData('campaign_code', e.target.value)}
            className="admin-input"
            placeholder="EARLY15"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlangıç Tarihi</label>
          <input
            type="date"
            value={formData.valid_from || ''}
            onChange={(e) => updateFormData('valid_from', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Bitiş Tarihi</label>
          <input
            type="date"
            value={formData.valid_until || ''}
            onChange={(e) => updateFormData('valid_until', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div>
        <label className="admin-label">Görsel URL</label>
        <input
          type="url"
          value={formData.image_url || ''}
          onChange={(e) => updateFormData('image_url', e.target.value)}
          className="admin-input"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex gap-4">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.active || false}
            onChange={(e) => updateFormData('active', e.target.checked)}
          />
          <span>Aktif</span>
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.featured || false}
            onChange={(e) => updateFormData('featured', e.target.checked)}
          />
          <span>Öne Çıkan</span>
        </label>
      </div>
    </div>
  );

  const renderBlogForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Slug *</label>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => updateFormData('slug', e.target.value)}
            className="admin-input"
            placeholder="antalya-gezi-rehberi"
            required
          />
        </div>
        <div>
          <label className="admin-label">Kategori</label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => updateFormData('category', e.target.value)}
            className="admin-input"
            placeholder="Rehber"
          />
        </div>
      </div>

      {/* Başlık Alanları */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Türkçe) *</label>
          <input
            type="text"
            value={formData.title_tr || ''}
            onChange={(e) => updateFormData('title_tr', e.target.value)}
            className="admin-input"
            required
          />
        </div>
        <div>
          <label className="admin-label">Başlık (İngilizce)</label>
          <input
            type="text"
            value={formData.title_en || ''}
            onChange={(e) => updateFormData('title_en', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Başlık (Rusça)</label>
          <input
            type="text"
            value={formData.title_ru || ''}
            onChange={(e) => updateFormData('title_ru', e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Başlık (Arapça)</label>
          <input
            type="text"
            value={formData.title_ar || ''}
            onChange={(e) => updateFormData('title_ar', e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      {/* Fotoğraf Upload */}
      <div>
        <label className="admin-label">Blog Fotoğrafı</label>
        <FileUpload
          bucketName={getBucketName()}
          currentImageUrl={getCurrentImageUrl()}
          onUploadSuccess={handleImageUpload}
          onUploadError={handleImageError}
          onDelete={handleImageDelete}
          label="Blog fotoğrafı seç"
        />
        {uploadError && (
          <p className="text-red-500 text-sm mt-1">{uploadError}</p>
        )}
      </div>

      {/* Özet Alanları */}
      <div>
        <label className="admin-label">Özet (Türkçe)</label>
        <textarea
          value={formData.excerpt_tr || ''}
          onChange={(e) => updateFormData('excerpt_tr', e.target.value)}
          className="admin-textarea"
          rows={2}
          placeholder="Kısa özet..."
        />
      </div>

      <div>
        <label className="admin-label">Özet (İngilizce)</label>
        <textarea
          value={formData.excerpt_en || ''}
          onChange={(e) => updateFormData('excerpt_en', e.target.value)}
          className="admin-textarea"
          rows={2}
        />
      </div>

      <div>
        <label className="admin-label">Özet (Rusça)</label>
        <textarea
          value={formData.excerpt_ru || ''}
          onChange={(e) => updateFormData('excerpt_ru', e.target.value)}
          className="admin-textarea"
          rows={2}
        />
      </div>

      <div>
        <label className="admin-label">Özet (Arapça)</label>
        <textarea
          value={formData.excerpt_ar || ''}
          onChange={(e) => updateFormData('excerpt_ar', e.target.value)}
          className="admin-textarea"
          rows={2}
        />
      </div>

      {/* İçerik Alanları */}
      <div>
        <label className="admin-label">İçerik (Türkçe) *</label>
        <textarea
          value={formData.content_tr || ''}
          onChange={(e) => updateFormData('content_tr', e.target.value)}
          className="admin-textarea"
          rows={8}
          required
        />
      </div>

      <div>
        <label className="admin-label">İçerik (İngilizce)</label>
        <textarea
          value={formData.content_en || ''}
          onChange={(e) => updateFormData('content_en', e.target.value)}
          className="admin-textarea"
          rows={8}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Rusça)</label>
        <textarea
          value={formData.content_ru || ''}
          onChange={(e) => updateFormData('content_ru', e.target.value)}
          className="admin-textarea"
          rows={8}
        />
      </div>

      <div>
        <label className="admin-label">İçerik (Arapça)</label>
        <textarea
          value={formData.content_ar || ''}
          onChange={(e) => updateFormData('content_ar', e.target.value)}
          className="admin-textarea"
          rows={8}
        />
      </div>

      <div>
        <label className="admin-label">Öne Çıkan Görsel URL</label>
        <input
          type="url"
          value={formData.featured_image || ''}
          onChange={(e) => updateFormData('featured_image', e.target.value)}
          className="admin-input"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex gap-4">
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.published || false}
            onChange={(e) => updateFormData('published', e.target.checked)}
          />
          <span>Yayında</span>
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={formData.featured || false}
            onChange={(e) => updateFormData('featured', e.target.checked)}
          />
          <span>Öne Çıkan</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="admin-modal">
      <div className="admin-modal-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {item ? 'Düzenle' : 'Yeni Ekle'} - {
              type === 'pages' ? 'Sayfa' :
              type === 'faqs' ? 'SSS' :
              type === 'campaigns' ? 'Kampanya' :
              type === 'blog' ? 'Blog' : ''
            }
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {error && (
          <div className="admin-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="admin-button-secondary"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="admin-button"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : (item ? 'Güncelle' : 'Kaydet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}