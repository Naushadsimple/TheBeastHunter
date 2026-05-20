import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, registrationData } = body;

    if (!eventId || !registrationData) {
      return NextResponse.json({ message: 'Missing event ID or registration data' }, { status: 400 });
    }

    // 2. Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // 3. Check if already registered
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'pending'])
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json({ message: 'You are already registered for this event' }, { status: 409 });
    }

    // 4. Check capacity
    const { count: regCount } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'pending']);

    if (regCount !== null && regCount >= event.max_participants) {
      return NextResponse.json({ message: 'Event is sold out!' }, { status: 400 });
    }

    // 5. Calculate pricing
    const basePrice = Number(event.ticket_price);
    const gstRate = Number(process.env.GST_RATE || '18') / 100;
    const gstAmount = Math.round(basePrice * gstRate);
    const totalAmount = basePrice + gstAmount;

    // 6. Generate unique order ID and registration code
    const orderId = `TBH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const registrationCode = `REG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Calculate age from dob
    let age = 18;
    if (registrationData.dob) {
      const dobDate = new Date(registrationData.dob);
      const ageDiff = Date.now() - dobDate.getTime();
      const ageDate = new Date(ageDiff);
      age = Math.abs(ageDate.getUTCFullYear() - 1970) || 18;
    }

    // 7. Create registration record in pending state
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        registration_code: registrationCode,
        user_id: user.id,
        event_id: eventId,
        full_name: registrationData.fullName,
        email: user.email,
        phone: registrationData.phone || '9999999999',
        age: age,
        gender: registrationData.gender || 'male',
        city: registrationData.city || 'Not Specified',
        emergency_contact: registrationData.emergencyContactName || 'Emergency',
        emergency_phone: registrationData.emergencyContactPhone || '9999999999',
        tshirt_size: registrationData.tshirtSize || 'M',
        medical_conditions: registrationData.bloodGroup ? `Blood Group: ${registrationData.bloodGroup}` : 'None',
        id_proof_url: registrationData.idProofUrl || '',
        waiver_accepted: true,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration insert error:', regError);
      return NextResponse.json({ message: 'Failed to create registration: ' + regError.message }, { status: 500 });
    }

    // 8. Create Cashfree order
    const cashfreeAppId = process.env.CASHFREE_APP_ID;
    const cashfreeSecretKey = process.env.CASHFREE_SECRET_KEY;
    const cashfreeEnv = process.env.CASHFREE_ENV || 'sandbox';
    const cashfreeBaseUrl = cashfreeEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    if (!cashfreeAppId || !cashfreeSecretKey) {
      // If Cashfree keys not configured, insert payment record and return mock payment session for dev
      const { error: payError } = await supabase.from('payments').insert({
        registration_id: registration.id,
        user_id: user.id,
        base_amount: basePrice,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        gateway: 'cashfree',
        cashfree_order_id: orderId,
        status: 'initiated',
        gateway_response: {
          payment_session_id: `mock_session_${orderId}`,
          cf_order_id: null,
        },
      });

      if (payError) {
        console.error('Payment insert error:', payError);
        await supabase.from('registrations').delete().eq('id', registration.id);
        return NextResponse.json({ message: 'Failed to create payment record: ' + payError.message }, { status: 500 });
      }

      return NextResponse.json({
        orderId,
        paymentSessionId: `mock_session_${orderId}`,
        registrationId: registration.id,
        message: 'Cashfree keys not configured — mock session created',
      });
    }

    const cashfreePayload = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id,
        customer_email: user.email,
        customer_phone: registrationData.phone || '9999999999',
        customer_name: registrationData.fullName,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/payment/success?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin')}/api/webhook/cashfree`,
      },
      order_note: `Registration for ${event.title}`,
    };

    const cashfreeRes = await fetch(`${cashfreeBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': cashfreeAppId,
        'x-client-secret': cashfreeSecretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(cashfreePayload),
    });

    const cashfreeData = await cashfreeRes.json();

    if (!cashfreeRes.ok || !cashfreeData.payment_session_id) {
      console.error('Cashfree order creation failed:', cashfreeData);
      // Rollback registration
      await supabase.from('registrations').delete().eq('id', registration.id);
      return NextResponse.json({ message: 'Payment gateway error. Please try again.' }, { status: 502 });
    }

    // 9. Create payment record
    const { error: payError } = await supabase.from('payments').insert({
      registration_id: registration.id,
      user_id: user.id,
      base_amount: basePrice,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      gateway: 'cashfree',
      cashfree_order_id: orderId,
      status: 'initiated',
      gateway_response: {
        payment_session_id: cashfreeData.payment_session_id,
        cf_order_id: cashfreeData.cf_order_id,
      },
    });

    if (payError) {
      console.error('Payment insert error:', payError);
      // Rollback registration
      await supabase.from('registrations').delete().eq('id', registration.id);
      return NextResponse.json({ message: 'Failed to create payment record: ' + payError.message }, { status: 500 });
    }

    return NextResponse.json({
      orderId,
      paymentSessionId: cashfreeData.payment_session_id,
      registrationId: registration.id,
    });

  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
