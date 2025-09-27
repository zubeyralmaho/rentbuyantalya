import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_id = searchParams.get('listing_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!listing_id) {
      return NextResponse.json(
        { error: 'listing_id gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Base query
    let availabilityQuery = supabase
      .from('listing_availability')
      .select('*')
      .eq('listing_id', listing_id)
      .order('date', { ascending: true });

    // Tarih filtresi ekle
    if (start_date) {
      availabilityQuery = availabilityQuery.gte('date', start_date);
    }
    if (end_date) {
      availabilityQuery = availabilityQuery.lte('date', end_date);
    }

    const { data: availability, error: availabilityError } = await availabilityQuery;

    if (availabilityError) {
      console.error('Availability fetch error:', availabilityError);
      return NextResponse.json(
        { error: 'Müsaitlik bilgileri alınamadı' },
        { status: 500 }
      );
    }

    // Rezervasyonları da kontrol et
    let reservationsQuery = supabase
      .from('reservations')
      .select('start_date, end_date, status')
      .eq('listing_id', listing_id)
      .in('status', ['confirmed', 'pending']);

    if (start_date && end_date) {
      reservationsQuery = reservationsQuery.or(
        `start_date.lte.${end_date},end_date.gte.${start_date}`
      );
    }

    const { data: reservations, error: reservationsError } = await reservationsQuery;

    if (reservationsError) {
      console.error('Reservations fetch error:', reservationsError);
      return NextResponse.json(
        { error: 'Rezervasyon bilgileri alınamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      availability: availability || [],
      reservations: reservations || []
    });

  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Bu endpoint admin paneli için - auth kontrolü eklenebilir
    const body = await request.json();
    const { listing_id, date, is_available, price, min_nights, notes } = body;

    if (!listing_id || !date) {
      return NextResponse.json(
        { error: 'listing_id ve date gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: availability, error } = await supabase
      .from('listing_availability')
      .upsert({
        listing_id,
        date,
        is_available: is_available !== undefined ? is_available : true,
        price,
        min_nights: min_nights || 1,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Availability upsert error:', error);
      return NextResponse.json(
        { error: 'Müsaitlik güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      availability
    });

  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Bulk update için
    const body = await request.json();
    const { listing_id, updates } = body;

    if (!listing_id || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'listing_id ve updates array gerekli' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Batch upsert
    const upsertData = updates.map(update => ({
      listing_id,
      date: update.date,
      is_available: update.is_available !== undefined ? update.is_available : true,
      price: update.price,
      min_nights: update.min_nights || 1,
      notes: update.notes
    }));

    const { data: availability, error } = await supabase
      .from('listing_availability')
      .upsert(upsertData)
      .select();

    if (error) {
      console.error('Bulk availability upsert error:', error);
      return NextResponse.json(
        { error: 'Müsaitlik toplu güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: availability?.length || 0,
      availability
    });

  } catch (error) {
    console.error('Availability PUT error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}