import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/admin-auth';

const DEFAULT_POPUP_SETTINGS = {
  is_enabled: true,
  title: 'HAPPY INDEPENDENCE DAY! 🇮🇳',
  subtitle: 'Celebrate Freedom & Unleash Your Inner Beast',
  coupon_code: 'INDIA15',
  discount_text: 'Get 15% INSTANT DISCOUNT on all Audition Registrations!',
  image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=800&auto=format&fit=crop',
};

// GET: Public endpoint to fetch promo popup config
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'promo_popup')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(DEFAULT_POPUP_SETTINGS);
    }

    return NextResponse.json({ ...DEFAULT_POPUP_SETTINGS, ...data.value });
  } catch (err: any) {
    console.error('Error fetching promo popup settings:', err);
    return NextResponse.json(DEFAULT_POPUP_SETTINGS);
  }
}

// POST: Admin endpoint to save promo popup config
export async function POST(request: Request) {
  try {
    const authRes = await getAdminSession();
    if (!authRes.ok) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_enabled, title, subtitle, coupon_code, discount_text, image_url } = body;

    const newConfig = {
      is_enabled: Boolean(is_enabled),
      title: title || DEFAULT_POPUP_SETTINGS.title,
      subtitle: subtitle || DEFAULT_POPUP_SETTINGS.subtitle,
      coupon_code: (coupon_code || 'INDIA15').toUpperCase().trim(),
      discount_text: discount_text || DEFAULT_POPUP_SETTINGS.discount_text,
      image_url: image_url || DEFAULT_POPUP_SETTINGS.image_url,
    };

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key: 'promo_popup',
        value: newConfig,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving promo popup settings:', error);
      return NextResponse.json({ message: 'Failed to save settings' }, { status: 500 });
    }

    // Ensure coupon exists in public.coupons table as well
    if (newConfig.coupon_code) {
      const { data: existingCoupon } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', newConfig.coupon_code)
        .maybeSingle();

      if (!existingCoupon) {
        await supabase.from('coupons').insert({
          code: newConfig.coupon_code,
          discount_type: 'percentage',
          discount_value: 15,
          max_discount: 300,
          min_order_amount: 500,
          max_uses: 500,
          is_active: true,
        });
      }
    }

    return NextResponse.json({ success: true, settings: newConfig });
  } catch (err: any) {
    console.error('Error in promo popup settings API:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
