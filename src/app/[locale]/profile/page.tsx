'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface UserReservation {
  id: string;
  listing_id: string;
  service_name: string;
  listing_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations'>('profile');
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    fetchUserReservations();
  }, [user, router]);

  const fetchUserReservations = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      // Önce rezervasyon tablosunun varlığını kontrol et
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Reservations table might not exist:', error.message);
        setReservations([]);
        return;
      }

      // Basit format - listing ve service bilgileri için ayrı sorgular yapabiliriz
      const formattedReservations = data?.map(reservation => ({
        ...reservation,
        listing_name: 'Villa/Apart/Araç',
        service_name: 'Turizm Hizmeti'
      })) || [];

      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('status.confirmed');
      case 'pending': return t('status.pending');
      case 'cancelled': return t('status.cancelled');
      case 'completed': return t('status.completed');
      default: return t('notSpecified');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--dark-bg)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{color: 'var(--dark-text)'}}>{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20" style={{background: 'var(--dark-bg)'}}>
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-xl mb-4" style={{color: 'var(--dark-text)'}}>
              {t('title')}
            </h1>
            <p className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
              {t('welcome')}, {user.user_metadata?.first_name || user.email}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👤 {t('profileInfo')}
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 {t('pastServices')}
            </button>
          </div>

          {activeTab === 'profile' ? (
            /* Profile Info */
            <div className="service-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('firstName')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {user.user_metadata?.first_name || t('notSpecified')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('lastName')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {user.user_metadata?.last_name || t('notSpecified')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('email')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('phone')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {user.user_metadata?.phone || t('notSpecified')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('registrationDate')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--dark-text)'}}>
                    {t('emailStatus')}
                  </label>
                  <div className="p-3 rounded-lg" style={{
                    background: 'var(--dark-bg-secondary)',
                    borderColor: 'var(--neutral-700)',
                    color: 'var(--dark-text)'
                  }}>
                    {user.email_confirmed_at ? (
                      <span className="text-green-600">✅ {t('verified')}</span>
                    ) : (
                      <span className="text-yellow-600">⏳ {t('pending')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t" style={{borderColor: 'var(--neutral-700)'}}>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🚪 {t('signOut')}
                </button>
              </div>
            </div>
          ) : (
            /* Reservations */
            <div className="service-card p-8">
              <h2 className="text-xl font-bold mb-6" style={{color: 'var(--dark-text)'}}>
                📋 {t('pastServices')}
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p style={{color: 'var(--dark-text-muted)'}}>{t('loadingReservations')}</p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg" style={{color: 'var(--dark-text-muted)'}}>
                    {t('noReservations')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="p-4 rounded-lg border"
                      style={{
                        background: 'var(--dark-bg-secondary)',
                        borderColor: 'var(--neutral-700)'
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold" style={{color: 'var(--dark-text)'}}>
                            {reservation.listing_name}
                          </h3>
                          <p className="text-sm" style={{color: 'var(--dark-text-muted)'}}>
                            {reservation.service_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">{t('startDate')}:</span>
                          <div style={{color: 'var(--dark-text)'}}>
                            {new Date(reservation.start_date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('endDate')}:</span>
                          <div style={{color: 'var(--dark-text)'}}>
                            {new Date(reservation.end_date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('totalPrice')}:</span>
                          <div className="font-semibold" style={{color: 'var(--dark-text)'}}>
                            {reservation.total_price?.toLocaleString()} TRY
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('reservationDate')}:</span>
                          <div style={{color: 'var(--dark-text)'}}>
                            {new Date(reservation.created_at).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}