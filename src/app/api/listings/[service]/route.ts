import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
    const { service } = await params
    const url = new URL(request.url)
    const segmentParam = url.searchParams.get('segment') || '' // comma-separated segment slugs or ui ids
    const segmentIdParam = url.searchParams.get('segmentId') || '' // comma-separated UUIDs
    const canonicalService = (() => {
      switch (service) {
        // Car rental mappings
        case 'rent-a-car':
        case 'arenda-avtomobiley':
        case 'arenda-avtomobilej':
          return 'car-rental'
        
        // Other service mappings (URL -> DB slug)
        case 'villa-rental':
          return 'villa-rental'
        case 'apart-rental':
          return 'apart-rental'
        case 'boat-rental':
          return 'boat-rental'
        case 'vip-transfer':
          return 'vip-transfer'
        case 'properties-for-sale':
          return 'properties-for-sale'
        
        default:
          return service
      }
    })()
    const supabase = await createClient()
    
    console.log('API Debug - Listings route:', {
      originalService: service,
      canonicalService: canonicalService,
      searchingSlugs: [canonicalService, service]
    });
    
    // Get service to verify it exists - try multiple possible slugs
    const possibleSlugs = [canonicalService, service];
    const uniqueSlugs = [...new Set(possibleSlugs)];
    
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id, name, slug, icon, description')
      .in('slug', uniqueSlugs)
      .eq('active', true)
      .single()

    console.log('Service lookup result:', {
      serviceData,
      serviceError,
      hasData: !!serviceData
    });

    // If the service does not exist or is not active, return an empty dataset
    // instead of 404 so the client UI can render gracefully with zero items.
    if (serviceError || !serviceData) {
      return NextResponse.json({
        success: true,
        data: {
          service: null,
          listings: []
        }
      })
    }

    // Get all listings for this service
    let query = supabase
      .from('listings')
      .select(`
        id,
        name,
        slug,
        images,
        storage_paths,
        storage_bucket,
        features,
        price_range_min,
        price_range_max,
        price_per_day,
        daily_price,
        location,
        description,
        sort_order,
        segment_id,
        car_segments!segment_id ( id, slug )
      `)
      .eq('service_id', serviceData.id)
      .eq('active', true)

    // Optional filtering by car segment
    const segmentIds: string[] = []
    if (segmentIdParam) {
      segmentIdParam.split(',').map(s => s.trim()).filter(Boolean).forEach(id => segmentIds.push(id))
    }
    if (segmentParam) {
      // Map UI ids to canonical slugs in DB
      const mapUiToSlug = (val: string) => {
        const v = val.toLowerCase()
        if (v === 'ekonomik' || v === 'economy' || v === 'economic') return 'economic'
        if (v === 'orta' || v === 'mid' || v === 'mid-class' || v === 'middle') return 'mid-class'
        if (v === 'premium' || v === 'ust' || v === 'luxury') return 'premium'
        if (v === 'atv-jeep' || v === 'atv' || v === 'jeep') return 'atv-jeep'
        if (v === 'komfort' || v === 'comfort' || v === 'comfort-class') return 'comfort'
        return v
      }
      const raw = segmentParam.split(',').map(s => s.trim()).filter(Boolean)
      const slugs = Array.from(new Set(raw.map(mapUiToSlug)))
      if (slugs.length > 0) {
        const { data: segRows, error: segErr } = await supabase
          .from('car_segments')
          .select('id, slug')
          .in('slug', slugs)
        if (!segErr && segRows && segRows.length > 0) {
          segRows.forEach((r: any) => segmentIds.push(r.id))
        }
      }
    }

    if (segmentIds.length > 0) {
      try {
        query = query.in('segment_id', segmentIds)
      } catch {
        // If schema lacks segment_id, skip server-side filter; client can categorize
      }
    }

    const { data: listings, error: listingsError } = await query.order('sort_order')

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        service: serviceData,
        listings: listings || []
      }
    })

  } catch (error) {
    console.error('Error fetching service listings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}