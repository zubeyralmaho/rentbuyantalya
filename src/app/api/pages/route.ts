import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const pageType = searchParams.get('type');
    const slug = searchParams.get('slug');

    let query = supabase
      .from('pages')
      .select('*')
      .eq('published', true);

    if (pageType) {
      query = query.eq('page_type', pageType);
    }

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: pages, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pages: pages || [],
      success: true
    });
  } catch (error) {
    console.error('Pages API error:', error);
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
      page_type,
      slug,
      title_tr,
      title_en,
      title_ru,
      title_ar,
      content_tr,
      content_en,
      content_ru,
      content_ar,
      meta_title_tr,
      meta_title_en,
      meta_title_ru,
      meta_title_ar,
      meta_description_tr,
      meta_description_en,
      meta_description_ru,
      meta_description_ar,
      published,
      featured
    } = body;

    // Validate required fields
    if (!page_type || !slug || !title_tr || !content_tr) {
      return NextResponse.json(
        { error: 'Page type, slug, Turkish title and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pages')
      .insert({
        page_type,
        slug,
        title_tr,
        title_en,
        title_ru,
        title_ar,
        content_tr,
        content_en,
        content_ru,
        content_ar,
        meta_title_tr,
        meta_title_en,
        meta_title_ru,
        meta_title_ar,
        meta_description_tr,
        meta_description_en,
        meta_description_ru,
        meta_description_ar,
        published: published !== undefined ? published : false,
        featured: featured !== undefined ? featured : false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      page: data,
      success: true
    });
  } catch (error) {
    console.error('Pages API error:', error);
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
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('pages')
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
        { error: 'Failed to update page' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      page: data,
      success: true
    });
  } catch (error) {
    console.error('Pages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}