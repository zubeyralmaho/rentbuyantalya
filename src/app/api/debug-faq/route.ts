import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test database connection and table structure
    const { data: tableInfo, error: infoError } = await supabase
      .from('faqs')
      .select('*')
      .limit(1);

    if (infoError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: infoError
      });
    }

    // Test service type query
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('service_type', 'rent-a-car');

    return NextResponse.json({
      success: true,
      message: 'FAQ table accessible',
      sampleData: tableInfo,
      serviceQuery: faqs,
      error: error
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error
    });
  }
}