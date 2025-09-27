import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('Simple login attempt:', { email, hasPassword: !!password });
    console.log('Received password:', JSON.stringify(password));

    // Geçici olarak hardcoded admin bilgileri
    const ADMIN_EMAIL = 'admin@rentbuyantalya.com';
    const ADMIN_PASSWORD = 'password';

    console.log('Expected email:', JSON.stringify(ADMIN_EMAIL));
    console.log('Expected password:', JSON.stringify(ADMIN_PASSWORD));
    console.log('Email match:', email === ADMIN_EMAIL);
    console.log('Password match:', password === ADMIN_PASSWORD);

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('Login successful with hardcoded credentials');
      
      const adminData = {
        id: '087ef190-fdc4-4602-ac9e-2694fd3eee79',
        email: ADMIN_EMAIL,
        role: 'super_admin',
        active: true
      };

      return NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        admin: adminData
      });
    } else {
      console.log('Invalid credentials');
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}