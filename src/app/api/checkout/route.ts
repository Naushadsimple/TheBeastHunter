import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
    const { eventId, registrationData, transactionId, paymentProofUrl } = body;

    if (!eventId || !registrationData) {
      return NextResponse.json({ message: 'Missing event or registration details' }, { status: 400 });
    }

    if (!isUuid(eventId)) {
      return NextResponse.json({ message: 'Invalid event. Please register from the events page.' }, { status: 400 });
    }

    if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
      return NextResponse.json({ message: 'Transaction ID / UTR number is required' }, { status: 400 });
    }

    if (!paymentProofUrl || typeof paymentProofUrl !== 'string' || !paymentProofUrl.trim()) {
      return NextResponse.json({ message: 'Payment screenshot proof is required' }, { status: 400 });
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
      return NextResponse.json({ message: 'You must accept the Terms of Service' }, { status: 400 });
    }

    const supabase = createAdminClient();

    console.log('Searching for eventId:', eventId);
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event search error in checkout API:', eventError, 'Found:', event);
      return NextResponse.json({ message: 'Event not found in database' }, { status: 404 });
    }

    if (event.status !== 'published') {
      console.warn('Event exists but status is:', event.status);
      return NextResponse.json({ message: 'Event is not open for registration' }, { status: 404 });
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json({ message: 'Registration for this event has closed' }, { status: 400 });
    }

    console.log('Found event:', event.title, 'Status:', event.status);

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

    const displayedCount = event.displayed_slot_count || 0;

    if (
      event.max_participants &&
      displayedCount >= event.max_participants
    ) {
      return NextResponse.json({ message: 'This event is sold out' }, { status: 400 });
    }

    const basePrice = Number(event.ticket_price);
    const totalAmount = basePrice;
    const gstAmount = 0;

    const orderId = `TBH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const registrationCode = `REG-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const age = calculateAge(registrationData.dob);
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
        insta_id: registrationData.instaId || null,
        city: registrationData.city || 'Not Specified',
        emergency_contact: registrationData.emergencyContactName || 'Emergency',
        emergency_phone: String(registrationData.emergencyContactPhone || '').replace(/\D/g, '').slice(-10) || phone,
        tshirt_size: registrationData.tshirtSize || 'M',
        medical_conditions: registrationData.medicalConditions || registrationData.bloodGroup
          ? `Blood Group: ${registrationData.bloodGroup || 'N/A'}`
          : null,
        id_proof_url: registrationData.idProofUrl || null,
        transaction_id: transactionId.trim(),
        payment_proof_url: paymentProofUrl.trim(),
        audition_option: registrationData.auditionOption || 'Running',
        waiver_accepted: true,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (regError) {
      console.error('Registration insert error:', regError);
      return NextResponse.json(
        { message: 'Failed to save registration: ' + regError.message },
        { status: 500 }
      );
    }

    const { error: payError } = await supabase.from('payments').insert({
      registration_id: registration.id,
      user_id: userId,
      base_amount: basePrice,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      gateway: 'manual_upi',
      cashfree_order_id: orderId,
      status: 'initiated',
      gateway_response: {
        transaction_id: transactionId.trim(),
        payment_proof_url: paymentProofUrl.trim(),
      },
    });

    if (payError) {
      console.error('Payment insert error:', payError);
      await supabase.from('registrations').delete().eq('id', registration.id);
      return NextResponse.json(
        { message: 'Failed to start payment record: ' + payError.message },
        { status: 500 }
      );
    }

    // Import dynamically to avoid compile time issues or import loop
    const { sendPendingEmail } = await import('@/lib/mail');
    
    // Trigger actual email dispatch via Nodemailer SMTP
    const mailResult = await sendPendingEmail(email, registration, event);

    // Log the pending alert email in email_logs table with dispatch result
    await supabase.from('email_logs').insert({
      recipient_email: email,
      email_type: 'registration_pending',
      registration_id: registration.id,
      status: mailResult.success ? 'sent' : 'failed',
      resend_message_id: mailResult.messageId || null,
      error_message: mailResult.error || null,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      orderId,
      registrationId: registration.id,
      registrationCode,
      totalAmount,
      status: 'pending_verification',
    });
  } catch (err) {
    console.error('Checkout API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
