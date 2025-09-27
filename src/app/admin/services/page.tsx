'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
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
      fetchServices();
    } catch (error) {
      console.error('Admin data parse error:', error);
      router.push('/admin');
    }
  }, [router]);

  const fetchServices = async () => {
    try {
      // In a real app, you would fetch from your API
      // For now, we'll show mock data
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'Rent a Car',
          slug: 'rent-a-car',
          description: 'Car rental services',
          icon: 'car',
          active: true,
          sort_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'VIP Transfer',
          slug: 'vip-transfer',
          description: 'VIP transfer services',
          icon: 'plane',
          active: true,
          sort_order: 2,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Boat Rental',
          slug: 'boat-rental',
          description: 'Boat and yacht rental',
          icon: 'anchor',
          active: true,
          sort_order: 3,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Villa Rental',
          slug: 'villa-rental',
          description: 'Villa rental services',
          icon: 'home',
          active: true,
          sort_order: 4,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Properties for Sale',
          slug: 'properties-for-sale',
          description: 'Real estate sales services',
          icon: 'building',
          active: true,
          sort_order: 5,
          created_at: new Date().toISOString()
        }
      ];
      
      setServices(mockServices);
    } catch (error) {
      console.error('Fetch services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

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
            <h1>Hizmet Yönetimi</h1>
            <p>Hizmetleri görüntüle ve yönet</p>
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
            <p>Hizmetler yükleniyor...</p>
          </div>
        ) : (
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Hizmetler ({services.length})</h2>
              <button className="admin-button" style={{ width: 'auto' }}>
                Yeni Hizmet Ekle
              </button>
            </div>
            
            <div className="admin-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Sıra</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>İsim</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Slug</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>İkon</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Durum</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}>{service.sort_order}</td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{service.name}</td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{service.slug}</td>
                      <td style={{ padding: '1rem' }}>{service.icon}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: service.active ? '#dcfce7' : '#fef2f2',
                          color: service.active ? '#166534' : '#dc2626'
                        }}>
                          {service.active ? 'Aktif' : 'Pasif'}
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
                            Düzenle
                          </button>
                          <button style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}>
                            Sil
                          </button>
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