-- Create coupons table in public schema
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    max_discount NUMERIC DEFAULT NULL,
    min_order_amount NUMERIC DEFAULT 0,
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for public and authenticated access
DROP POLICY IF EXISTS "Allow public select coupons" ON public.coupons;
CREATE POLICY "Allow public select coupons" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow service role full access coupons" ON public.coupons;
CREATE POLICY "Allow service role full access coupons" ON public.coupons FOR ALL USING (true);

-- Add coupon columns to registrations and payments if missing
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Grants
GRANT ALL ON public.coupons TO anon;
GRANT ALL ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
