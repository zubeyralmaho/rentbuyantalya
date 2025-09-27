import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listing_id,
      customer_name,
      customer_email,
      customer_phone,
      start_date,
      end_date,
      guests_count,
      special_requests
    } = body;

    // Gerekli alanları kontrol et
    if (!listing_id || !customer_name || !customer_email || !customer_phone || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Tarihleri doğrula
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        { error: 'Başlangıç tarihi bugünden önce olamaz' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Bitiş tarihi başlangıç tarihinden sonra olmalı' },
        { status: 400 }
      );
    }

    // Müsaitlik kontrolü
    const { data: conflictingReservations, error: conflictError } = await supabase
      .from('reservations')
      .select('id')
      .eq('listing_id', listing_id)
      .in('status', ['confirmed', 'pending'])
      .or(`start_date.lte.${end_date},end_date.gte.${start_date}`);

    if (conflictError) {
      console.error('Conflict check error:', conflictError);
      return NextResponse.json(
        { error: 'Müsaitlik kontrolü başarısız' },
        { status: 500 }
      );
    }

    if (conflictingReservations && conflictingReservations.length > 0) {
      return NextResponse.json(
        { error: 'Seçilen tarihler için zaten rezervasyon mevcut' },
        { status: 409 }
      );
    }

    // Rezervasyonu oluştur
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert({
        listing_id,
        customer_name,
        customer_email,
        customer_phone,
        start_date,
        end_date,
        guests_count: guests_count || 1,
        special_requests,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Reservation insert error:', insertError);
      return NextResponse.json(
        { error: 'Rezervasyon oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation
    }, { status: 201 });

  } catch (error) {
    console.error('Reservation creation error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listing_id = searchParams.get('listing_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createClient();

    let query = supabase
      .from('reservations')
      .select(`
        *,
        listings:listing_id (
          id,
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (listing_id) {
      query = query.eq('listing_id', listing_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reservations, error } = await query;

    if (error) {
      console.error('Reservations fetch error:', error);
      return NextResponse.json(
        { error: 'Rezervasyonlar alınamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reservations: reservations || []
    });

  } catch (error) {
    console.error('Reservations GET error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}