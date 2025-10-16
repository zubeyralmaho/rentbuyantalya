import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') || 'tr'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')
    const location = url.searchParams.get('location')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const capacity = url.searchParams.get('capacity')
    
    const supabase = await createClient()
    
    // Build query for VIP transfers
    let query = supabase
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
      .eq('services.slug', 'vip-transfer')
      .eq('active', true)
    
    // Apply filters
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (minPrice) {
      query = query.gte('price_per_day', parseInt(minPrice))
    }
    
    if (maxPrice) {
      query = query.lte('price_per_day', parseInt(maxPrice))
    }

    if (capacity) {
      query = query.contains('metadata', { capacity: parseInt(capacity) })
    }
    
    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    const { data: listings, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching VIP transfer listings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch VIP transfer listings' },
        { status: 500 }
      )
    }
    
    // Filter translations for the requested locale
    const processedListings = listings?.map(listing => {
      const translation = listing.listings_i18n?.find((t: any) => t.locale === locale)
      if (translation) {
        listing.listings_i18n = [translation]
      }
      return listing
    }) || []
    
    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('listings')
      .select('*, services:service_id!inner(slug)', { count: 'exact', head: true })
      .eq('services.slug', 'vip-transfer')
      .eq('active', true)
    
    if (countError) {
      console.error('Error getting count:', countError)
    }
    
    return NextResponse.json({
      data: {
        listings: processedListings,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Error in VIP transfer listings API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}