import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { 
          error: 'Supabase not configured',
          video_url: '/herovideo.mp4',
          fallback_image_url: '/hero-bg.jpg',
          is_active: true,
          title: 'RENT&BUY',
          subtitle: 'Rent the Difference'
        }, 
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from('hero_video_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching hero video settings:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch hero video settings',
          video_url: '/herovideo.mp4',
          fallback_image_url: '/hero-bg.jpg',
          is_active: true,
          title: 'RENT&BUY',
          subtitle: 'Rent the Difference'
        }, 
        { status: 200 } // Return default values even if error
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error occurred',
        video_url: '/herovideo.mp4',
        fallback_image_url: '/hero-bg.jpg',
        is_active: true,
        title: 'RENT&BUY',
        subtitle: 'Rent the Difference'
      }, 
      { status: 200 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { video_url, fallback_image_url, is_active, title, subtitle } = body;

    // Get current user to check admin status
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('hero_video_settings')
      .update({
        video_url,
        fallback_image_url,
        is_active,
        title,
        subtitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1) // Assuming there's only one hero settings record
      .select()
      .single();

    if (error) {
      console.error('Error updating hero video settings:', error);
      return NextResponse.json({ error: 'Failed to update hero video settings' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}