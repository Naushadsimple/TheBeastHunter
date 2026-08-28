import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/admin-auth';

export const DEFAULT_POPUP_SETTINGS = {
  is_enabled: true,
  badge_text: '🇮🇳 79th Independence Day Special',
  title: 'HAPPY INDEPENDENCE DAY! 🇮🇳',
  subtitle: 'Celebrate Freedom & Unleash Your Inner Beast',
  coupon_code: 'INDIA15',
  discount_text: 'Get 15% INSTANT DISCOUNT on all Audition Registrations!',
  image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=800&auto=format&fit=crop',
  primary_color: '#FF9933',
  secondary_color: '#FFFFFF',
  tertiary_color: '#138808',
  show_flag_accent: true,
  cta_text: 'Claim Offer & Register Now',
  cta_url: '/events/beast-hunter-audition-2026',
  delay_seconds: 3,
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
    const {
      is_enabled,
      badge_text,
      title,
      subtitle,
      coupon_code,
      discount_text,
      image_url,
      primary_color,
      secondary_color,
      tertiary_color,
      show_flag_accent,
      cta_text,
      cta_url,
      delay_seconds,
    } = body;

    const newConfig = {
      is_enabled: Boolean(is_enabled),
      badge_text: badge_text || DEFAULT_POPUP_SETTINGS.badge_text,
      title: title || DEFAULT_POPUP_SETTINGS.title,
      subtitle: subtitle || DEFAULT_POPUP_SETTINGS.subtitle,
      coupon_code: (coupon_code || 'INDIA15').toUpperCase().trim(),
      discount_text: discount_text || DEFAULT_POPUP_SETTINGS.discount_text,
      image_url: image_url !== undefined ? image_url : DEFAULT_POPUP_SETTINGS.image_url,
      primary_color: primary_color || DEFAULT_POPUP_SETTINGS.primary_color,
      secondary_color: secondary_color || DEFAULT_POPUP_SETTINGS.secondary_color,
      tertiary_color: tertiary_color || DEFAULT_POPUP_SETTINGS.tertiary_color,
      show_flag_accent: show_flag_accent !== undefined ? Boolean(show_flag_accent) : true,
      cta_text: cta_text || DEFAULT_POPUP_SETTINGS.cta_text,
      cta_url: cta_url || DEFAULT_POPUP_SETTINGS.cta_url,
      delay_seconds: typeof delay_seconds === 'number' ? Math.max(0, delay_seconds) : 3,
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from('site_settings').upsert({
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
