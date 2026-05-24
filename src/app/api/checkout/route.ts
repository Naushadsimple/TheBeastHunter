import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCashfreeOrder, getCashfreeConfig } from '@/lib/cashfree';
import { getSiteUrl } from '@/lib/site-url';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(age, 1);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    const body = await request.json();
    const { eventId, registrationData } = body;

    if (!eventId || !registrationData) {
      return NextResponse.json({ message: 'Missing event or registration details' }, { status: 400 });
    }

    if (!isUuid(eventId)) {
      return NextResponse.json({ message: 'Invalid event. Please register from the events page.' }, { status: 400 });
    }

    const email = String(registrationData.email || user?.email || '').trim().toLowerCase();
    const fullName = String(registrationData.fullName || '').trim();
    const phone = String(registrationData.phone || '').replace(/\D/g, '').slice(-10);

    if (!fullName) {
      return NextResponse.json({ message: 'Full name is required' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
    }
    if (phone.length < 10) {
      return NextResponse.json({ message: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }
    if (!registrationData.dob) {
      return NextResponse.json({ message: 'Date of birth is required' }, { status: 400 });
    }
    if (!registrationData.waiverAccepted) {
      return NextResponse.json({ message: 'You must accept the waiver' }, { status: 400 });
    }
    if (!registrationData.tosAccepted) {
      return NextResponse.json(
        { message: 'You must accept the Terms of Service' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ message: 'Event not found or not open for registration' }, { status: 404 });
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json({ message: 'Registration for this event has closed' }, { status: 400 });
    }

    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, registration_code, payment_status')
      .eq('event_id', eventId)
      .eq('email', email)
      .in('status', ['confirmed', 'pending'])
      .maybeSingle();

    if (existingReg) {
      return NextResponse.json(
        {
          message: 'This email is already registered for this event',
          registrationCode: existingReg.registration_code,
        },
        { status: 409 }
      );
    }

    const { count: regCount } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .in('status', ['confirmed', 'pending']);

    if (
      event.max_participants &&
      regCount !== null &&
      regCount >= event.max_participants
    ) {
      return NextResponse.json({ message: 'This event is sold out' }, { status: 400 });
    }

    const basePrice = Number(event.ticket_price);
    const totalAmount = basePrice;
    const gstAmount = 0;

    const orderId = `TBH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const registrationCode = `FIT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const age = calculateAge(registrationData.dob);
    const siteUrl = getSiteUrl(request);
    const userId = user?.id ?? null;

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        registration_code: registrationCode,
        user_id: userId,
        event_id: eventId,
        full_name: fullName,
        email,
        phone,
        age,
        gender: registrationData.gender || 'male',
        city: registrationData.city || 'Not Specified',
        emergency_contact: registrationData.emergencyContactName || 'Emergency',
        emergency_phone: String(registrationData.emergencyContactPhone || '').replace(/\D/g, '').slice(-10) || phone,
        tshirt_size: registrationData.tshirtSize || 'M',
        medical_conditions: registrationData.medicalConditions || registrationData.bloodGroup
          ? `Blood Group: ${registrationData.bloodGroup || 'N/A'}`
          : null,
        id_proof_url: registrationData.idProofUrl || null,
        waiver_accepted: true,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration insert error:', regError);
      return NextResponse.json(
        { message: 'Failed to reserve your slot: ' + regError.message },
        { status: 500 }
      );
    }

    const cashfreeConfig = getCashfreeConfig();
    const customerId = userId || `guest_${email.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}`;

    let paymentSessionId: string;
    let cfOrderId: string | undefined;
    let isMock = false;

    if (!cashfreeConfig.isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        await supabase.from('registrations').delete().eq('id', registration.id);
        return NextResponse.json(
          { message: 'Payment gateway is not configured. Please contact support.' },
          { status: 503 }
        );
      }
      paymentSessionId = `mock_session_${orderId}`;
      isMock = true;
    } else {
      try {
        const order = await createCashfreeOrder(
          {
            orderId,
            orderAmount: totalAmount,
            customerId,
            customerName: fullName,
            customerEmail: email,
            customerPhone: phone,
            returnUrl: `${siteUrl}/payment/success?order_id={order_id}`,
            notifyUrl: `${siteUrl}/api/webhook/cashfree`,
            orderNote: `Registration: ${event.title} (${registrationCode})`,
          },
          request
        );
        paymentSessionId = order.paymentSessionId;
        cfOrderId = order.cfOrderId;
      } catch (cfError) {
        await supabase.from('registrations').delete().eq('id', registration.id);
        const message = cfError instanceof Error ? cfError.message : 'Payment gateway error';
        return NextResponse.json({ message }, { status: 502 });
      }
    }

    const { error: payError } = await supabase.from('payments').insert({
      registration_id: registration.id,
      user_id: userId,
      base_amount: basePrice,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      gateway: 'cashfree',
      cashfree_order_id: orderId,
      status: 'initiated',
      gateway_response: {
        payment_session_id: paymentSessionId,
        cf_order_id: cfOrderId ?? null,
        is_mock: isMock,
      },
    });

    if (payError) {
      console.error('Payment insert error:', payError);
      await supabase.from('registrations').delete().eq('id', registration.id);
      return NextResponse.json(
        { message: 'Failed to start payment: ' + payError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      paymentSessionId,
      registrationId: registration.id,
      registrationCode,
      totalAmount,
      isMock,
    });
  } catch (err) {
    console.error('Checkout API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return NextResponse.json(
        { message: 'Server configuration error. Please set SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
