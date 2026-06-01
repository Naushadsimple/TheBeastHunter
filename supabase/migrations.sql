-- ==========================================
-- THE BEAST HUNTER DATABASE MIGRATION SCRIPT
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create tables

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  gender VARCHAR(20),
  city VARCHAR(100),
  date_of_birth DATE,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description VARCHAR(500),
  description TEXT,
  banner_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  city VARCHAR(100),
  venue TEXT,
  google_maps_url TEXT,
  distance_km DECIMAL(5,2),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'elite')),
  ticket_price DECIMAL(10,2) NOT NULL,
  gst_percent DECIMAL(5,2) DEFAULT 18.00,
  max_participants INTEGER,
  prize_pool JSONB DEFAULT '{}'::jsonb,
  rules TEXT,
  eligibility TEXT,
  schedule JSONB DEFAULT '[]'::jsonb,
  faq JSONB DEFAULT '[]'::jsonb,
  seo_title VARCHAR(255),
  seo_description VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(20),
  city VARCHAR(100),
  emergency_contact VARCHAR(255) NOT NULL,
  emergency_phone VARCHAR(15) NOT NULL,
  tshirt_size VARCHAR(5) CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  medical_conditions TEXT,
  id_proof_url TEXT,
  transaction_id VARCHAR(100),
  payment_proof_url TEXT,
  waiver_accepted BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ticket_url TEXT,
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_event UNIQUE (user_id, event_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  base_amount DECIMAL(10,2) NOT NULL,
  gst_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  gateway VARCHAR(50) DEFAULT 'cashfree',
  cashfree_order_id VARCHAR(255) UNIQUE NOT NULL,
  cashfree_payment_id VARCHAR(255),
  payment_method VARCHAR(100),
  status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'success', 'failed', 'refunded')),
  webhook_verified BOOLEAN DEFAULT false,
  gateway_response JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(100) CHECK (email_type IN ('registration_confirmed', 'payment_receipt', 'ticket', 'reminder', 'admin_alert')),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  resend_message_id VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  email VARCHAR(255),
  is_popup BOOLEAN DEFAULT false,
  popup_description TEXT,
  popup_pages TEXT DEFAULT '*',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Helper functions

-- Check if current authenticated user is an admin (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  -- Check role in public.users
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync new Auth users into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    -- Default all users to 'user' role - admin role must be manually assigned
    'user'::varchar 
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER update_events_timestamp BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER update_registrations_timestamp BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();
CREATE TRIGGER update_payments_timestamp BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();


-- 3. Row Level Security (RLS) Policies

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Allow users to update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on published events" ON public.events FOR SELECT TO public USING (status = 'published' OR public.is_admin());
CREATE POLICY "Allow admins full access to events" ON public.events FOR ALL TO authenticated USING (public.is_admin());

-- Registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view own registrations" ON public.registrations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Allow users to insert own registrations" ON public.registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow admins full access to registrations" ON public.registrations FOR ALL TO authenticated USING (public.is_admin());

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Allow admins full access to payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin());

-- Email logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins access to email logs" ON public.email_logs FOR ALL TO authenticated USING (public.is_admin());

-- Sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on sponsors" ON public.sponsors FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Allow admins full access to sponsors" ON public.sponsors FOR ALL TO authenticated USING (public.is_admin());

-- Testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on approved testimonials" ON public.testimonials FOR SELECT TO public USING (is_approved = true OR public.is_admin());
CREATE POLICY "Allow users to insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow admins full access to testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin());


-- 4. Storage Buckets initialization (via storage schema)
-- Note: Supabase storage schema contains buckets and objects

-- Insert buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('event-banners', 'event-banners', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('id-proofs', 'id-proofs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tickets', 'tickets', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Banners policies
CREATE POLICY "Allow public read on event-banners" ON storage.objects FOR SELECT TO public USING (bucket_id = 'event-banners');
-- Gallery policies
CREATE POLICY "Allow public read on gallery" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
-- Sponsor-logos policies
CREATE POLICY "Allow public read on sponsor-logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'sponsor-logos');

-- Allow authenticated users to upload ID proofs into their own folder in private id-proofs bucket
CREATE POLICY "Allow users to upload ID proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'id-proofs' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own uploaded ID proof
CREATE POLICY "Allow users to read own ID proofs" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'id-proofs' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins full access to all storage objects
CREATE POLICY "Allow admins full access to storage" ON storage.objects FOR ALL TO authenticated USING (public.is_admin());


-- 5. Admin User Setup
-- To create an admin user, follow these steps:
-- 1. Create the user via Supabase Dashboard -> Authentication -> Users
-- 2. After user is created, run: UPDATE public.users SET role = 'admin' WHERE email = 'user@example.com';
-- 3. Or use the setup_admin.sql script for detailed instructions

-- Example: Set specific email as admin (uncomment and modify as needed)
-- UPDATE public.users SET role = 'admin' WHERE email = 'shaikhnaushuu78636@gmail.com';

-- 6. Slot Override System Columns (Added 2026-06-01)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS actual_registered_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS displayed_slot_count INTEGER DEFAULT 0 NOT NULL;

-- Initial seeding: update actual_registered_count for each event based on count of 'confirmed' registrations
UPDATE public.events e
SET actual_registered_count = COALESCE(
  (SELECT COUNT(*) FROM public.registrations r WHERE r.event_id = e.id AND r.status = 'confirmed'),
  0
);

-- Update displayed_slot_count to be same as actual registrations initially
UPDATE public.events e
SET displayed_slot_count = actual_registered_count;
