import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, registrationData, auditionOption, couponCode, discountAmount, finalAmount } = body;

    if (!eventId || !registrationData) {
      return NextResponse.json({ message: 'Missing event or registration data' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch event from database
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const baseTicketPrice = Number(event.ticket_price || 1500);
    const appliedDiscount = Number(discountAmount || 0);

    // Calculate exact payable amount after coupon discount
    let payableAmount = baseTicketPrice;
    if (typeof finalAmount === 'number' && finalAmount >= 0) {
      payableAmount = finalAmount;
    } else if (appliedDiscount > 0) {
      payableAmount = Math.max(0, baseTicketPrice - appliedDiscount);
    }

    const amountInPaise = Math.round(payableAmount * 100);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: 'Razorpay API credentials (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) missing in environment variables.' },
        { status: 500 }
      );
    }

    // 2. Create Razorpay Order via REST API
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const receiptId = `TBH_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          event_id: eventId,
          event_title: event.title,
          email: registrationData.email,
          audition_option: auditionOption || 'Running',
          coupon_code: couponCode || '',
          discount_amount: appliedDiscount,
          payable_amount: payableAmount,
        },
      }),
    });

    const rzpOrder = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('Razorpay order creation failed:', rzpOrder);
      return NextResponse.json({ message: rzpOrder.error?.description || 'Razorpay order creation failed' }, { status: 400 });
    }

    const registrationCode = `REG-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. Insert registration record
    const { data: reg, error: regInsertErr } = await supabase
      .from('registrations')
      .insert({
        registration_code: registrationCode,
        event_id: eventId,
        full_name: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phone,
        age: Number(registrationData.age || 20),
        gender: registrationData.gender || 'male',
        city: registrationData.city || 'Mumbai',
        emergency_contact: registrationData.emergencyContactName || 'Emergency',
        emergency_phone: registrationData.emergencyContactPhone || registrationData.phone,
        tshirt_size: registrationData.tshirtSize || 'M',
        audition_option: auditionOption || 'Running',
        coupon_code: couponCode || null,
        discount_amount: appliedDiscount,
        waiver_accepted: true,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (regInsertErr || !reg) {
      console.error('Registration insert error:', regInsertErr);
      return NextResponse.json({ message: 'Failed to create registration record' }, { status: 500 });
    }

    // 4. Insert payment record
    await supabase.from('payments').insert({
      registration_id: reg.id,
      base_amount: baseTicketPrice,
      discount_amount: appliedDiscount,
      total_amount: payableAmount,
      coupon_code: couponCode || null,
      gateway: 'razorpay',
      cashfree_order_id: rzpOrder.id,
      status: 'initiated',
      gateway_response: rzpOrder,
    });

    // 5. Increment coupon used_count if coupon applied
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, used_count')
        .eq('code', couponCode.toUpperCase())
        .maybeSingle();

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1 })
          .eq('id', coupon.id);
      }
    }

    return NextResponse.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      registrationId: reg.id,
      registrationCode: registrationCode,
    });
  } catch (err: any) {
    console.error('Error in razorpay-create-order API route:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
