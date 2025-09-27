import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('service');

    let query = supabase
      .from('faqs')
      .select('*')
      .eq('active', true);

    // Service type filtresi ekle
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data: faqs, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'FAQ\'lar alınırken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faqs: faqs || []
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Admin yetkisi kontrolü (basit implementation, daha güvenli yollar da var)
    const body = await request.json();
    
    const { data: newFaq, error } = await supabase
      .from('faqs')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      return NextResponse.json(
        { error: 'FAQ oluşturulurken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faq: newFaq
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data: updatedFaq, error } = await supabase
      .from('faqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating FAQ:', error);
      return NextResponse.json(
        { error: 'FAQ güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      faq: updatedFaq
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'FAQ ID gerekli' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FAQ:', error);
      return NextResponse.json(
        { error: 'FAQ silinirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}