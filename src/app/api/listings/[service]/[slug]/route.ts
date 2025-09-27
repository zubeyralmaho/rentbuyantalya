import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string; slug: string }> }
) {
  try {
    const { service, slug } = await params
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'tr'
    
    const supabase = await createClient()
    
    // Get listing with service and i18n info
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        services:service_id!inner (
          id,
          name,
          slug,
          icon
        ),
        listings_i18n!left (
          title,
          description,
          locale
        )
      `)
      .eq('slug', slug)
      .eq('services.slug', service)
      .eq('active', true)
      .single()

    if (listingError || !listing) {
      console.error('Listing not found:', listingError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Filter translations for the requested locale
    const translation = listing.listings_i18n?.find((t: any) => t.locale === locale);
    if (translation) {
      listing.listings_i18n = [translation];
    }

    // Get availability data for the next 3 months
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    const { data: availability, error: availabilityError } = await supabase
      .from('listing_availability')
      .select('date, is_available, price, min_nights')
      .eq('listing_id', listing.id)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', threeMonthsLater.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (availabilityError) {
      console.error('Availability fetch error:', availabilityError);
    }

    return NextResponse.json({
      success: true,
      listing: listing,
      availability: availability || []
    })

  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}