'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
}

interface AvailabilityDate {
  date: string;
  is_available: boolean;
  price?: number;
  notes?: string;
}

export default function AvailabilityPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityDate>>({});
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
      // Mock services data
      const mockServices: Service[] = [
        { id: '1', name: 'Villa Kiralama' },
        { id: '2', name: 'Tekne Kiralama' },
        { id: '3', name: 'Araç Kiralama' }
      ];
      
      setServices(mockServices);
      if (mockServices.length > 0) {
        setSelectedService(mockServices[0].id);
        fetchAvailability(mockServices[0].id);
      }
    } catch (error) {
      console.error('Fetch services error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (serviceId: string) => {
    try {
      // Mock availability data
      const mockAvailability: Record<string, AvailabilityDate> = {};
      
      // Generate mock data for current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        mockAvailability[dateStr] = {
          date: dateStr,
          is_available: Math.random() > 0.3, // 70% available
          price: Math.floor(Math.random() * 500) + 200,
          notes: Math.random() > 0.8 ? 'Bakım günü' : undefined
        };
      }
      
      setAvailability(mockAvailability);
    } catch (error) {
      console.error('Fetch availability error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    fetchAvailability(serviceId);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    if (selectedService) {
      fetchAvailability(selectedService);
    }
  };

  const toggleAvailability = (dateStr: string) => {
    setAvailability(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        is_available: !prev[dateStr]?.is_available
      }
    }));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const days = [];
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = availability[dateStr];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${dayData?.is_available ? 'available' : 'unavailable'} ${isToday ? 'today' : ''}`}
          onClick={() => toggleAvailability(dateStr)}
          style={{ cursor: 'pointer' }}
        >
          <div className="day-number">{day}</div>
          {dayData?.price && (
            <div className="day-price">₺{dayData.price}</div>
          )}
          {dayData?.notes && (
            <div className="day-notes" title={dayData.notes}>⚠️</div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="calendar-header">
          <button 
            onClick={() => handleMonthChange('prev')}
            className="month-nav-button"
          >
            ←
          </button>
          <h3>{monthNames[month]} {year}</h3>
          <button 
            onClick={() => handleMonthChange('next')}
            className="month-nav-button"
          >
            →
          </button>
        </div>
        <div className="calendar-weekdays">
          <div>Paz</div>
          <div>Pzt</div>
          <div>Sal</div>
          <div>Çar</div>
          <div>Per</div>
          <div>Cum</div>
          <div>Cmt</div>
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
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
            <h1>Müsaitlik Yönetimi</h1>
            <p>Hizmet müsaitlik takvimini yönet</p>
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
            <p>Müsaitlik takvimi yükleniyor...</p>
          </div>
        ) : (
          <div className="admin-card">
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Hizmet Seçin:
              </label>
              <select
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  minWidth: '200px'
                }}
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="availability-legend" style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '2rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#dcfce7', borderRadius: '4px' }}></div>
                <span>Müsait</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fef2f2', borderRadius: '4px' }}></div>
                <span>Müsait Değil</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#f0f9ff', borderRadius: '4px', border: '2px solid #3b82f6' }}></div>
                <span>Bugün</span>
              </div>
            </div>

            {renderCalendar()}
          </div>
        )}
      </div>

      <style jsx>{`
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .month-nav-button {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .month-nav-button:hover {
          background: #e2e8f0;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1rem;
          font-weight: 600;
          text-align: center;
        }

        .calendar-weekdays > div {
          padding: 0.75rem 0.5rem;
          background: #f8fafc;
          border-radius: 4px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
        }

        .calendar-day {
          aspect-ratio: 1;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 80px;
          position: relative;
        }

        .calendar-day.empty {
          background: #f8fafc;
          cursor: default;
        }

        .calendar-day.available {
          background: #dcfce7;
          border-color: #bbf7d0;
        }

        .calendar-day.unavailable {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .calendar-day.today {
          border: 2px solid #3b82f6;
          background: #f0f9ff;
        }

        .calendar-day:not(.empty):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .day-number {
          font-weight: 600;
          font-size: 1rem;
        }

        .day-price {
          font-size: 0.75rem;
          color: #059669;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .day-notes {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}