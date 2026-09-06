import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

// GET: Fetch sent gym outreach history from email_logs
export async function GET() {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = auth.supabase;
    const { data, error } = await db
      .from('email_logs')
      .select('*')
      .eq('email_type', 'gym_outreach')
      .order('sent_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('Error fetching email_logs:', error);
      return NextResponse.json({ logs: [] });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (err: any) {
    console.error('Outreach history API error:', err);
    return NextResponse.json({ logs: [] });
  }
}

// DELETE: Clear outreach history if requested
export async function DELETE() {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = auth.supabase;
    await db
      .from('email_logs')
      .delete()
      .eq('email_type', 'gym_outreach');

    return NextResponse.json({ success: true, message: 'Outreach history cleared' });
  } catch (err: any) {
    console.error('Clear outreach history error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
