import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: posts, error } = await query.order('featured', { ascending: false }).order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      posts: posts || [],
      success: true
    });
  } catch (error) {
    console.error('Blog API error:', error);
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
      slug,
      title_tr,
      title_en,
      title_ru,
      title_ar,
      excerpt_tr,
      excerpt_en,
      excerpt_ru,
      excerpt_ar,
      content_tr,
      content_en,
      content_ru,
      content_ar,
      featured_image,
      category,
      tags,
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
    if (!slug || !title_tr || !content_tr) {
      return NextResponse.json(
        { error: 'Slug, Turkish title and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        slug,
        title_tr,
        title_en,
        title_ru,
        title_ar,
        excerpt_tr,
        excerpt_en,
        excerpt_ru,
        excerpt_ar,
        content_tr,
        content_en,
        content_ru,
        content_ar,
        featured_image,
        category,
        tags,
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
        { error: 'Failed to create blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      post: data,
      success: true
    });
  } catch (error) {
    console.error('Blog API error:', error);
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
        { error: 'Blog post ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('blog_posts')
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
        { error: 'Failed to update blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      post: data,
      success: true
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}