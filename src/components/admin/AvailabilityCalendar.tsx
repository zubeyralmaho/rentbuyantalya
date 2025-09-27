'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

interface ListingAvailability {
  id: string
  listing_id: string
  date: string // yyyy-mm-dd
  is_available: boolean
  price?: number
  min_nights?: number
  notes?: string
}

interface Reservation {
  id: string
  listing_id: string
  customer_name: string
  start_date: string
  end_date: string
  status: ReservationStatus
}

interface AvailabilityApiResponse {
  availability: ListingAvailability[]
  reservations: Pick<Reservation, 'start_date' | 'end_date' | 'status'>[] & any
}

interface Props {
  listingId: string
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, 1)
}

function dateInRange(date: Date, start: Date, end: Date): boolean {
  const x = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return x >= s && x <= e
}

export default function AvailabilityCalendar({ listingId }: Props) {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [availability, setAvailability] = useState<ListingAvailability[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])

  // selection for bulk ops
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [panelDate, setPanelDate] = useState<Date | null>(null)

  const monthStart = useMemo(() => startOfMonth(month), [month])
  const monthEnd = useMemo(() => endOfMonth(month), [month])

  const daysInMonth = useMemo(() => monthEnd.getDate(), [monthEnd])
  const firstWeekday = useMemo(() => monthStart.getDay(), [monthStart]) // 0=Sun

  const fetchData = useCallback(async () => {
    if (!listingId) return
    setLoading(true)
    setError('')
    try {
      const start = formatDate(monthStart)
      const end = formatDate(monthEnd)
      const url = `/api/availability?listing_id=${encodeURIComponent(listingId)}&start_date=${start}&end_date=${end}`
      const res = await fetch(url)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Yükleme hatası: ${res.status}`)
      }
      const data = (await res.json()) as AvailabilityApiResponse

      setAvailability(Array.isArray(data.availability) ? data.availability : [])
      // Map reservations into simpler objects for overlap checks if needed
      // The API returns minimal fields; enrich only for local checks
      setReservations(
        (Array.isArray((data as any).reservations) ? (data as any).reservations : []).map((r: any) => ({
          id: r.id || `${r.start_date}-${r.end_date}-${r.status}`,
          listing_id: listingId,
          customer_name: r.customer_name || 'Rezervasyon',
          start_date: r.start_date,
          end_date: r.end_date,
          status: r.status as ReservationStatus,
        }))
      )
    } catch (e: any) {
      setError(e.message || 'Veri alınamadı')
    } finally {
      setLoading(false)
    }
  }, [listingId, monthStart, monthEnd])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const dayStatus = useCallback(
    (date: Date): 'reserved' | 'blocked' | 'available' | 'partial' => {
      // Reserved if any reservation overlaps the date (pending or confirmed)
      const iso = formatDate(date)
      const isReserved = reservations.some((r) => {
        const s = new Date(r.start_date)
        const e = new Date(r.end_date)
        return dateInRange(date, s, e) && (r.status === 'pending' || r.status === 'confirmed')
      })
      if (isReserved) return 'reserved'

      const entry = availability.find((a) => a.date === iso)
      if (entry && entry.is_available === false) return 'blocked'

      return 'available'
    },
    [reservations, availability]
  )

  const inSelectedRange = useCallback(
    (date: Date) => {
      if (!rangeStart) return false
      if (!rangeEnd) return formatDate(date) === formatDate(rangeStart)
      return dateInRange(date, rangeStart, rangeEnd)
    },
    [rangeStart, rangeEnd]
  )

  const onDayClick = (date: Date) => {
    const status = dayStatus(date)
    if (status === 'reserved') {
      setPanelDate(date)
      return
    }

    // Handle range selection for bulk block/unblock
    if (!rangeStart) {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }
    if (rangeStart && !rangeEnd) {
      // If clicking earlier than start, swap
      if (date < rangeStart) {
        setRangeEnd(rangeStart)
        setRangeStart(date)
      } else {
        setRangeEnd(date)
      }
      return
    }
    // Reset selection if both set
    setRangeStart(date)
    setRangeEnd(null)
  }

  async function toggleBlockSingle(date: Date) {
    const iso = formatDate(date)
    const status = dayStatus(date)
    const makeAvailable = status === 'blocked'
    const payload = {
      listing_id: listingId,
      date: iso,
      is_available: makeAvailable,
    }
    const res = await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || 'Güncellenemedi')
    }
  }

  async function bulkUpdate(block: boolean) {
    if (!rangeStart) return
    const end = rangeEnd || rangeStart
    // Build dates array
    const updates: { date: string; is_available: boolean }[] = []
    const cur = new Date(rangeStart)
    while (cur <= end) {
      updates.push({ date: formatDate(cur), is_available: !block ? true : false })
      cur.setDate(cur.getDate() + 1)
    }

    const res = await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, updates }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || 'Toplu güncelleme başarısız')
    }
    setRangeStart(null)
    setRangeEnd(null)
  }

  const days: Date[] = useMemo(() => {
    const arr: Date[] = []
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i))
    }
    return arr
  }, [daysInMonth, monthStart])

  return (
    <div className="availability-calendar">
      <div className="cal-header">
        <div className="cal-title">
          <button className="cal-nav" onClick={() => setMonth((m) => addMonths(m, -1))}>{'<'}</button>
          <span>
            {monthStart.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
          </span>
          <button className="cal-nav" onClick={() => setMonth((m) => addMonths(m, 1))}>{'>'}</button>
        </div>
        <div className="cal-actions">
          <button
            className="cal-btn"
            onClick={async () => {
              try {
                if (rangeStart) {
                  await bulkUpdate(true)
                } else {
                  // toggle the day under panelDate if selection empty
                  // find today or do nothing
                }
                await fetchData()
              } catch (e: any) {
                setError(e.message)
              }
            }}
            disabled={!rangeStart}
            title="Seçili günleri kapat"
          >
            Günleri Kapat
          </button>
          <button
            className="cal-btn"
            onClick={async () => {
              try {
                if (rangeStart) {
                  await bulkUpdate(false)
                }
                await fetchData()
              } catch (e: any) {
                setError(e.message)
              }
            }}
            disabled={!rangeStart}
            title="Seçili günleri aç"
          >
            Günleri Aç
          </button>
          <button className="cal-btn" onClick={() => { setRangeStart(null); setRangeEnd(null) }} disabled={!rangeStart}>
            Seçimi Temizle
          </button>
        </div>
      </div>

      {error ? (
        <div className="cal-error">{error}</div>
      ) : null}

      <div className={`cal-grid ${loading ? 'loading' : ''}`}>
        {/* Weekday headers (Mon-Sun with TR locale starting Monday visually but JS getDay starts Sunday) */}
        {['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((w) => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
        {/* Leading blanks */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} className="cal-blank" />
        ))}
        {/* Days */}
        {days.map((d) => {
          const status = dayStatus(d)
          const iso = formatDate(d)
          const selected = inSelectedRange(d)
          return (
            <button
              key={iso}
              className={`cal-day ${status} ${selected ? 'selected' : ''}`}
              onClick={async () => {
                try {
                  // If Ctrl/Cmd click: quick toggle single block/unblock when not reserved
                  if (status !== 'reserved' && (window.event as MouseEvent).ctrlKey) {
                    await toggleBlockSingle(d)
                    await fetchData()
                    return
                  }
                  onDayClick(d)
                } catch (e: any) {
                  setError(e.message)
                }
              }}
              title={
                status === 'reserved'
                  ? 'Rezervasyon mevcut'
                  : status === 'blocked'
                  ? 'Kapalı gün'
                  : 'Müsait'
              }
            >
              <span className="date">{d.getDate()}</span>
              <span className="badge">{status === 'reserved' ? 'R' : status === 'blocked' ? 'X' : ''}</span>
            </button>
          )
        })}
      </div>

      {/* Simple legend */}
      <div className="cal-legend">
        <span className="lg it-available" /> Müsait
        <span className="lg it-blocked" /> Kapalı
        <span className="lg it-reserved" /> Rezervasyon
      </div>

      {/* Reservation side panel for a specific day */}
      {panelDate && (
        <ReservationPanel
          date={panelDate}
          listingId={listingId}
          onClose={() => setPanelDate(null)}
          onChanged={async () => { await fetchData(); setPanelDate(null) }}
        />
      )}

      <style jsx>{`
        .availability-calendar { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fff; }
        .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 12px; flex-wrap: wrap; }
        .cal-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
        .cal-nav { padding: 4px 8px; border: 1px solid #374151; background: #374151; color: #ffffff; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .cal-nav:hover { background: #4b5563; border-color: #4b5563; }
        .cal-actions { display: flex; gap: 8px; }
        .cal-btn { padding: 6px 10px; border: 1px solid #374151; background: #374151; color: #ffffff; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .cal-btn:hover { background: #4b5563; border-color: #4b5563; }
        .cal-btn:disabled { opacity: .5; cursor: not-allowed; background: #9ca3af; border-color: #9ca3af; }
        .cal-error { color: #b91c1c; margin-bottom: 8px; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .cal-weekday { text-align: center; font-size: 12px; color: #6b7280; padding: 4px 0; }
        .cal-blank { height: 40px; }
        .cal-day { position: relative; height: 56px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; text-align: left; padding: 6px; cursor: pointer; }
        .cal-day .date { font-size: 12px; color: #111827; font-weight: 500; }
        .cal-day .badge { position: absolute; top: 6px; right: 6px; font-size: 11px; color: #374151; font-weight: 600; }
        .cal-day.available { background: #f8fdf8; border-color: #86efac; color: #166534; }
        .cal-day.available .date { color: #166534; }
        .cal-day.available .badge { color: #166534; }
        .cal-day.blocked { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
        .cal-day.blocked .date { color: #dc2626; }
        .cal-day.blocked .badge { color: #dc2626; }
        .cal-day.reserved { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
        .cal-day.reserved .date { color: #2563eb; }
        .cal-day.reserved .badge { color: #2563eb; }
        .cal-day.selected { outline: 2px solid #4f46e5; }
        .cal-legend { display: flex; gap: 12px; align-items: center; margin-top: 10px; font-size: 12px; color: #374151; }
        .cal-legend .lg { display: inline-block; width: 12px; height: 12px; border: 1px solid #e5e7eb; margin: 0 6px; border-radius: 3px; vertical-align: middle; }
        .it-available { background: #fff; }
        .it-blocked { background: #fee2e2; }
        .it-reserved { background: #dbeafe; }
      `}</style>
    </div>
  )
}

function ReservationPanel({ date, listingId, onClose, onChanged }: { date: Date; listingId: string; onClose: () => void; onChanged: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<Reservation[]>([])

  const iso = formatDate(date)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/reservations?listing_id=${encodeURIComponent(listingId)}&limit=100`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Rezervasyonlar alınamadı')
      }
      const j = await res.json()
      const list: Reservation[] = (j.reservations || []).filter((r: any) => {
        const s = new Date(r.start_date)
        const e = new Date(r.end_date)
        return dateInRange(date, s, e)
      })
      setItems(list)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [listingId, date])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: ReservationStatus) {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error || 'Durum güncellenemedi')
    }
  }

  return (
    <div className="res-panel">
      <div className="res-header">
        <strong>{iso}</strong>
        <button onClick={onClose} className="close-btn">Kapat</button>
      </div>
      {loading ? <div className="muted">Yükleniyor…</div> : null}
      {error ? <div className="err">{error}</div> : null}
      {items.length === 0 && !loading ? (
        <div className="muted">Bu güne ait rezervasyon bulunamadı.</div>
      ) : (
        <div className="res-list">
          {items.map((r) => (
            <div key={r.id} className="res-item">
              <div className="res-main">
                <div className="res-title">{r.customer_name}</div>
                <div className="res-dates">{r.start_date} → {r.end_date}</div>
              </div>
              <div className="res-actions">
                <select
                  defaultValue={r.status}
                  onChange={async (e) => {
                    try {
                      await updateStatus(r.id, e.target.value as ReservationStatus)
                      await load()
                      await onChanged()
                    } catch (er: any) {
                      setError(er.message)
                    }
                  }}
                >
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="cancelled">İptal</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .res-panel { position: fixed; right: 16px; bottom: 16px; width: 360px; max-width: 90vw; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,.08); padding: 12px; z-index: 50; }
        .res-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .close-btn { border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
        .muted { color: #6b7280; font-size: 14px; }
        .err { color: #b91c1c; font-size: 14px; margin: 6px 0; }
        .res-list { display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow: auto; }
        .res-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .res-title { font-weight: 600; }
        .res-dates { font-size: 12px; color: #6b7280; }
      `}</style>
    </div>
  )
}
