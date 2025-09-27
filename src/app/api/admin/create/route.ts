import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email = 'admin@rentbuyantalya.com', password = 'admin123', fullName = 'Admin User' } = await request.json();
    
    console.log('Creating admin user:', { email, fullName });
    
    // Şifreyi hash'le
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hashed successfully');
    
    const supabase = createServiceClient();
    
    // Admin kullanıcı ekle veya güncelle
    const { data: admin, error } = await supabase
      .from('admin_users')
      .upsert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role: 'super_admin',
        active: true,
        updated_at: new Date().toISOString()
      })
      .select('id, email, full_name, role, active')
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Admin user created/updated:', admin);

    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcı başarıyla oluşturuldu/güncellendi',
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        active: admin.active
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}