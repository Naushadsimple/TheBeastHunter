import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Development-only helper to simulate Cashfree payment success.
 * Never available in production — real payments must use Cashfree webhooks.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const orderId = body?.orderId as string | undefined;
  const status = body?.status as 'SUCCESS' | 'FAILED' | undefined;

  if (!orderId || !status) {
    return NextResponse.json({ message: 'orderId and status are required' }, { status: 400 });
  }

  if (!orderId.startsWith('TBH-')) {
    return NextResponse.json({ message: 'Invalid order' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('cashfree_order_id', orderId)
      .single();

    if (payError || !payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    const gatewayResponse = payment.gateway_response as { is_mock?: boolean } | null;
    if (!gatewayResponse?.is_mock) {
      return NextResponse.json(
        { message: 'Mock completion is only allowed for sandbox mock orders' },
        { status: 403 }
      );
    }

    if (status === 'SUCCESS') {
      if (payment.status !== 'success') {
        await supabase
          .from('payments')
          .update({
            status: 'success',
            cashfree_payment_id: `MOCK_PAY_${Date.now()}`,
            payment_method: 'MOCK',
            webhook_verified: true,
            paid_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        await supabase
          .from('registrations')
          .update({ status: 'confirmed', payment_status: 'paid' })
          .eq('id', payment.registration_id);
      }

      return NextResponse.json({ message: 'Mock payment confirmed' });
    }

    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', payment.id);

    await supabase
      .from('registrations')
      .update({ status: 'cancelled', payment_status: 'failed' })
      .eq('id', payment.registration_id);

    return NextResponse.json({ message: 'Mock payment marked failed' });
  } catch (err) {
    console.error('Mock payment error:', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}
