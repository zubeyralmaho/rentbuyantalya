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
    
    // Get property for sale listing with service and i18n info
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
      .eq('services.slug', 'properties-for-sale')
      .eq('active', true)
      .single()

    if (listingError || !listing) {
      console.error('Property for sale listing not found:', listingError);
      return NextResponse.json(
        { error: 'Property for sale listing not found' },
        { status: 404 }
      )
    }

    // Filter translations for the requested locale
    const translation = listing.listings_i18n?.find((t: any) => t.locale === locale);
    if (translation) {
      listing.listings_i18n = [translation];
    }

    // Properties for sale don't need availability data, but we can add property-specific info
    // like viewing appointments, price history, etc. in the future

    return NextResponse.json({
      listing,
      availability: [] // Properties don't have daily availability like rentals
    })

  } catch (error) {
    console.error('Error in properties for sale API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}