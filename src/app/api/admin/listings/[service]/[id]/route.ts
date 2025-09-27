import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';

// GET - Get specific listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string; id: string }> }
) {
  try {
  const supabase = createServiceClient();
    const { id } = await params;

    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        listings_i18n (
          title,
          description,
          locale
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ service: string; id: string }> }
) {
  try {
  const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();

    // Update listing
    const baseUpdate: any = {
      name: body.name,
      slug: body.slug,
      price_per_day: body.price_per_day,
      price_per_week: body.price_per_week,
      price_range_min: body.price_per_day ?? body.price_range_min,
      price_range_max: body.price_per_week ?? body.price_range_max,
      location: body.location,
      features: body.features,
      images: body.images,
      active: body.active,
      sort_order: body.sort_order
    }

    // Start with a payload that includes optional fields if present
  const updatePayload: any = { ...baseUpdate }
    if (Object.prototype.hasOwnProperty.call(body, 'segment_id')) {
      updatePayload.segment_id = body.segment_id || null
    }
    if (Object.prototype.hasOwnProperty.call(body, 'metadata')) updatePayload.metadata = body.metadata
    if (Object.prototype.hasOwnProperty.call(body, 'storage_paths')) updatePayload.storage_paths = body.storage_paths
    if (Object.prototype.hasOwnProperty.call(body, 'storage_bucket')) updatePayload.storage_bucket = body.storage_bucket

    // Attempt database update
    const { data: updated, error: listingError } = await supabase
      .from('listings')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (listingError) {
      console.error('Error updating listing:', listingError);
      const status = listingError.code === '23505' ? 409 : 500
      const msg = listingError.code === '23505' ? 'Aynı slug zaten mevcut' : (listingError.message || 'Failed to update listing')
      return NextResponse.json({ error: msg, details: listingError.hint || listingError.details, code: listingError.code }, { status });
    }

    // Update translations
    if (body.translations) {
      for (const [locale, data] of Object.entries(body.translations)) {
        const translationData = data as { title: string; description: string; slug?: string };
        const derivedSlug = translationData.slug && translationData.slug.trim().length > 0
          ? translationData.slug.trim()
          : (slugify(translationData.title || '') || (body.slug || updated?.slug || 'listing'));

        const { error: upsertError } = await supabase
          .from('listings_i18n')
          .upsert({
            listing_id: id,
            locale,
            title: translationData.title,
            slug: derivedSlug,
            description: translationData.description
          }, { onConflict: 'listing_id,locale' });

        if (upsertError) {
          console.error('Error updating translation:', upsertError);
        }
      }
    }

  // Re-fetch complete listing with translations for confirmation
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
    .eq('id', id)
    .single()

  return NextResponse.json({ success: true, listing: fullListing || updated });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ service: string; id: string }> }
) {
  try {
  const supabase = createServiceClient();
    const { id } = await params;

    // Delete translations first
    await supabase
      .from('listings_i18n')
      .delete()
      .eq('listing_id', id);

    // Delete listing
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting listing:', error);
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}