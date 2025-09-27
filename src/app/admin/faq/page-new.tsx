"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import '../admin.css';

interface FAQItem {
  id: string;
  question_tr: string;
  answer_tr: string;
  question_en: string;
  answer_en: string;
  question_ru: string;
  answer_ru: string;
  question_ar: string;
  answer_ar: string;
  sort_order: number;
  active: boolean;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'tr' | 'en' | 'ru' | 'ar'>('tr');
  
  const [newFaq, setNewFaq] = useState<Omit<FAQItem, 'id'>>({
    question_tr: '',
    answer_tr: '',
    question_en: '',
    answer_en: '',
    question_ru: '',
    answer_ru: '',
    question_ar: '',
    answer_ar: '',
    sort_order: 1,
    active: true
  });

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faqs');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        console.error('Error fetching FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNew = async () => {
    try {
      const response = await fetch('/api/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFaq),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs([...faqs, data.faq]);
        
        // Reset form
        setNewFaq({
          question_tr: '',
          answer_tr: '',
          question_en: '',
          answer_en: '',
          question_ru: '',
          answer_ru: '',
          question_ar: '',
          answer_ar: '',
          sort_order: faqs.length + 1,
          active: true
        });
        setIsAddingNew(false);
        alert('FAQ başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'FAQ eklenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('FAQ eklenirken hata oluştu!');
    }
  };

  const handleUpdateFaq = async (id: string, updatedFaq: FAQItem) => {
    try {
      const response = await fetch('/api/faqs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedFaq, id }),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(faqs.map(faq => faq.id === id ? data.faq : faq));
        setEditingId(null);
        alert('FAQ başarıyla güncellendi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'FAQ güncellenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('FAQ güncellenirken hata oluştu!');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Bu FAQ\'yu silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/faqs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFaqs(faqs.filter(faq => faq.id !== id));
        alert('FAQ başarıyla silindi!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'FAQ silinirken hata oluştu!');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('FAQ silinirken hata oluştu!');
    }
  };

  const handleToggleActive = async (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;
    
    const updatedFaq = { ...faq, active: !faq.active };
    await handleUpdateFaq(id, updatedFaq);
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <div className="admin-loading-text">FAQ'lar yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>FAQ Yönetimi</h1>
            <p>Sık sorulan soruları yönetin</p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="admin-button"
          >
            <Plus className="h-4 w-4" />
            Yeni FAQ Ekle
          </button>
        </div>
      </div>

      <div className="admin-dashboard">
        {/* Language Selector */}
        <div className="admin-form-group">
          <label className="admin-label">Dil Seçin:</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code as any)}
                className={selectedLanguage === lang.code ? 'admin-button' : 'admin-button-secondary'}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add New FAQ Form */}
        {isAddingNew && (
          <div className="admin-form-container" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Yeni FAQ Ekle</h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="admin-button-secondary"
                style={{ padding: '4px 8px' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Soru ({languages.find(l => l.code === selectedLanguage)?.name})
              </label>
              <input
                type="text"
                value={newFaq[`question_${selectedLanguage}` as keyof typeof newFaq] as string}
                onChange={(e) => setNewFaq({
                  ...newFaq,
                  [`question_${selectedLanguage}`]: e.target.value
                })}
                className="admin-input"
                placeholder="Soruyu girin..."
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">
                Cevap ({languages.find(l => l.code === selectedLanguage)?.name})
              </label>
              <textarea
                value={newFaq[`answer_${selectedLanguage}` as keyof typeof newFaq] as string}
                onChange={(e) => setNewFaq({
                  ...newFaq,
                  [`answer_${selectedLanguage}`]: e.target.value
                })}
                rows={3}
                className="admin-input"
                style={{ resize: 'vertical', minHeight: '80px' }}
                placeholder="Cevabı girin..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
              <div className="admin-form-group">
                <label className="admin-label">Sıra</label>
                <input
                  type="number"
                  value={newFaq.sort_order}
                  onChange={(e) => setNewFaq({
                    ...newFaq,
                    sort_order: parseInt(e.target.value) || 1
                  })}
                  className="admin-input"
                  style={{ width: '80px' }}
                  min="1"
                />
              </div>

              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
                  <input
                    type="checkbox"
                    checked={newFaq.active}
                    onChange={(e) => setNewFaq({
                      ...newFaq,
                      active: e.target.checked
                    })}
                    style={{ width: 'auto' }}
                  />
                  Aktif
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button
                onClick={handleSaveNew}
                className="admin-button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save className="h-4 w-4" />
                Kaydet
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="admin-button-secondary"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                selectedLanguage={selectedLanguage}
                isEditing={editingId === faq.id}
                onEdit={() => setEditingId(faq.id)}
                onSave={(updatedFaq: FAQItem) => handleUpdateFaq(faq.id, updatedFaq)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDeleteFaq(faq.id)}
                onToggleActive={() => handleToggleActive(faq.id)}
              />
            ))}
        </div>

        {faqs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
            <div style={{ fontSize: '18px', marginBottom: '1rem' }}>Henüz FAQ eklenmemiş.</div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="admin-button"
            >
              İlk FAQ'yu Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// FAQ Card Component
interface FAQCardProps {
  faq: FAQItem;
  selectedLanguage: 'tr' | 'en' | 'ru' | 'ar';
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedFaq: FAQItem) => void;
  onCancel: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function FAQCard({ faq, selectedLanguage, isEditing, onEdit, onSave, onCancel, onDelete, onToggleActive }: FAQCardProps) {
  const [editedFaq, setEditedFaq] = useState<FAQItem>(faq);

  useEffect(() => {
    setEditedFaq(faq);
  }, [faq]);

  if (isEditing) {
    return (
      <div className="admin-form-container" style={{ borderLeft: '4px solid #fbbf24' }}>
        <div className="admin-form-group">
          <label className="admin-label">Soru</label>
          <input
            type="text"
            value={editedFaq[`question_${selectedLanguage}` as keyof FAQItem] as string}
            onChange={(e) => setEditedFaq({
              ...editedFaq,
              [`question_${selectedLanguage}`]: e.target.value
            })}
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Cevap</label>
          <textarea
            value={editedFaq[`answer_${selectedLanguage}` as keyof FAQItem] as string}
            onChange={(e) => setEditedFaq({
              ...editedFaq,
              [`answer_${selectedLanguage}`]: e.target.value
            })}
            rows={3}
            className="admin-input"
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div className="admin-form-group">
            <label className="admin-label">Sıra</label>
            <input
              type="number"
              value={editedFaq.sort_order}
              onChange={(e) => setEditedFaq({
                ...editedFaq,
                sort_order: parseInt(e.target.value) || 1
              })}
              className="admin-input"
              style={{ width: '80px' }}
              min="1"
            />
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <input
                type="checkbox"
                checked={editedFaq.active}
                onChange={(e) => setEditedFaq({
                  ...editedFaq,
                  active: e.target.checked
                })}
                style={{ width: 'auto' }}
              />
              Aktif
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <button
            onClick={() => onSave(editedFaq)}
            className="admin-button"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
          <button
            onClick={onCancel}
            className="admin-button-secondary"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="admin-form-container" 
      style={{ 
        borderLeft: `4px solid ${faq.active ? '#10b981' : '#6b7280'}`,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ 
              color: '#a0aec0', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              #{faq.sort_order}
            </span>
            <span style={{ 
              padding: '4px 8px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '600',
              backgroundColor: faq.active ? '#065f46' : '#374151',
              color: faq.active ? '#d1fae5' : '#d1d5db'
            }}>
              {faq.active ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          
          <h3 style={{ 
            color: 'white', 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '8px' 
          }}>
            {faq[`question_${selectedLanguage}` as keyof FAQItem] as string || 'Çeviri eksik'}
          </h3>
          
          <p style={{ color: '#a0aec0', lineHeight: '1.5' }}>
            {faq[`answer_${selectedLanguage}` as keyof FAQItem] as string || 'Çeviri eksik'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: '1rem' }}>
          <button
            onClick={onToggleActive}
            className="admin-button-secondary"
            style={{ padding: '8px' }}
            title={faq.active ? 'Pasif Yap' : 'Aktif Yap'}
          >
            {faq.active ? '🟢' : '🔴'}
          </button>
          
          <button
            onClick={onEdit}
            className="admin-button-secondary"
            style={{ padding: '8px' }}
            title="Düzenle"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="admin-button-secondary"
            style={{ padding: '8px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
            title="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}