import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';

// Environment variables Next.js'te otomatik yüklenir, ekstra require gerekmez

export async function POST(request: NextRequest) {
  let client: Client | null = null;

  try {
    const { email, password } = await request.json();

    console.log('Database login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // PostgreSQL client ile direkt bağlantı
    client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    await client.connect();
    console.log('✅ Database connected');

    // Admin kullanıcıyı sorgula
    const query = `
      SELECT id, email, password_hash, full_name, role, active, last_login_at, created_at
      FROM public.admin_users 
      WHERE email = $1 AND active = true
      LIMIT 1
    `;
    
    const result = await client.query(query, [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin not found');
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    const admin = result.rows[0];
    console.log('✅ Admin found:', { id: admin.id, email: admin.email, role: admin.role });

    // Şifreyi doğrula
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı adı veya şifre' },
        { status: 401 }
      );
    }

    // Login zamanını güncelle
    const updateQuery = `
      UPDATE public.admin_users 
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `;
    
    await client.query(updateQuery, [admin.id]);

    console.log('✅ Login successful');

    // Admin bilgilerini döndür
    const adminData = {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      active: admin.active,
      last_login_at: admin.last_login_at,
      created_at: admin.created_at
    };

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      admin: adminData
    });

  } catch (error) {
    console.error('❌ Database login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}