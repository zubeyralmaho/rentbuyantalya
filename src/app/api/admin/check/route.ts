import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Checking admin users...');
    
    const supabase = createServiceClient();
    
    // Admin kullanıcıları listele
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Admin users found:', admins?.length || 0);

    return NextResponse.json({
      success: true,
      adminCount: admins?.length || 0,
      admins: admins?.map(admin => ({
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        active: admin.active,
        created_at: admin.created_at
      })) || []
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}