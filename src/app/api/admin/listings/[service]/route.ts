import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

// GET - List all listings for a service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
  const supabase = createServiceClient();
    const { service } = await params;
    const canonicalService = (() => {
      switch (service) {
        case 'car-rental':
        case 'arenda-avtomobiley':
        case 'arenda-avtomobilej':
          return 'rent-a-car';
        default:
          return service;
      }
    })();

    // Get service ID from service slug
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .in('slug', [canonicalService, service])
      .single();

    // Gracefully handle missing service for admin list view
    if (serviceError || !serviceData) {
      return NextResponse.json({ listings: [] });
    }

    // Get listings for this service
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        listings_i18n!inner (
          title,
          description,
          locale
        )
      `)
      .eq('service_id', serviceData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new listing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  try {
  const supabase = createServiceClient();
    const { service } = await params;
    const canonicalService = (() => {
      switch (service) {
        case 'car-rental':
        case 'arenda-avtomobiley':
        case 'arenda-avtomobilej':
          return 'rent-a-car';
        default:
          return service;
      }
    })();
    const body = await request.json();

    // Get service ID from service slug
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .in('slug', [canonicalService, service])
      .single();

    if (serviceError || !serviceData) {
      return NextResponse.json({ error: `Service not found for slug: ${service}` }, { status: 404 });
    }

    // Create listing (resilient to missing segment_id column)
    const basePayload: any = {
      service_id: serviceData.id,
      name: body.name || 'Untitled',
      slug: body.slug || 'untitled',
      // Write to both daily and range fields to support older schemas
      price_per_day: body.price_per_day,
      price_per_week: body.price_per_week,
      price_range_min: body.price_per_day ?? body.price_range_min,
      price_range_max: body.price_per_week ?? body.price_range_max,
      location: body.location,
      features: body.features || [],
      images: body.images || [],
      active: body.active !== false, // Changed from is_available to active
      sort_order: body.sort_order || 0
    }

  const insertPayload: any = { ...basePayload }
  // Optional columns that may not exist in older schemas
  if (body.segment_id) insertPayload.segment_id = body.segment_id
  if (Object.prototype.hasOwnProperty.call(body, 'metadata')) insertPayload.metadata = body.metadata
  if (Object.prototype.hasOwnProperty.call(body, 'storage_paths')) insertPayload.storage_paths = body.storage_paths
  if (Object.prototype.hasOwnProperty.call(body, 'storage_bucket')) insertPayload.storage_bucket = body.storage_bucket ?? 'listings'

    let listingError: any = null
    let listing: any = null
    {
      const res = await supabase
        .from('listings')
        .insert(insertPayload)
        .select()
        .single()
      listing = res.data
      listingError = res.error
    }

    if (listingError && (listingError.code === 'PGRST204' || /segment_id/i.test(String(listingError.message)))) {
      // Retry without segment_id
      const retryPayload = { ...insertPayload }
      delete retryPayload.segment_id
      const res2 = await supabase
        .from('listings')
        .insert(retryPayload)
        .select()
        .single()
      listing = res2.data
      listingError = res2.error
    }

    if (listingError && (listingError.code === 'PGRST204' || /(metadata|storage_paths|storage_bucket)/i.test(String(listingError.message)))) {
      // Retry stripping optional storage/metadata fields
      const retryPayload2 = { ...basePayload }
      const res3 = await supabase
        .from('listings')
        .insert(retryPayload2)
        .select()
        .single()
      listing = res3.data
      listingError = res3.error
    }

    if (listingError && listingError.code === 'PGRST204') {
      // Final fallback: strip additional optional fields that may not exist in older schemas
      const minimalPayload: any = {
        service_id: serviceData.id,
        name: body.name || 'Untitled',
        slug: body.slug || 'untitled',
        images: Array.isArray(body.images) ? body.images : [],
        features: Array.isArray(body.features) ? body.features : [],
        active: body.active !== false,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0
      }
      const res4 = await supabase
        .from('listings')
        .insert(minimalPayload)
        .select()
        .single()
      listing = res4.data
      listingError = res4.error
    }

    if (listingError) {
      console.error('Error creating listing:', listingError);
      const status = listingError.code === '23505' ? 409 : 500
      const msg = listingError.code === '23505' ? 'Aynı slug zaten mevcut' : (listingError.message || 'Failed to create listing')
      return NextResponse.json({ error: msg, details: listingError.hint || listingError.details, code: listingError.code }, { status });
    }

    // Create translations
    const translations = body.translations || {};
    for (const [locale, data] of Object.entries(translations)) {
      const translationData = data as { title: string; description: string; slug?: string };
      const derivedSlug = translationData.slug && translationData.slug.trim().length > 0
        ? translationData.slug.trim()
        : (slugify(translationData.title || '') || (body.slug || listing.slug || 'listing'));
      await supabase
        .from('listings_i18n')
        .upsert({
          listing_id: listing.id,
          locale,
          title: translationData.title,
          slug: derivedSlug,
          description: translationData.description
        }, { onConflict: 'listing_id,locale' });
    }

    // Fetch complete listing with translations for confirmation
    const { data: fullListing } = await supabase
      .from('listings')
      .select(`
        *,
        listings_i18n (
          title,
          description,
          locale,
          slug
        )
      `)
      .eq('id', listing.id)
      .single()

    return NextResponse.json({ success: true, listing: fullListing || listing });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}