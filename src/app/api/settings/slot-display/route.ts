import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/admin-auth';

// GET: Public endpoint to check if slot numbers should be shown
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('show_numbers, value')
      .eq('key', 'slot_display')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ show_numbers: true });
    }

    const showNumbers =
      typeof data.show_numbers === 'boolean'
        ? data.show_numbers
        : data.value?.show_numbers !== undefined
        ? Boolean(data.value.show_numbers)
        : true;

    return NextResponse.json({ show_numbers: showNumbers });
  } catch (err) {
    console.error('Error fetching slot display setting:', err);
    return NextResponse.json({ show_numbers: true });
  }
}

// POST: Admin endpoint to toggle slot numbers on/off
export async function POST(request: Request) {
  try {
    const authRes = await getAdminSession();
    if (!authRes.ok) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const showNumbers = Boolean(body.show_numbers);

    const supabase = createAdminClient();
    const { error } = await supabase.from('site_settings').upsert({
      key: 'slot_display',
      show_numbers: showNumbers,
      value: { show_numbers: showNumbers },
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving slot display setting:', error);
      return NextResponse.json({ message: 'Failed to save setting' }, { status: 500 });
    }

    return NextResponse.json({ success: true, show_numbers: showNumbers });
  } catch (err: any) {
    console.error('Error updating slot display setting:', err);
    return NextResponse.json({ message: err?.message || 'Server error' }, { status: 500 });
  }
}
