import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { code, ticketPrice } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const originalPrice = Number(ticketPrice) || 1500;

    const supabase = createAdminClient();

    // Fetch coupon from DB
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !coupon) {
      if (error?.message?.includes('schema cache') || error?.code === 'PGRST204' || error?.code === '42P01') {
        return NextResponse.json({ valid: false, message: 'Invalid coupon code.' }, { status: 404 });
      }
      return NextResponse.json({ valid: false, message: 'Invalid coupon code.' }, { status: 404 });
    }

    // 1. Check active status
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active.' }, { status: 400 });
    }

    // 2. Check expiry date
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at).getTime();
      if (Date.now() > expiryDate) {
        return NextResponse.json({ valid: false, message: 'This coupon has expired.' }, { status: 400 });
      }
    }

    // 3. Check usage limit
    if (coupon.max_uses !== null && coupon.max_uses !== undefined && coupon.max_uses > 0) {
      if ((coupon.used_count || 0) >= coupon.max_uses) {
        return NextResponse.json({ valid: false, message: 'This coupon has reached its maximum usage limit.' }, { status: 400 });
      }
    }

    // 4. Check minimum order amount
    if (coupon.min_order_amount && originalPrice < coupon.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `This coupon requires a minimum ticket price of ₹${coupon.min_order_amount}.`,
      }, { status: 400 });
    }

    // Calculate Discount
    let discountAmount = 0;

    if (coupon.discount_type === 'percentage') {
      discountAmount = (originalPrice * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
        discountAmount = Number(coupon.max_discount);
      }
    } else if (coupon.discount_type === 'flat') {
      discountAmount = Number(coupon.discount_value);
    }

    // Cap discount to original price
    discountAmount = Math.min(originalPrice, Math.max(0, Math.round(discountAmount)));
    const finalAmount = Math.max(0, originalPrice - discountAmount);

    return NextResponse.json({
      valid: true,
      message: `Coupon '${cleanCode}' applied successfully!`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        discountAmount,
        originalPrice,
        finalAmount,
      },
    });
  } catch (err: any) {
    console.error('Coupon validation error:', err);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon code.' }, { status: 500 });
  }
}
