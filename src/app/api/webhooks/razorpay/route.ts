import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendApprovalEmail } from '@/lib/mail';
import { getSiteUrl } from '@/lib/site-url';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const razorpaySignature = request.headers.get('x-razorpay-signature');

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error('Razorpay Webhook Error: Webhook secret is not configured.');
      return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!razorpaySignature) {
      console.warn('Razorpay Webhook Error: Missing x-razorpay-signature header.');
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.error('Razorpay Webhook Error: Invalid signature payload.');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    const db = createAdminClient();
    const siteUrl = getSiteUrl(request);

    console.log(`[Razorpay Webhook] Received Event: ${eventType}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payment?.entity || payload.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id || payload.payment?.entity?.id;

      if (!razorpayOrderId) {
        console.warn('[Razorpay Webhook] Missing order_id in payment.captured payload');
        return NextResponse.json({ received: true });
      }

      // 1. Fetch payment record
      const { data: paymentRecord } = await db
        .from('payments')
        .select('*, registration_id')
        .eq('cashfree_order_id', razorpayOrderId)
        .maybeSingle();

      const registrationId = paymentRecord?.registration_id;

      if (registrationId) {
        // 2. Fetch registration with event
        const { data: registration } = await db
          .from('registrations')
          .select('*, event_id(*)')
          .eq('id', registrationId)
          .single();

        if (registration) {
          // Update registration status
          await db
            .from('registrations')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              transaction_id: razorpayPaymentId || registration.transaction_id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', registrationId);

          // Update payment record
          await db
            .from('payments')
            .update({
              status: 'success',
              transaction_id: razorpayPaymentId,
              gateway_response: paymentEntity,
            })
            .eq('id', paymentRecord.id);

          // Increment filled slot in event.audition_slots
          if (registration.event_id?.id && registration.audition_option) {
            const auditionOpt = registration.audition_option;
            const currentSlots = registration.event_id.audition_slots || {};
            const currentFilled = currentSlots[auditionOpt]?.filled ?? 0;
            const newSlots = {
              ...currentSlots,
              [auditionOpt]: {
                capacity: 100,
                filled: currentFilled + 1,
              },
            };

            await db
              .from('events')
              .update({ audition_slots: newSlots })
              .eq('id', registration.event_id.id);
          }

          // Send approval digital pass email
          const passUrl = `${siteUrl}/payment/success?registration_id=${registration.id}`;
          await sendApprovalEmail(
            registration.email,
            registration,
            registration.event_id || { title: 'The Beast Hunter Audition 2026' },
            passUrl
          );

          console.log(`[Razorpay Webhook] Registration ${registration.registration_code} confirmed & email sent!`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const { data: paymentRecord } = await db
          .from('payments')
          .select('registration_id')
          .eq('cashfree_order_id', razorpayOrderId)
          .maybeSingle();

        if (paymentRecord?.registration_id) {
          await db
            .from('registrations')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
              transaction_id: razorpayPaymentId || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecord.registration_id);

          await db
            .from('payments')
            .update({
              status: 'failed',
              gateway_response: paymentEntity,
            })
            .eq('cashfree_order_id', razorpayOrderId);

          console.log(`[Razorpay Webhook] Registration ${paymentRecord.registration_id} marked as payment_failed`);
        }
      }
    }

    return NextResponse.json({ success: true, event: eventType });
  } catch (err: any) {
    console.error('Razorpay Webhook Fatal Error:', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
