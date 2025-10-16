import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'tr'
    
    const supabase = await createClient()
    
    // Get villa rental listing with service and i18n info
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
      .eq('services.slug', 'villa-rental')
      .eq('active', true)
      .single()

    if (listingError || !listing) {
      console.error('Villa rental listing not found:', listingError);
      return NextResponse.json(
        { error: 'Villa rental listing not found' },
        { status: 404 }
      )
    }

    // Filter translations for the requested locale
    const translation = listing.listings_i18n?.find((t: any) => t.locale === locale);
    if (translation) {
      listing.listings_i18n = [translation];
    }

    // Get availability data for the next 90 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + 90)
    
    const { data: availability, error: availabilityError } = await supabase
      .from('listing_availability')
      .select('*')
      .eq('listing_id', listing.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date')

    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
    }

    return NextResponse.json({
      listing,
      availability: availability || []
    })

  } catch (error) {
    console.error('Error in villa rental API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}