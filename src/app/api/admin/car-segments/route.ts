import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'tr'
  const supabase = createServiceClient()
    // 1) Fetch base segments without referencing missing columns or relations
    const { data: base, error: baseErr } = await supabase
      .from('car_segments')
      .select('id, slug')
      .order('slug', { ascending: true })

    if (baseErr) {
      console.error('Error fetching car segments:', baseErr)
      return NextResponse.json({ error: 'Failed to fetch car segments' }, { status: 500 })
    }

    const baseSegments = base || []
    if (baseSegments.length === 0) {
      return NextResponse.json({ segments: [] })
    }

    // 2) Fetch i18n titles for provided locale
    const ids = baseSegments.map((r: any) => r.id)
    const { data: i18n, error: i18nErr } = await supabase
      .from('car_segments_i18n')
      .select('segment_id, title, locale')
      .eq('locale', locale)
      .in('segment_id', ids)

    if (i18nErr) {
      // Non-fatal: still return base segments with slug labels
      console.warn('Warning: car_segments_i18n fetch failed:', i18nErr)
    }

    const titleById = new Map<string, string>()
    ;(i18n || []).forEach((row: any) => {
      if (row && row.segment_id && row.title) titleById.set(row.segment_id, row.title)
    })

    const segments = baseSegments.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: titleById.get(row.id) || null,
    }))

    return NextResponse.json({ segments })
  } catch (e) {
    console.error('Unexpected error fetching car segments:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
