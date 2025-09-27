import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get('featured');

    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('active', true);

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: campaigns, error } = await query.order('featured', { ascending: false }).order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      success: true
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      title_tr,
      title_en,
      title_ru,
      title_ar,
      description_tr,
      description_en,
      description_ru,
      description_ar,
      content_tr,
      content_en,
      content_ru,
      content_ar,
      discount_percentage,
      discount_amount,
      valid_from,
      valid_until,
      image_url,
      campaign_code,
      active,
      featured
    } = body;

    // Validate required fields
    if (!title_tr || !description_tr || !content_tr) {
      return NextResponse.json(
        { error: 'Turkish title, description and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        title_tr,
        title_en,
        title_ru,
        title_ar,
        description_tr,
        description_en,
        description_ru,
        description_ar,
        content_tr,
        content_en,
        content_ru,
        content_ar,
        discount_percentage,
        discount_amount,
        valid_from,
        valid_until,
        image_url,
        campaign_code,
        active: active !== undefined ? active : true,
        featured: featured !== undefined ? featured : false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: data,
      success: true
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaign: data,
      success: true
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}