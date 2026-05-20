import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper to verify Cashfree webhook signature (v3 webhook signature header is x-webhook-signature)
function verifySignature(
  signature: string,
  timestamp: string,
  rawBody: string,
  secretKey: string
): boolean {
  try {
    const data = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('base64');
    return computedSignature === signature;
  } catch (err) {
    console.error('Error computing signature:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ message: 'Invalid JSON payload' }, { status: 400 });
  }

  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
  const isMock = body?.payment?.cf_payment_id?.startsWith('MOCK_') || !cashfreeSecretKey;

  // 1. Verify Signature (only if not a simulated/mock payment and credentials exist)
  if (!isMock && cashfreeSecretKey) {
    if (!signature || !timestamp) {
      console.warn('Webhook received without signature headers in production environment');
      return NextResponse.json({ message: 'Missing signature headers' }, { status: 401 });
    }

    const isValid = verifySignature(signature, timestamp, rawBody, cashfreeSecretKey);
    if (!isValid) {
      console.error('Webhook signature verification failed!');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 401 });
    }
  } else {
    console.log('Bypassing signature verification for mock/local sandbox payment');
  }

  // 2. Extract payload details
  const eventType = body?.type;
  const orderId = body?.data?.order?.order_id;
  const paymentStatus = body?.data?.payment?.payment_status;
  const cfPaymentId = body?.data?.payment?.cf_payment_id;
  const paymentMethod = body?.data?.payment?.payment_method
    ? JSON.stringify(body.data.payment.payment_method)
    : 'Unknown';

  if (!orderId || !paymentStatus) {
    return NextResponse.json({ message: 'Missing required payload parameters' }, { status: 400 });
  }

  console.log(`Webhook received: Order ID = ${orderId}, Status = ${paymentStatus}, Event = ${eventType}`);

  try {
    // 3. Update database using the admin client to bypass RLS policies
    const supabase = createAdminClient();

    // Fetch matching payment
    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('cashfree_order_id', orderId)
      .single();

    if (payError || !payment) {
      console.error(`Payment record not found for Order ID: ${orderId}`, payError);
      return NextResponse.json({ message: 'Payment record not found' }, { status: 404 });
    }

    if (paymentStatus === 'SUCCESS') {
      // Check if already processed to prevent duplicate executions
      if (payment.status === 'success') {
        return NextResponse.json({ message: 'Webhook already processed' }, { status: 200 });
      }

      // Update payment record to success
      const { error: updatePayError } = await supabase
        .from('payments')
        .update({
          status: 'success',
          cashfree_payment_id: cfPaymentId,
          payment_method: paymentMethod,
          webhook_verified: true,
          gateway_response: body,
          paid_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updatePayError) {
        console.error('Error updating payment to success:', updatePayError);
        return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
      }

      // Update registration record to confirmed
      const { error: updateRegError } = await supabase
        .from('registrations')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
        })
        .eq('id', payment.registration_id);

      if (updateRegError) {
        console.error('Error updating registration to confirmed:', updateRegError);
        return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
      }

      console.log(`Successfully confirmed registration and payment for Order ID: ${orderId}`);

      // (Optional) Trigger transactional email sending / ticket generation here in the background
      // To keep it light, we can call a background job or let the success screen load it.

    } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      // Update payment record to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          gateway_response: body,
        })
        .eq('id', payment.id);

      // Update registration record to cancelled/rejected
      await supabase
        .from('registrations')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
        })
        .eq('id', payment.registration_id);

      console.log(`Marked payment and registration as FAILED for Order ID: ${orderId}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (err: any) {
    console.error('Webhook endpoint internal error:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
