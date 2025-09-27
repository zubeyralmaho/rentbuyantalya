import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || 'tr';
    
    const supabase = await createClient();
    
    // Get services with localized info
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        id,
        name,
        slug,
        icon,
        sort_order,
        services_i18n!inner (
          title,
          slug,
          locale
        )
      `)
      .eq('active', true)
      .eq('services_i18n.locale', locale)
      .order('sort_order');

    if (error) {
      console.error('Error fetching services:', error);
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }

    // Transform the data to use standard English slugs but localized titles
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      slug: service.slug, // Use base slug (always English)
      title: service.services_i18n[0]?.title || service.name,
      icon: service.icon,
      sort_order: service.sort_order
    }));

    return NextResponse.json({ 
      success: true, 
      services: transformedServices 
    });

  } catch (error) {
    console.error('Error in services API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage 
    }, { status: 500 });
  }
}