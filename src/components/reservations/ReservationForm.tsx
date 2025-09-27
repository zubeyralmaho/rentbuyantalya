'use client';

import { useState } from 'react';
import { ReservationFormData } from '@/types/database';

interface ReservationFormProps {
  listingId: string;
  listingName: string;
  onSuccess?: (reservation: any) => void;
  onError?: (error: string) => void;
}

export default function ReservationForm({ 
  listingId, 
  listingName, 
  onSuccess, 
  onError 
}: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    guests_count: 1,
    special_requests: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bugünün tarihini al (minimum tarih için)
  const today = new Date().toISOString().split('T')[0];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Ad Soyad gereklidir';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Telefon numarası gereklidir';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Başlangıç tarihi gereklidir';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Bitiş tarihi gereklidir';
    }

    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'Bitiş tarihi başlangıç tarihinden sonra olmalı';
    }

    if (formData.guests_count < 1) {
      newErrors.guests_count = 'En az 1 kişi olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rezervasyon oluşturulamadı');
      }

      // Formu temizle
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        start_date: '',
        end_date: '',
        guests_count: 1,
        special_requests: ''
      });

      if (onSuccess) {
        onSuccess(data.reservation);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Hatayı temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '1px solid var(--neutral-200)' }}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Rezervasyon Yap</h3>
        <p className="text-gray-600">{listingName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ad Soyad */}
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
            Ad Soyad *
          </label>
          <input
            id="customer_name"
            type="text"
            value={formData.customer_name}
            onChange={(e) => handleInputChange('customer_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
              errors.customer_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-white'
            }`}
            disabled={loading}
          />
          {errors.customer_name && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
          )}
        </div>

        {/* E-posta */}
        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta *
          </label>
          <input
            id="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => handleInputChange('customer_email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
              errors.customer_email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-white'
            }`}
            disabled={loading}
          />
          {errors.customer_email && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
          )}
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
            placeholder="+90 555 123 45 67"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
              errors.customer_phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-white'
            }`}
            disabled={loading}
          />
          {errors.customer_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
          )}
        </div>

        {/* Tarihler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi *
            </label>
            <input
              id="start_date"
              type="date"
              min={today}
              value={formData.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
                errors.start_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-white'
              }`}
              disabled={loading}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi *
            </label>
            <input
              id="end_date"
              type="date"
              min={formData.start_date || today}
              value={formData.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
                errors.end_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-white'
              }`}
              disabled={loading}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
            )}
          </div>
        </div>

        {/* Misafir Sayısı */}
        <div>
          <label htmlFor="guests_count" className="block text-sm font-medium text-gray-700 mb-1">
            Misafir Sayısı *
          </label>
          <input
            id="guests_count"
            type="number"
            min="1"
            max="20"
            value={formData.guests_count}
            onChange={(e) => handleInputChange('guests_count', parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white ${
              errors.guests_count ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
            }`}
            disabled={loading}
          />
          {errors.guests_count && (
            <p className="mt-1 text-sm text-red-600">{errors.guests_count}</p>
          )}
        </div>

        {/* Özel İstekler */}
        <div>
          <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-1">
            Özel İstekler
          </label>
          <textarea
            id="special_requests"
            rows={3}
            value={formData.special_requests}
            onChange={(e) => handleInputChange('special_requests', e.target.value)}
            placeholder="Özel istekleriniz varsa belirtiniz..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Rezervasyon Oluşturuluyor...' : 'Rezervasyon Yap'}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Rezervasyonunuz onay bekliyor durumunda oluşturulacaktır.</p>
        <p>* Sizinle en kısa sürede iletişime geçilecektir.</p>
      </div>
    </div>
  );
}