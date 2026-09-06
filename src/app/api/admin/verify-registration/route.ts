import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getSiteUrl } from '@/lib/site-url';
import { releaseAuditionSlot } from '@/lib/slot-sync';

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
      .select('*, event_id(id, title, ticket_price)')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const eventTitle = registration.event_id?.title || 'The Beast Hunter Challenge Event';
    const targetEventId = registration.event_id?.id || registration.event_id;

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

      // Slot was booked when the registration was submitted.
      // If admin rejects, releaseAuditionSlot will decrement.

      // Fetch payment record to obtain the cashfree_order_id (order ID)
      const { data: payment } = await db
        .from('payments')
        .select('cashfree_order_id')
        .eq('registration_id', registrationId)
        .maybeSingle();

      const orderId = payment?.cashfree_order_id;
      const baseUrl = getSiteUrl(request);
      const passUrl = orderId
        ? `${baseUrl}/payment/success?order_id=${orderId}`
        : `${baseUrl}/payment/success?registration_id=${registrationId}`;

      const { sendApprovalEmail } = await import('@/lib/mail');
      const mailResult = await sendApprovalEmail(registration.email, registration, registration.event_id, passUrl);

      // 4. Log confirmation email in email_logs
      await db.from('email_logs').insert({
        recipient_email: registration.email,
        email_type: 'registration_confirmed',
        registration_id: registrationId,
        status: mailResult.success ? 'sent' : 'failed',
        resend_message_id: mailResult.messageId || null,
        error_message: mailResult.error || null,
        sent_at: now,
      });

      return NextResponse.json({
        success: true,
        message: mailResult.success 
          ? 'Registration approved and confirmation email sent.'
          : `Registration approved, but email failed: ${mailResult.error}`,
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

      // --- AUTOMATIC SLOT SYNCHRONIZATION (REJECT) ---
      if (targetEventId) {
        await releaseAuditionSlot(db, targetEventId, registration?.audition_option);
      }

      const { sendRejectionEmail } = await import('@/lib/mail');
      const mailResult = await sendRejectionEmail(registration.email, registration, registration.event_id);

      // 4. Log rejection email in email_logs
      await db.from('email_logs').insert({
        recipient_email: registration.email,
        email_type: 'registration_rejected',
        registration_id: registrationId,
        status: mailResult.success ? 'sent' : 'failed',
        resend_message_id: mailResult.messageId || null,
        error_message: mailResult.error || null,
        sent_at: now,
      });

      return NextResponse.json({
        success: true,
        message: mailResult.success 
          ? 'Registration rejected and notification email sent.'
          : `Registration rejected, but email failed: ${mailResult.error}`,
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
