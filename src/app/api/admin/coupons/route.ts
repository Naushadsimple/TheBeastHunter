import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = auth.supabase;
    const { data: coupons, error } = await db
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({ coupons: [] }, { status: 200 });
    }

    return NextResponse.json({ coupons: coupons || [] });
  } catch (err: any) {
    console.error('Admin GET coupons error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      discount_type,
      discount_value,
      max_discount,
      min_order_amount,
      max_uses,
      expires_at,
    } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ message: 'Missing required fields: code, discount_type, discount_value' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    if (!['percentage', 'flat'].includes(discount_type)) {
      return NextResponse.json({ message: 'Discount type must be "percentage" or "flat"' }, { status: 400 });
    }

    const db = auth.supabase;

    const couponPayload = {
      code: cleanCode,
      discount_type,
      discount_value: Number(discount_value),
      max_discount: max_discount ? Number(max_discount) : null,
      min_order_amount: min_order_amount ? Number(min_order_amount) : 0,
      max_uses: max_uses ? Number(max_uses) : null,
      used_count: 0,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data: newCoupon, error } = await db
      .from('coupons')
      .insert(couponPayload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: `Coupon code '${cleanCode}' already exists.` }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    console.error('Admin POST coupon error:', err);
    return NextResponse.json({ message: err.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, is_active } = await request.json();

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json({ message: 'Missing id or is_active parameter' }, { status: 400 });
    }

    const db = auth.supabase;
    const { data: updated, error } = await db
      .from('coupons')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    console.error('Admin PATCH coupon error:', err);
    return NextResponse.json({ message: err.message || 'Failed to update coupon status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing coupon id parameter' }, { status: 400 });
    }

    const db = auth.supabase;
    const { error } = await db
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    console.error('Admin DELETE coupon error:', err);
    return NextResponse.json({ message: err.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
