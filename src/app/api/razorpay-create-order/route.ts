import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, registrationData, auditionOption, couponCode } = body;

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
    let discountAmount = 0;
    let appliedCouponRecord: any = null;

    // 2. Verify coupon in database if provided
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: coupon, error: couponErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (!couponErr && coupon && coupon.is_active) {
        // Check expiry
        const isExpired = coupon.expires_at ? new Date(coupon.expires_at).getTime() < Date.now() : false;
        // Check max uses
        const isLimitReached = coupon.max_uses !== null && coupon.max_uses !== undefined && (coupon.used_count || 0) >= coupon.max_uses;
        // Check minimum order amount
        const isBelowMin = coupon.min_order_amount && baseTicketPrice < coupon.min_order_amount;

        if (!isExpired && !isLimitReached && !isBelowMin) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (baseTicketPrice * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
              discountAmount = Number(coupon.max_discount);
            }
          } else if (coupon.discount_type === 'flat') {
            discountAmount = Number(coupon.discount_value);
          }
          discountAmount = Math.min(baseTicketPrice, Math.max(0, Math.round(discountAmount)));
          appliedCouponRecord = coupon;
        }
      }
    }

    const payableAmount = Math.max(0, baseTicketPrice - discountAmount);
    const registrationCode = `REG-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. IF PAYABLE AMOUNT IS 0 (100% Free Coupon):
    if (payableAmount === 0) {
      const now = new Date().toISOString();

      // Insert confirmed registration directly
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
          coupon_code: appliedCouponRecord?.code || couponCode || null,
          discount_amount: discountAmount,
          waiver_accepted: true,
          status: 'confirmed',
          payment_status: 'paid',
        })
        .select()
        .single();

      if (regInsertErr || !reg) {
        console.error('Registration insert error for free order:', regInsertErr);
        return NextResponse.json({ message: 'Failed to create registration record' }, { status: 500 });
      }

      // Insert payment record
      await supabase.from('payments').insert({
        registration_id: reg.id,
        base_amount: baseTicketPrice,
        gst_amount: 0,
        discount_amount: discountAmount,
        total_amount: 0,
        gateway: 'coupon_100_free',
        cashfree_order_id: `FREE_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        status: 'success',
        paid_at: now,
        coupon_code: appliedCouponRecord?.code || couponCode || null,
        gateway_response: { free_pass: true, coupon_applied: appliedCouponRecord?.code || couponCode },
      });

      // Increment coupon used_count
      if (appliedCouponRecord) {
        await supabase
          .from('coupons')
          .update({ used_count: (appliedCouponRecord.used_count || 0) + 1, updated_at: now })
          .eq('id', appliedCouponRecord.id);
      }

      // Update actual_registered_count on events table (without touching displayed_slot_count or audition_slots)
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (count !== null && count !== undefined) {
        await supabase
          .from('events')
          .update({ actual_registered_count: count, updated_at: now })
          .eq('id', eventId);
      }

      // Log confirmed email
      await supabase.from('email_logs').insert({
        recipient_email: registrationData.email,
        email_type: 'registration_confirmed',
        registration_id: reg.id,
        status: 'sent',
        sent_at: now,
      });

      return NextResponse.json({
        success: true,
        freeOrder: true,
        payableAmount: 0,
        discountAmount: discountAmount,
        registrationId: reg.id,
        registrationCode: registrationCode,
      });
    }

    // 4. IF PAYABLE AMOUNT > 0 (Paid or Partial Discount):
    const amountInPaise = Math.round(payableAmount * 100);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: 'Razorpay API credentials missing.' },
        { status: 500 }
      );
    }

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
          coupon_code: appliedCouponRecord?.code || couponCode || '',
          discount_amount: discountAmount,
          payable_amount: payableAmount,
        },
      }),
    });

    const rzpOrder = await rzpRes.json();

    if (!rzpRes.ok) {
      console.error('Razorpay order creation failed:', rzpOrder);
      return NextResponse.json({ message: rzpOrder.error?.description || 'Razorpay order creation failed' }, { status: 400 });
    }

    // Insert pending registration
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
        coupon_code: appliedCouponRecord?.code || couponCode || null,
        discount_amount: discountAmount,
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

    // Insert payment record
    await supabase.from('payments').insert({
      registration_id: reg.id,
      base_amount: baseTicketPrice,
      discount_amount: discountAmount,
      total_amount: payableAmount,
      coupon_code: appliedCouponRecord?.code || couponCode || null,
      gateway: 'razorpay',
      cashfree_order_id: rzpOrder.id,
      status: 'initiated',
      gateway_response: rzpOrder,
    });

    return NextResponse.json({
      success: true,
      freeOrder: false,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      registrationId: reg.id,
      registrationCode: registrationCode,
      payableAmount: payableAmount,
      discountAmount: discountAmount,
    });
  } catch (err: any) {
    console.error('Error in razorpay-create-order API route:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
