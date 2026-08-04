import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { registrationId, reason } = await request.json();

    if (!registrationId) {
      return NextResponse.json({ message: 'Missing registrationId' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Fetch registration
    const { data: reg } = await supabase
      .from('registrations')
      .select('id, status, event_id')
      .eq('id', registrationId)
      .maybeSingle();

    if (!reg) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    // Only update if not already confirmed
    if (reg.status !== 'confirmed') {
      await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: now,
        })
        .eq('id', registrationId);

      // Update payment record as well
      await supabase
        .from('payments')
        .update({
          status: 'cancelled',
          updated_at: now,
        })
        .eq('registration_id', registrationId);
    }

    return NextResponse.json({ success: true, message: 'Registration marked as cancelled.' });
  } catch (err: any) {
    console.error('Error cancelling registration checkout:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
