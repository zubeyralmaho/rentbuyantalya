import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt:', { email, hasPassword: !!password });
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 30) + '...'
    });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

        const supabase = createServiceClient();

    // Admin kullanıcıyı kontrol et
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('active', true)
      .single();

    console.log('Admin query result:', { 
      admin: admin ? { id: admin.id, email: admin.email, role: admin.role } : null, 
      error: adminError 
    });

    if (adminError || !admin) {
      console.error('Admin not found or error:', adminError);
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi doğrula
    console.log('Comparing passwords:', {
      inputPassword: password,
      storedHash: admin.password_hash,
      hashStartsWith: admin.password_hash?.substring(0, 10)
    });
    
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    console.log('Password validation result:', { 
      isPasswordValid, 
      hashLength: admin.password_hash?.length,
      hashIsString: typeof admin.password_hash === 'string'
    });

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Son giriş tarihini güncelle
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    if (updateError) {
      console.error('Update last login error:', updateError);
    }

    // Admin session bilgilerini döndür (şifre hariç)
    const { password_hash, ...adminData } = admin;
    
    return NextResponse.json({
      success: true,
      admin: adminData
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}