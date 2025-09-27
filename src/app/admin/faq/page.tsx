"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Languages } from 'lucide-react';

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
  service_type: string;
  sort_order: number;
  active: boolean;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'tr' | 'en' | 'ru' | 'ar'>('tr');
  const [selectedService, setSelectedService] = useState<string>('all');
  
  const [newFaq, setNewFaq] = useState<Omit<FAQItem, 'id'>>({
    question_tr: '',
    answer_tr: '',
    question_en: '',
    answer_en: '',
    question_ru: '',
    answer_ru: '',
    question_ar: '',
    answer_ar: '',
    service_type: 'general',
    sort_order: 1,
    active: true
  });

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const services = [
    { code: 'all', name: 'Tümü', icon: '📋' },
    { code: 'general', name: 'Genel', icon: '❓' },
    { code: 'rent-a-car', name: 'Araç Kiralama', icon: '🚗' },
    { code: 'vip-transfer', name: 'VIP Transfer', icon: '🚁' },
    { code: 'tekne-kiralama', name: 'Tekne Kiralama', icon: '⛵' },
    { code: 'villa-kiralama', name: 'Villa Kiralama', icon: '🏡' },
    { code: 'apart-kiralama', name: 'Apart Kiralama', icon: '🏢' },
    { code: 'properties-for-sale', name: 'Satılık Konutlar', icon: '🏠' }
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
          service_type: 'general',
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

  const getServiceInfo = (serviceType: string) => {
    const service = services.find(s => s.code === serviceType);
    return service || { icon: '❓', name: 'Bilinmiyor' };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">FAQ'lar yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Yönetimi</h1>
          <p className="text-gray-600">Sık sorulan soruları yönetin</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Yeni FAQ Ekle
        </button>
      </div>

      {/* Service Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Hizmet Seçimi</h3>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <button
              key={service.code}
              onClick={() => setSelectedService(service.code)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedService === service.code
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{service.icon}</span>
              <span className="text-sm">{service.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Dil Seçimi</h3>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code as any)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedLanguage === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add New FAQ Form */}
      {isAddingNew && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Yeni FAQ Ekle</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soru ({languages.find(l => l.code === selectedLanguage)?.name})
              </label>
              <input
                type="text"
                value={newFaq[`question_${selectedLanguage}` as keyof typeof newFaq] as string}
                onChange={(e) => setNewFaq({
                  ...newFaq,
                  [`question_${selectedLanguage}`]: e.target.value
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Soruyu girin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cevap ({languages.find(l => l.code === selectedLanguage)?.name})
              </label>
              <textarea
                value={newFaq[`answer_${selectedLanguage}` as keyof typeof newFaq] as string}
                onChange={(e) => setNewFaq({
                  ...newFaq,
                  [`answer_${selectedLanguage}`]: e.target.value
                })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cevabı girin..."
              />
            </div>

            <div className="flex gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hizmet
                </label>
                <select
                  value={newFaq.service_type}
                  onChange={(e) => setNewFaq({
                    ...newFaq,
                    service_type: e.target.value
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {services.slice(1).map((service) => (
                    <option key={service.code} value={service.code}>
                      {service.icon} {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra
                </label>
                <input
                  type="number"
                  value={newFaq.sort_order}
                  onChange={(e) => setNewFaq({
                    ...newFaq,
                    sort_order: parseInt(e.target.value) || 1
                  })}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newFaq.active}
                    onChange={(e) => setNewFaq({
                      ...newFaq,
                      active: e.target.checked
                    })}
                    className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveNew}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              Kaydet
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs
          .filter(faq => selectedService === 'all' || faq.service_type === selectedService)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((faq) => (
            <FAQCard
              key={faq.id}
              faq={faq}
              selectedLanguage={selectedLanguage}
              isEditing={editingId === faq.id}
              onEdit={() => setEditingId(faq.id)}
              onSave={(updatedFaq) => handleUpdateFaq(faq.id, updatedFaq)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteFaq(faq.id)}
              onToggleActive={() => handleToggleActive(faq.id)}
              getServiceInfo={getServiceInfo}
            />
          ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Henüz FAQ eklenmemiş.</div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            İlk FAQ'yu Ekle
          </button>
        </div>
      )}
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
  getServiceInfo: (serviceType: string) => { icon: string; name: string };
}

function FAQCard({ faq, selectedLanguage, isEditing, onEdit, onSave, onCancel, onDelete, onToggleActive, getServiceInfo }: FAQCardProps) {
  const [editedFaq, setEditedFaq] = useState<FAQItem>(faq);

  useEffect(() => {
    setEditedFaq(faq);
  }, [faq]);

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soru
            </label>
            <input
              type="text"
              value={editedFaq[`question_${selectedLanguage}` as keyof FAQItem] as string}
              onChange={(e) => setEditedFaq({
                ...editedFaq,
                [`question_${selectedLanguage}`]: e.target.value
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cevap
            </label>
            <textarea
              value={editedFaq[`answer_${selectedLanguage}` as keyof FAQItem] as string}
              onChange={(e) => setEditedFaq({
                ...editedFaq,
                [`answer_${selectedLanguage}`]: e.target.value
              })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıra
              </label>
              <input
                type="number"
                value={editedFaq.sort_order}
                onChange={(e) => setEditedFaq({
                  ...editedFaq,
                  sort_order: parseInt(e.target.value) || 1
                })}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedFaq.active}
                  onChange={(e) => setEditedFaq({
                    ...editedFaq,
                    active: e.target.checked
                  })}
                  className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(editedFaq)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            Kaydet
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${faq.active ? 'border-green-500' : 'border-gray-300'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">#{faq.sort_order}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              faq.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {faq.active ? 'Aktif' : 'Pasif'}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getServiceInfo(faq.service_type).icon} {getServiceInfo(faq.service_type).name}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {faq[`question_${selectedLanguage}` as keyof FAQItem] as string || 'Çeviri eksik'}
          </h3>
          
          <p className="text-gray-600">
            {faq[`answer_${selectedLanguage}` as keyof FAQItem] as string || 'Çeviri eksik'}
          </p>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg ${
              faq.active 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={faq.active ? 'Pasif Yap' : 'Aktif Yap'}
          >
            <Languages className="h-4 w-4" />
          </button>
          
          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
            title="Düzenle"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            title="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}