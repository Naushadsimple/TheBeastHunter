import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = auth.supabase;

    const [
      eventsRes,
      registrationsRes,
      oldRegistrationsRes,
      sponsorsRes,
      paymentsRes,
      usersRes,
    ] = await Promise.all([
      db.from('events').select('*').order('event_date', { ascending: true }),
      db
        .from('registrations')
        .select('*, event_id(id, title, slug, event_date), payments(cashfree_order_id, status)')
        .order('created_at', { ascending: false }),
      db
        .from('old_registrations')
        .select('*, event_id(id, title, slug, event_date)')
        .order('created_at', { ascending: false }),
      db.from('sponsors').select('*').order('display_order', { ascending: true }),
      db.from('payments').select('total_amount, status').eq('status', 'success'),
      db.from('users').select('id', { count: 'exact', head: true }),
    ]);

    const registrations = registrationsRes.data || [];
    const oldRegistrations = oldRegistrationsRes.data || [];
    const confirmed = registrations.filter((r) => r.status === 'confirmed');
    const pending = registrations.filter((r) => r.status === 'pending');
    const totalRevenue =
      paymentsRes.data?.reduce((sum, p) => sum + Number(p.total_amount || 0), 0) || 0;

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalChallengers: registrations.length,
        confirmedChallengers: confirmed.length,
        pendingChallengers: pending.length,
        archivedChallengers: oldRegistrations.length,
        totalEvents: eventsRes.data?.length || 0,
        totalUsers: usersRes.count || 0,
        activeSponsors: (sponsorsRes.data || []).filter((s) => s.is_active).length,
      },
      events: eventsRes.data || [],
      registrations,
      oldRegistrations,
      sponsors: sponsorsRes.data || [],
    });
  } catch (err) {
    console.error('Admin dashboard API error:', err);
    return NextResponse.json({ message: 'Failed to load dashboard data' }, { status: 500 });
  }
}
