import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { registrationId, action } = await request.json();

    if (!registrationId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'Invalid or missing fields' }, { status: 400 });
    }

    const db = auth.supabase;

    // 1. Fetch registration
    const { data: registration, error: regError } = await db
      .from('registrations')
      .select('*, event_id(title, ticket_price)')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const eventTitle = registration.event_id?.title || 'The Beast Hunter Challenge Event';

    if (action === 'approve') {
      // 2. Update registration status
      const { error: updateRegError } = await db
        .from('registrations')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: now,
        })
        .eq('id', registrationId);

      if (updateRegError) {
        throw new Error(`Failed to update registration: ${updateRegError.message}`);
      }

      // 3. Update payment status
      await db
        .from('payments')
        .update({
          status: 'success',
          paid_at: now,
          updated_at: now,
        })
        .eq('registration_id', registrationId);

      // 4. Log confirmation email in email_logs
      await db.from('email_logs').insert({
        recipient_email: registration.email,
        email_type: 'registration_confirmed',
        registration_id: registrationId,
        status: 'sent',
        sent_at: now,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration approved. Confirmation email logged.',
      });
    } else {
      // action === 'reject'
      // 2. Update registration status
      const { error: updateRegError } = await db
        .from('registrations')
        .update({
          status: 'rejected',
          payment_status: 'failed',
          updated_at: now,
        })
        .eq('id', registrationId);

      if (updateRegError) {
        throw new Error(`Failed to update registration: ${updateRegError.message}`);
      }

      // 3. Update payment status
      await db
        .from('payments')
        .update({
          status: 'failed',
          updated_at: now,
        })
        .eq('registration_id', registrationId);

      // 4. Log rejection email in email_logs (refund message included in template/alert)
      await db.from('email_logs').insert({
        recipient_email: registration.email,
        email_type: 'admin_alert',
        registration_id: registrationId,
        status: 'sent',
        sent_at: now,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration rejected. Refund email notification logged.',
      });
    }
  } catch (err) {
    console.error('Verify registration error:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
