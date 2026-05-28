import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  const registrationId = searchParams.get('registration_id');

  if (!orderId && !registrationId) {
    return NextResponse.json(
      { message: 'Missing order_id or registration_id parameter' },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    let finalReg: any = null;

    // 1. If registration_id is provided, fetch directly
    if (registrationId) {
      const { data: reg } = await supabase
        .from('registrations')
        .select('*, event_id(*)')
        .eq('id', registrationId)
        .maybeSingle();
      if (reg) finalReg = reg;
    }

    // 2. Fallback: look up via orderId in payments table
    if (!finalReg && orderId) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('cashfree_order_id', orderId)
        .maybeSingle();

      if (payment) {
        const { data: correlatedReg } = await supabase
          .from('registrations')
          .select('*, event_id(*)')
          .eq('id', payment.registration_id)
          .maybeSingle();
        if (correlatedReg) finalReg = correlatedReg;
      }

      // 3. Direct registration code correlation fallback
      if (!finalReg) {
        const { data: regByCode } = await supabase
          .from('registrations')
          .select('*, event_id(*)')
          .eq('registration_code', orderId.replace('TBH-', 'REG-'))
          .maybeSingle();
        if (regByCode) finalReg = regByCode;
      }
    }

    if (!finalReg) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration: finalReg,
      event: finalReg.event_id,
    });
  } catch (err) {
    console.error('Order details API error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
