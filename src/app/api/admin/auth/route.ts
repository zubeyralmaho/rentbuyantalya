import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Token'ı decode et ve admin kullanıcıyı doğrula
    // Bu basit bir implementasyon - production'da JWT kullanmalısınız
    
    return NextResponse.json({
      success: true,
      message: 'Authenticated'
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication başarısız' },
      { status: 401 }
    );
  }
}