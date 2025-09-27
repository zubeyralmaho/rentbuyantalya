import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch published general FAQs ordered by display_order
    const { data: faqs, error } = await supabase
      .from('general_faqs')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch general FAQs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      faqs: faqs || [],
      success: true
    });
  } catch (error) {
    console.error('General FAQs API error:', error);
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
      question_tr,
      question_en,
      question_ru,
      question_ar,
      answer_tr,
      answer_en,
      answer_ru,
      answer_ar,
      display_order,
      published
    } = body;

    // Validate required fields
    if (!question_tr || !answer_tr) {
      return NextResponse.json(
        { error: 'Turkish question and answer are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('general_faqs')
      .insert({
        question_tr,
        question_en,
        question_ru,
        question_ar,
        answer_tr,
        answer_en,
        answer_ru,
        answer_ar,
        display_order: display_order || 0,
        published: published !== undefined ? published : true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create general FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      faq: data,
      success: true
    });
  } catch (error) {
    console.error('General FAQs API error:', error);
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
        { error: 'FAQ ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('general_faqs')
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
        { error: 'Failed to update FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      faq: data,
      success: true
    });
  } catch (error) {
    console.error('General FAQs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}