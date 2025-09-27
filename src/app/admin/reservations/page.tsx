'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Reservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    // Check admin authentication
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      fetchReservations();
    } catch (error) {
      console.error('Admin data parse error:', error);
      router.push('/admin');
    }
  }, [router]);

  const fetchReservations = async () => {
    try {
      // Mock data for now
      const mockReservations: Reservation[] = [
        {
          id: '1',
          customer_name: 'Ahmet Yılmaz',
          customer_email: 'ahmet@email.com',
          customer_phone: '+90 532 123 4567',
          service_name: 'Villa Kiralama',
          start_date: '2025-09-25',
          end_date: '2025-09-30',
          guests_count: 4,
          total_price: 15000,
          status: 'confirmed',
          created_at: '2025-09-20T10:30:00Z'
        },
        {
          id: '2',
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@email.com',
          customer_phone: '+1 555 987 6543',
          service_name: 'Tekne Kiralama',
          start_date: '2025-09-23',
          end_date: '2025-09-23',
          guests_count: 8,
          total_price: 3500,
          status: 'pending',
          created_at: '2025-09-21T14:15:00Z'
        },
        {
          id: '3',
          customer_name: 'Hans Mueller',
          customer_email: 'hans@email.com',
          customer_phone: '+49 176 12345678',
          service_name: 'Araç Kiralama',
          start_date: '2025-09-28',
          end_date: '2025-10-05',
          guests_count: 2,
          total_price: 2100,
          status: 'confirmed',
          created_at: '2025-09-19T09:45:00Z'
        }
      ];
      
      setReservations(mockReservations);
    } catch (error) {
      console.error('Fetch reservations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'cancelled':
        return { backgroundColor: '#fef2f2', color: '#dc2626' };
      case 'completed':
        return { backgroundColor: '#f0f9ff', color: '#1e40af' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      case 'cancelled':
        return 'İptal';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  const filteredReservations = statusFilter === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === statusFilter);

  if (!admin) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-text">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Rezervasyon Yönetimi</h1>
            <p>Rezervasyonları görüntüle ve yönet</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/admin/dashboard" className="admin-button" style={{ width: 'auto' }}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="admin-button logout-button">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-dashboard">
        {loading ? (
          <div className="admin-card">
            <p>Rezervasyonlar yükleniyor...</p>
          </div>
        ) : (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Rezervasyonlar ({filteredReservations.length})</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="pending">Bekleyen</option>
                  <option value="confirmed">Onaylanan</option>
                  <option value="completed">Tamamlanan</option>
                  <option value="cancelled">İptal Edilen</option>
                </select>
              </div>
            </div>
            
            <div className="admin-table" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Müşteri</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Hizmet</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Tarih</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Kişi</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Tutar</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Durum</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{reservation.customer_name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{reservation.customer_email}</div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{reservation.customer_phone}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{reservation.service_name}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div>{reservation.start_date}</div>
                          <div style={{ color: '#64748b' }}>→ {reservation.end_date}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{reservation.guests_count}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>₺{reservation.total_price.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getStatusColor(reservation.status)
                        }}>
                          {getStatusText(reservation.status)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}>
                            Görüntüle
                          </button>
                          {reservation.status === 'pending' && (
                            <button style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: '4px',
                              border: '1px solid #dcfce7',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              cursor: 'pointer'
                            }}>
                              Onayla
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}