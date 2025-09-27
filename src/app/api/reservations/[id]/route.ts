import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'id ve status gerekli' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Reservation update error:', error)
      return NextResponse.json({ error: 'Rezervasyon güncellenemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true, reservation: data })
  } catch (e) {
    console.error('Reservations PATCH error:', e)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
