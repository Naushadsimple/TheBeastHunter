================================================================================
      FITNESS EVENT & CHALLENGE PLATFORM — PRODUCT REQUIREMENTS DOCUMENT
                       Version 1.0  |  May 2026  |  FINAL
================================================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TABLE OF CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1.  Project Overview
  2.  Goals & Success Metrics
  3.  Brand & Design System
  4.  Tech Stack
  5.  System Architecture
  6.  Environment Variables (.env)
  7.  Supabase Setup (DB + Auth + Storage) I have connected the Supabase MCP project name TheBeastHunter 
  8.  Database Schema
  9.  Authentication Flow
  10. Website Pages & Sections
  11. Registration & Payment Flow
  12. Email Notification System
  13. Admin Panel
  14. Animation Strategy
  15. Folder Structure
  16. API Routes Reference
  17. SEO Requirements
  18. Security Requirements
  19. Performance Goals
  20. Development Phases & Order
  21. Future Roadmap
  22. Important Dev Notes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. PROJECT OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Product Type    : Web Application (PWA-ready, Mobile App future-safe)
  Target Audience : Fitness enthusiasts, runners, athletes across India
  Platform        : Web (Desktop + Mobile Responsive)

  Core Purpose:
  ─────────────
  Build a premium fitness event & challenge platform where users can discover
  upcoming races, register online, pay securely via Cashfree, and receive
  digital tickets — while admins manage everything from a powerful dashboard.

  What the Platform Does:
  ───────────────────────
  · Showcase upcoming fitness races and challenges with a cinematic, premium UI
  · Handle end-to-end multi-step event registration
  · Process payments through Cashfree (India-first payment gateway)
  · Send automated emails: confirmation, receipt, PDF ticket, reminders
  · Admin dashboard: event management, participant tracking, revenue analytics
  · Generate and deliver downloadable QR-coded PDF tickets
  · Realtime registration count updates via Supabase Realtime

  Brand Feel:
  ───────────
  · Premium & luxury sports brand (Nike campaign / marathon brand aesthetic)
  · Cinematic animations and smooth parallax scrolling
  · High-energy, energetic, aspirational design
  · Feel: like a cinematic sports documentary meets a luxury product website


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  2. GOALS & SUCCESS METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Business Goals:
  ───────────────
  · Remove offline/manual registration — go fully digital
  · Maximize ticket conversion through premium, frictionless UX
  · Give admin real-time visibility into registrations and revenue
  · Build a loyal fitness community with a branded platform
  · Make future mobile app conversion as easy as possible

  Success Metrics:
  ────────────────
  ┌──────────────────────────────────────────┬──────────────────────┐
  │ Metric                                   │ Target               │
  ├──────────────────────────────────────────┼──────────────────────┤
  │ Lighthouse Performance Score             │ 90+                  │
  │ Page Load Time (LCP)                     │ < 3 seconds          │
  │ Mobile Optimization                      │ Excellent            │
  │ Animation FPS                            │ 60 FPS               │
  │ Payment Confirmation (webhook response)  │ < 5 seconds          │
  │ Email Delivery Time                      │ < 2 minutes          │
  │ Registration Completion Rate             │ > 70%                │
  │ Payment Success Rate                     │ > 90%                │
  └──────────────────────────────────────────┴──────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  3. BRAND & DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Color Palette:
  ──────────────
  ┌──────────────────────┬────────────┬────────────────────────────────────┐
  │ Name                 │ Hex        │ Usage                              │
  ├──────────────────────┼────────────┼────────────────────────────────────┤
  │ Premium Gold         │ #D4AF37    │ CTAs, highlights, borders, icons   │
  │ Gold Glow            │ #F5D060    │ Hover states, glow/light effects   │
  │ Muted Gold           │ #A88A20    │ Subtle accents, dividers           │
  │ Deep Black           │ #0B0B0B    │ Page background                    │
  │ Dark Gray            │ #1A1A1A    │ Cards, section backgrounds         │
  │ Pure White           │ #FFFFFF    │ Body text, primary headings        │
  │ Light Gray           │ #9CA3AF    │ Muted text, placeholders           │
  └──────────────────────┴────────────┴────────────────────────────────────┘

  Typography:
  ───────────
  · Headings      : Bebas Neue OR Barlow Condensed (bold, athletic feel)
  · Body Text     : Inter OR DM Sans (clean, readable)
  · Premium/Quote : Playfair Display (used sparingly for luxury feel)

  Visual Language:
  ────────────────
  · Noise texture overlays on hero and dark sections
  · Gold linear and radial gradients on CTA elements
  · Glow borders on cards (gold box-shadow)
  · Animated SVG lines and floating particle effects
  · Motion blur transitions between scroll sections
  · Looping compressed mp4 video backgrounds for hero
  · Masonry image grids for event galleries
  · Clip-path reveals on section entrances


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  4. TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌───────────────────────┬────────────────────────────────────────────────┐
  │ Category              │ Technology                                     │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Framework             │ Next.js 14+ (App Router)                       │
  │ Language              │ TypeScript (strict mode)                       │
  │ Styling               │ Tailwind CSS                                   │
  │ Animation             │ GSAP + Framer Motion                           │
  │ Smooth Scroll         │ Lenis                                          │
  │ Form Handling         │ React Hook Form + Zod (validation)             │
  │ State Management      │ Zustand (lightweight global state)             │
  │ Icons                 │ Lucide React                                   │
  │ Rich Text Editor      │ TipTap (for admin event descriptions)          │
  │ PDF Generation        │ @react-pdf/renderer                            │
  │ QR Code               │ qrcode (npm package)                           │
  │ Charts (Admin)        │ Recharts                                       │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Backend               │ Next.js API Routes + Server Actions            │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Database              │ Supabase (PostgreSQL)                          │
  │ ORM / Query           │ Supabase JS Client (@supabase/supabase-js)     │
  │ Authentication        │ Supabase Auth (Google + OTP Email)             │
  │ Storage               │ Supabase Storage                               │
  │ Realtime              │ Supabase Realtime (live participant count)      │
  │ Row Level Security    │ Supabase RLS Policies                          │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Payment Gateway       │ Cashfree Payments                              │
  │ Email Service         │ Resend                                         │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Hosting               │ Vercel (frontend + API routes)                 │
  │ Database Hosting      │ Supabase (managed cloud)                       │
  │ CDN / Media           │ Supabase Storage CDN                           │
  ├───────────────────────┼────────────────────────────────────────────────┤
  │ Version Control       │ GitHub                                         │
  │ CI/CD                 │ Vercel ↔ GitHub Integration (auto-deploy)      │
  └───────────────────────┴────────────────────────────────────────────────┘

  Why This Stack:
  ───────────────
  · Supabase  → Replaces entire backend (DB + Auth + Storage + Realtime)
                No need to build auth manually. RLS keeps data secure.
  · Next.js   → SEO-friendly SSR + fast page loads + API routes in one project
  · Cashfree  → Best Indian payment gateway (UPI, Cards, NetBanking, Wallets)
  · Resend    → Simple, reliable transactional email with React templates
  · Vercel    → Zero-config deployment with auto preview deploys
  · GSAP      → Industry standard for premium, cinematic web animations


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  5. SYSTEM ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Request Flow:
  ─────────────
  User (Browser)
       │
       ▼
  Next.js Frontend (Vercel)
       │  ← Server Components fetch data directly from Supabase
       │  ← Client Components call API Routes for mutations
       ▼
  Next.js API Routes / Server Actions
       │  ← All business logic lives here (server-side only)
       │  ← All .env secrets used only here, never exposed to browser
       ▼
  Supabase (PostgreSQL + Auth + Storage)
       │
       ▼
  Cashfree Payment Gateway
       │  ← Order created server-side
       │  ← User redirected to Cashfree hosted checkout
       ▼
  Cashfree Webhook → /api/payments/webhook
       │  ← Signature verified server-side using secret from .env
       │  ← Payment status updated in Supabase
       ▼
  Resend Email API
       │  ← Triggered only after webhook verification
       ▼
  User gets confirmation email + PDF ticket


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  6. ENVIRONMENT VARIABLES (.env)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  CRITICAL RULES — READ BEFORE CODING:
  ─────────────────────────────────────
  1. ALL sensitive credentials MUST live in .env.local (development)
     and in Vercel Environment Variables (production). NEVER anywhere else.
  2. Add .env.local to .gitignore immediately. Never commit it.
  3. Maintain a .env.example with placeholder values (safe to commit).
  4. NEXT_PUBLIC_ prefix = value is exposed to the browser.
     Only put NON-SECRET values with this prefix.
  5. Everything WITHOUT NEXT_PUBLIC_ = server-side only.
     All API keys, secrets, service role keys go here.
  6. Rotate keys immediately if accidentally pushed to Git.
  7. Use separate Supabase projects for development vs production.
  8. Use Cashfree TEST mode in development, PROD mode only in production.

  ─────────────────────────────────────────────────────────────────────────────
  File: .env.local
  ─────────────────────────────────────────────────────────────────────────────

  # ════════════════════════════════════════════
  # APP CONFIG
  # ════════════════════════════════════════════
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_APP_NAME="Your Brand Name"
  NEXT_PUBLIC_APP_TAGLINE="Push Your Limits"

  # ════════════════════════════════════════════
  # SUPABASE (Database + Auth + Storage)
  # ════════════════════════════════════════════
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

  # Service Role Key — NEVER expose to browser — server-side only
  SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

  # ════════════════════════════════════════════
  # SUPABASE STORAGE
  # ════════════════════════════════════════════
  NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1/object/public
  SUPABASE_STORAGE_BUCKET_BANNERS=event-banners
  SUPABASE_STORAGE_BUCKET_GALLERY=gallery
  SUPABASE_STORAGE_BUCKET_ID_PROOFS=id-proofs
  SUPABASE_STORAGE_BUCKET_TICKETS=tickets

  # ════════════════════════════════════════════
  # CASHFREE PAYMENTS
  # ════════════════════════════════════════════
  # Use TEST credentials in development, PROD credentials in production
  CASHFREE_APP_ID=your_cashfree_app_id_here
  CASHFREE_SECRET_KEY=your_cashfree_secret_key_here
  CASHFREE_ENV=TEST
  # CASHFREE_ENV=PROD   ← uncomment this in production .env

  NEXT_PUBLIC_CASHFREE_ENV=TEST
  # Webhook secret for signature verification
  CASHFREE_WEBHOOK_SECRET=your_cashfree_webhook_secret_here

  # ════════════════════════════════════════════
  # RESEND (Email Service)
  # ════════════════════════════════════════════
  RESEND_API_KEY=re_your_resend_api_key_here
  RESEND_FROM_EMAIL=noreply@yourdomain.com
  RESEND_FROM_NAME="Your Brand Name"
  ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com

  # ════════════════════════════════════════════
  # ADMIN ACCESS CONTROL
  # ════════════════════════════════════════════
  # Comma-separated list of emails allowed admin access
  ADMIN_EMAIL_WHITELIST=admin@yourdomain.com,superadmin@yourdomain.com

  # ════════════════════════════════════════════
  # GST CONFIG
  # ════════════════════════════════════════════
  NEXT_PUBLIC_GST_PERCENT=18

  ─────────────────────────────────────────────────────────────────────────────
  File: .env.example  (commit this to Git — placeholder values only)
  ─────────────────────────────────────────────────────────────────────────────

  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NEXT_PUBLIC_APP_NAME="Your Brand Name"
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  CASHFREE_APP_ID=your_cashfree_app_id
  CASHFREE_SECRET_KEY=your_cashfree_secret_key
  CASHFREE_ENV=TEST
  CASHFREE_WEBHOOK_SECRET=your_webhook_secret
  RESEND_API_KEY=re_your_key
  RESEND_FROM_EMAIL=noreply@yourdomain.com
  ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
  ADMIN_EMAIL_WHITELIST=admin@yourdomain.com

  ─────────────────────────────────────────────────────────────────────────────
  File: .gitignore  (add these lines)
  ─────────────────────────────────────────────────────────────────────────────

  .env
  .env.local
  .env.development.local
  .env.test.local
  .env.production.local


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  7. SUPABASE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Supabase Project Setup Steps:
  ─────────────────────────────
  1. Create a new Supabase project at supabase.com
  2. Note: Project URL, Anon Key, Service Role Key → put in .env.local
  3. Enable Authentication providers:
       · Google OAuth (configure in Supabase Auth → Providers → Google)
       · Email OTP (enable in Supabase Auth → Providers → Email)
  4. Create Storage Buckets (see below)
  5. Run SQL migrations to create tables (see Section 8)
  6. Set up Row Level Security (RLS) policies (see below)

  Supabase Storage Buckets:
  ─────────────────────────
  ┌──────────────────────┬──────────────┬───────────────────────────────────┐
  │ Bucket Name          │ Access       │ Purpose                           │
  ├──────────────────────┼──────────────┼───────────────────────────────────┤
  │ event-banners        │ Public       │ Event hero/banner images          │
  │ gallery              │ Public       │ Event gallery photos              │
  │ sponsor-logos        │ Public       │ Sponsor logos for marquee         │
  │ id-proofs            │ Private      │ User-uploaded government ID       │
  │ tickets              │ Private      │ Generated PDF tickets             │
  └──────────────────────┴──────────────┴───────────────────────────────────┘

  NOTE: Private buckets require a signed URL generated server-side
        using the SUPABASE_SERVICE_ROLE_KEY — never from the browser.

  Row Level Security (RLS) Policies:
  ────────────────────────────────────
  · users table
      - SELECT: user can read only their own row
      - UPDATE: user can update only their own row
      - Admin: full access via service role key (server-side only)

  · events table
      - SELECT: anyone can read published events (is_published = true)
      - INSERT/UPDATE/DELETE: admin only (via service role, server-side)

  · registrations table
      - SELECT: user can read only their own registrations
      - INSERT: authenticated users only
      - UPDATE: server-side only (via service role after payment webhook)

  · payments table
      - SELECT: user can read only their own payments
      - INSERT/UPDATE: server-side only (webhook handler, service role)

  · email_logs table
      - No direct access from client. Server-side only.

  · id-proofs bucket
      - Upload: authenticated user (their own file only)
      - Read: server-side admin only (signed URL)

  · tickets bucket
      - Upload: server-side only
      - Read: authenticated user (their own ticket only, signed URL)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  8. DATABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  All tables use PostgreSQL via Supabase. UUID primary keys throughout.
  Timestamps use timezone-aware TIMESTAMPTZ with DEFAULT now().

  ───────────────────────────────────────────────
  TABLE: users
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  supabase_uid          UUID              UNIQUE (links to Supabase Auth)
  name                  VARCHAR(255)      NOT NULL
  email                 VARCHAR(255)      UNIQUE NOT NULL
  phone                 VARCHAR(15)
  gender                VARCHAR(20)
  city                  VARCHAR(100)
  date_of_birth         DATE
  avatar_url            TEXT
  role                  VARCHAR(20)       DEFAULT 'user'  ('user' | 'admin')
  is_active             BOOLEAN           DEFAULT true
  created_at            TIMESTAMPTZ       DEFAULT now()
  updated_at            TIMESTAMPTZ       DEFAULT now()

  ───────────────────────────────────────────────
  TABLE: events
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  title                 VARCHAR(255)      NOT NULL
  slug                  VARCHAR(255)      UNIQUE NOT NULL
  short_description     VARCHAR(500)
  description           TEXT
  banner_url            TEXT
  gallery_urls          TEXT[]            (array of Supabase Storage URLs)
  video_url             TEXT
  event_date            TIMESTAMPTZ       NOT NULL
  registration_deadline TIMESTAMPTZ
  city                  VARCHAR(100)
  venue                 TEXT
  google_maps_url       TEXT
  distance_km           DECIMAL(5,2)
  difficulty            VARCHAR(20)       ('beginner'|'intermediate'|
                                          'advanced'|'elite')
  ticket_price          DECIMAL(10,2)     NOT NULL
  gst_percent           DECIMAL(5,2)      DEFAULT 18.00
  max_participants      INTEGER
  prize_pool            JSONB             { "first": 50000, "second": 25000,
                                            "third": 10000 }
  rules                 TEXT
  eligibility           TEXT
  schedule              JSONB             [{ "time": "06:00", "activity":
                                            "Flag-off" }]
  faq                   JSONB             [{ "question": "...",
                                            "answer": "..." }]
  seo_title             VARCHAR(255)
  seo_description       VARCHAR(500)
  status                VARCHAR(20)       DEFAULT 'draft'
                                          ('draft'|'published'|'cancelled')
  is_featured           BOOLEAN           DEFAULT false
  created_by            UUID              REFERENCES users(id)
  created_at            TIMESTAMPTZ       DEFAULT now()
  updated_at            TIMESTAMPTZ       DEFAULT now()

  ───────────────────────────────────────────────
  TABLE: registrations
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  registration_code     VARCHAR(20)       UNIQUE NOT NULL
                                          (e.g. FIT-2026-00123)
  user_id               UUID              REFERENCES users(id)
  event_id              UUID              REFERENCES events(id)
  full_name             VARCHAR(255)      NOT NULL
  email                 VARCHAR(255)      NOT NULL
  phone                 VARCHAR(15)       NOT NULL
  age                   INTEGER           NOT NULL
  gender                VARCHAR(20)
  city                  VARCHAR(100)
  emergency_contact     VARCHAR(255)      NOT NULL
  emergency_phone       VARCHAR(15)       NOT NULL
  tshirt_size           VARCHAR(5)        ('XS'|'S'|'M'|'L'|'XL'|'XXL')
  medical_conditions    TEXT
  id_proof_url          TEXT              (Supabase Storage private URL)
  waiver_accepted       BOOLEAN           NOT NULL DEFAULT false
  status                VARCHAR(20)       DEFAULT 'pending'
                                          ('pending'|'confirmed'|
                                          'cancelled'|'rejected')
  payment_status        VARCHAR(20)       DEFAULT 'pending'
                                          ('pending'|'paid'|'failed'|
                                          'refunded')
  ticket_url            TEXT              (Supabase Storage signed URL)
  qr_code_data          TEXT              (Unique QR payload string)
  created_at            TIMESTAMPTZ       DEFAULT now()
  updated_at            TIMESTAMPTZ       DEFAULT now()

  UNIQUE CONSTRAINT: (user_id, event_id) → one registration per user per event

  ───────────────────────────────────────────────
  TABLE: payments
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  registration_id       UUID              REFERENCES registrations(id)
  user_id               UUID              REFERENCES users(id)
  base_amount           DECIMAL(10,2)     NOT NULL
  gst_amount            DECIMAL(10,2)     NOT NULL
  total_amount          DECIMAL(10,2)     NOT NULL
  gateway               VARCHAR(50)       DEFAULT 'cashfree'
  cashfree_order_id     VARCHAR(255)      UNIQUE NOT NULL
  cashfree_payment_id   VARCHAR(255)
  payment_method        VARCHAR(100)      (UPI | Card | NetBanking | Wallet)
  status                VARCHAR(20)       DEFAULT 'initiated'
                                          ('initiated'|'success'|
                                          'failed'|'refunded')
  webhook_verified      BOOLEAN           DEFAULT false
  gateway_response      JSONB             (raw Cashfree webhook payload)
  paid_at               TIMESTAMPTZ
  created_at            TIMESTAMPTZ       DEFAULT now()
  updated_at            TIMESTAMPTZ       DEFAULT now()

  ───────────────────────────────────────────────
  TABLE: email_logs
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  recipient_email       VARCHAR(255)      NOT NULL
  email_type            VARCHAR(100)      ('registration_confirmed'|
                                          'payment_receipt'|'ticket'|
                                          'reminder'|'admin_alert')
  registration_id       UUID              REFERENCES registrations(id)
  resend_message_id     VARCHAR(255)
  status                VARCHAR(50)       ('sent'|'failed'|'bounced')
  error_message         TEXT
  sent_at               TIMESTAMPTZ       DEFAULT now()

  ───────────────────────────────────────────────
  TABLE: sponsors
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  name                  VARCHAR(255)      NOT NULL
  logo_url              TEXT              NOT NULL (Supabase Storage URL)
  website_url           TEXT
  display_order         INTEGER           DEFAULT 0
  is_active             BOOLEAN           DEFAULT true
  created_at            TIMESTAMPTZ       DEFAULT now()

  ───────────────────────────────────────────────
  TABLE: testimonials
  ───────────────────────────────────────────────
  Column                Type              Constraints
  ──────────────────    ────────────────  ──────────────────────────────────
  id                    UUID              PK, DEFAULT gen_random_uuid()
  user_name             VARCHAR(255)      NOT NULL
  designation           VARCHAR(255)
  avatar_url            TEXT
  content               TEXT              NOT NULL
  rating                INTEGER           CHECK (rating BETWEEN 1 AND 5)
  event_id              UUID              REFERENCES events(id)
  is_approved           BOOLEAN           DEFAULT false
  display_order         INTEGER           DEFAULT 0
  created_at            TIMESTAMPTZ       DEFAULT now()


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  9. AUTHENTICATION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Provider: Supabase Auth (built-in — no custom auth needed)
  Credentials stored: Supabase only — NEVER in your own DB

  ─────────────────────
  USER AUTHENTICATION
  ─────────────────────
  Option A — Google OAuth:
    1. User clicks "Continue with Google"
    2. Supabase Auth redirects to Google consent screen
    3. Google returns to /auth/callback
    4. Supabase creates/finds user in Auth table
    5. App upserts user row in public.users table
    6. User is now logged in with a session cookie

  Option B — Email OTP:
    1. User enters email address
    2. Supabase Auth sends a 6-digit OTP to that email
    3. User enters OTP on /auth/verify page
    4. Supabase verifies OTP and creates session
    5. App upserts user row in public.users table

  Session Handling:
    · Supabase JS Client handles session automatically via cookies
    · Use createServerComponentClient for Server Components
    · Use createClientComponentClient for Client Components
    · Middleware at /middleware.ts checks auth for protected routes

  Protected Routes (require login):
    /events/[slug]/register  → redirect to /login if not authenticated
    /profile                 → redirect to /login if not authenticated
    /admin/*                 → redirect to /admin/login + role check

  ─────────────────────
  ADMIN AUTHENTICATION
  ─────────────────────
    1. Admin navigates to /admin/login
    2. Admin signs in with Google or Email OTP via Supabase Auth
    3. After login, middleware checks:
         · Is user in public.users table?
         · Is user's role = 'admin'?
         · Is user's email in ADMIN_EMAIL_WHITELIST (.env)?
    4. All three must pass — else redirect to / with "Access Denied"
    5. Admin role is set manually in Supabase dashboard or via
       service-role SQL for the first admin.

  Supabase Auth Redirect URLs to configure:
    · http://localhost:3000/auth/callback   (development)
    · https://yourdomain.com/auth/callback  (production)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  10. WEBSITE PAGES & SECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ──────────────────────────────────────────────────────────────────────────
  A. HOME PAGE  [ Route: / ]
  ──────────────────────────────────────────────────────────────────────────

  [1] HERO SECTION
      · Fullscreen looping video background (compressed .mp4, lazy loaded)
      · Noise texture overlay for depth
      · Floating golden particle system (canvas-based or GSAP)
      · Animated staggered text reveal on load (GSAP)
      · Main headline + subheadline
      · Two CTA buttons:
          → "Join Challenge"  (gold filled, magnetic hover)
          → "Explore Races"   (white outlined, magnetic hover)
      · Scroll indicator arrow (bouncing animation)
      · Lenis smooth scroll initialized at layout level

  [2] UPCOMING RACES SECTION
      · Section heading with GSAP scroll-triggered word reveal
      · Responsive event cards grid (3 cols desktop | 2 tablet | 1 mobile)
      · Each event card contains:
          → Event banner image (lazy loaded)
          → Race name, date, city
          → Difficulty badge (color coded)
          → Prize pool amount (gold text)
          → "Register Now" CTA button
      · Card interactions: 3D tilt on hover + gold glow border
      · Cards animate in with staggered scroll reveal (Framer Motion)
      · "View All Events" link at section bottom

  [3] ABOUT US / BRAND SECTION
      · Mission statement (large bold typography)
      · Animated counter stats (count-up on scroll entry):
          → 5000+ Runners Registered
          → 20+ Events Hosted
          → 10+ Cities
          → ₹X Crore in Prizes
      · Brand story paragraph
      · Event history timeline (alternating left-right with scroll reveal)
      · Background: dark texture with gold gradient overlay

  [4] TESTIMONIALS SECTION
      · Section heading
      · Auto-scrolling horizontal card slider (pause on hover)
      · Each testimonial card:
          → User name + designation
          → Star rating (1–5)
          → Quote/review text
          → Event name tag
      · Navigation dots or arrows

  [5] SPONSORS SECTION
      · "Our Partners" heading
      · Infinite left-scrolling logo marquee (CSS animation)
      · Pauses on hover
      · Sponsor logos from Supabase Storage (event-banners bucket)

  [6] FOOTER
      · Logo + tagline
      · Quick Links: Events | About | Contact | FAQ
      · Social Links: Instagram | YouTube | Twitter/X | Strava
      · Newsletter email input + "Subscribe" button
      · Legal links: Privacy Policy | Terms of Service | Refund Policy
      · Copyright line

  ──────────────────────────────────────────────────────────────────────────
  B. EVENTS LISTING PAGE  [ Route: /events ]
  ──────────────────────────────────────────────────────────────────────────
  · Page title + hero banner (static, not full-screen)
  · Filter bar:
      → City (dropdown)
      → Difficulty (multi-select chips)
      → Date (upcoming / past)
  · Search input (live filter, no page reload)
  · Events grid (same card design as home)
  · Pagination (12 events per page)
  · Empty state illustration if no events match filters

  ──────────────────────────────────────────────────────────────────────────
  C. EVENT DETAILS PAGE  [ Route: /events/[slug] ]
  ──────────────────────────────────────────────────────────────────────────

  Data fetched server-side (SSR) for SEO.

  [1] HERO BANNER
      · Full-width event banner image (blur-up loading)
      · Event title overlay (large, bold)
      · Live countdown timer (DD : HH : MM : SS) updating every second
      · "Register Now" CTA button

  [2] EVENT INFO BAR
      · Date & Time | City | Venue | Distance | Difficulty | Spots Left
      · "Spots Left" from Supabase Realtime (live updates)

  [3] CHALLENGE DETAILS TABS / SECTIONS
      · About the Event (description)
      · Rules & Regulations
      · Eligibility Criteria
      · Event Day Schedule (timeline component)
      · Venue & Map (Google Maps embed URL)

  [4] PRIZE POOL SECTION
      · Three animated cards: 🥇 1st | 🥈 2nd | 🥉 3rd
      · Gold metallic gradient card backgrounds
      · Prize amount with count-up animation on scroll entry
      · Special glow effect on 1st prize card

  [5] GALLERY SECTION
      · Masonry grid of past event photos (from gallery bucket)
      · Click to open Framer Motion lightbox overlay
      · Left/right navigation in lightbox

  [6] FAQ SECTION
      · Accordion-style questions and answers
      · Smooth Framer Motion expand/collapse
      · Last item: link to contact support

  [7] STICKY BOTTOM REGISTRATION BAR
      · Appears after scrolling past hero
      · Contains: Event name | Price | "Register Now" button
      · Hides when user scrolls to registration CTA or footer
      · Gold gradient background, full-width

  ──────────────────────────────────────────────────────────────────────────
  D. REGISTRATION PAGE  [ Route: /events/[slug]/register ]
  ──────────────────────────────────────────────────────────────────────────
  See Section 11 — Registration & Payment Flow.

  ──────────────────────────────────────────────────────────────────────────
  E. REGISTRATION SUCCESS PAGE  [ Route: /registration/success ]
  ──────────────────────────────────────────────────────────────────────────
  · Query param: ?ref=FIT-2026-00123 (registration_code)
  · Confetti + gold glow celebration animation on load
  · Registration code displayed prominently
  · Event summary: name, date, venue, t-shirt size
  · "Download Ticket" button (fetches signed URL from Supabase)
  · "Check your email" message
  · Share on Instagram / WhatsApp buttons
  · "View My Registrations" link → /profile

  ──────────────────────────────────────────────────────────────────────────
  F. USER PROFILE PAGE  [ Route: /profile ]
  ──────────────────────────────────────────────────────────────────────────
  · Protected route (requires login)
  · User info: name, email, phone (editable)
  · My Registrations: list of past and upcoming event registrations
      → Each shows: event name, date, registration code, status, payment
      → Download ticket button per registration
  · Logout button

  ──────────────────────────────────────────────────────────────────────────
  G. AUTH PAGES
  ──────────────────────────────────────────────────────────────────────────
  /login          → "Continue with Google" + Email OTP input
  /auth/verify    → OTP entry screen (6-digit input, auto-focus)
  /auth/callback  → Supabase OAuth callback handler (no visible UI)

  ──────────────────────────────────────────────────────────────────────────
  H. STATIC PAGES
  ──────────────────────────────────────────────────────────────────────────
  /about              → Full brand/team story
  /contact            → Contact form + email + social links
  /privacy-policy     → Legal page (markdown rendered)
  /terms-of-service   → Legal page (markdown rendered)
  /refund-policy      → Refund & cancellation policy


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  11. REGISTRATION & PAYMENT FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ──────────────────────────────────
  STEP 0 — PRE-CHECKS (before form)
  ──────────────────────────────────
  Check on page load (server-side):
  · Is user logged in?              → No  → redirect to /login
  · Is registration deadline open?  → No  → show "Registration Closed"
  · Is event at max_participants?   → Yes → show "Sold Out"
  · Has user already registered?    → Yes → show "Already Registered" +
                                            link to their ticket

  ───────────────────────────────────────────────
  STEP 1 — REGISTRATION FORM  (3 steps / stepper)
  ───────────────────────────────────────────────
  UI: Multi-step stepper component with progress indicator (gold)

  Step 1A — Personal Details:
    · Full Name *
    · Email Address * (pre-filled from Supabase Auth session)
    · Mobile Number * (with +91 prefix)
    · Age *
    · Gender * (Male | Female | Other | Prefer not to say)
    · City *

  Step 1B — Event Details:
    · Emergency Contact Name *
    · Emergency Contact Phone *
    · T-Shirt Size * (XS | S | M | L | XL | XXL)
    · Any Medical Conditions (textarea, optional)

  Step 1C — Documents & Agreement:
    · ID Proof Upload * (Aadhaar | PAN | Passport)
        → Accepted formats: JPEG, PNG, PDF
        → Max size: 5MB
        → Upload to Supabase Storage (id-proofs bucket) client-side
        → Store Supabase Storage path in form state
    · Waiver Checkbox * ("I have read and agree to all terms, rules, and
                          the participant waiver")

  Validation:
    · Client-side: React Hook Form + Zod schema on every field
    · Server-side: API route re-validates all fields before saving

  ──────────────────────────────────────────
  STEP 2 — ORDER SUMMARY (review before pay)
  ──────────────────────────────────────────
  Display:
    · Event Name
    · Event Date & Venue
    · Participant Name
    · T-Shirt Size selected
    ─────────────────────────────────────────
    · Base Ticket Price        ₹ XXXX.00
    · GST (18%)                ₹  XXX.00
    ─────────────────────────────────────────
    · Total Payable            ₹ XXXX.00
    ─────────────────────────────────────────
  Buttons:
    · "← Back"           (go back to edit form)
    · "Proceed to Pay →" (gold CTA — triggers payment flow)

  ────────────────────────────────────────────
  STEP 3 — PAYMENT (Cashfree)
  ────────────────────────────────────────────
  3a. User clicks "Proceed to Pay"
  3b. Frontend calls: POST /api/payments/create-order
  3c. API Route (server-side):
       · Validates session user from Supabase Auth
       · Validates form data one final time (server-side Zod)
       · Saves registration to DB (status: 'pending', payment: 'pending')
       · Calls Cashfree API to create an order
         (uses CASHFREE_APP_ID + CASHFREE_SECRET_KEY from .env)
       · Saves payment record in DB (status: 'initiated')
       · Returns { cashfree_order_id, payment_session_id } to frontend
  3d. Frontend receives payment session and loads Cashfree JS SDK
  3e. Cashfree opens checkout (UPI | Cards | NetBanking | Wallets)
  3f. User completes payment on Cashfree's secure hosted page

  ────────────────────────────────────────────
  STEP 4 — WEBHOOK VERIFICATION (critical)
  ────────────────────────────────────────────
  IMPORTANT: NEVER trust the Cashfree redirect alone for payment status.
             Only update payment status after webhook signature verification.

  4a. Cashfree sends POST to: /api/payments/webhook
  4b. API Route (server-side):
       · Reads raw request body (do NOT parse before verifying)
       · Verifies webhook signature using CASHFREE_WEBHOOK_SECRET from .env
         (HMAC-SHA256 of timestamp + raw body)
       · If signature invalid → return 400, log and ignore
       · If signature valid + status = 'SUCCESS':
           - Update payments row: status → 'success', webhook_verified → true,
             cashfree_payment_id, payment_method, paid_at → now()
           - Update registrations row: payment_status → 'paid',
             status → 'confirmed', generate registration_code
           - Generate PDF ticket (server-side) → upload to Supabase
             tickets bucket → update ticket_url in registrations
           - Trigger Resend email (confirmation + receipt + ticket)
           - Trigger admin notification email
       · If status = 'FAILED':
           - Update payments row: status → 'failed'
           - Update registrations row: payment_status → 'failed'
       · Always return 200 to Cashfree to acknowledge webhook

  ────────────────────────────────────────────
  STEP 5 — SUCCESS PAGE
  ────────────────────────────────────────────
  5a. Cashfree redirects user to:
      /registration/success?ref={registration_code}
  5b. Page fetches registration from DB using registration_code
  5c. If payment_status is still 'pending' (webhook not yet received):
       → Show "Processing payment..." with auto-refresh every 3 seconds
       → Once confirmed, show full success screen
  5d. Success screen (see Section 10-E)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  12. EMAIL NOTIFICATION SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Provider  : Resend (API key: RESEND_API_KEY in .env)
  Templates : React Email components (branded HTML emails)
  From      : RESEND_FROM_EMAIL from .env
  Trigger   : All emails sent from server-side API routes ONLY
              (never from client-side code)

  ─────────────────────────────────────────────────────────────
  EMAILS TO USER
  ─────────────────────────────────────────────────────────────

  [1] Registration Confirmation
      Trigger  : After webhook success (payment confirmed)
      Subject  : "You're In! Registration Confirmed — {Event Name}"
      Content  :
        · Personalised greeting with user first name
        · Registration Code (large, prominent)
        · Event: Name | Date | Time | Venue
        · Participant: Name | T-Shirt Size
        · "Download Ticket" button (links to signed Supabase URL)
        · "Add to Google Calendar" link
        · Support contact info

  [2] Payment Receipt
      Trigger  : Same as above (sent together or 1 min after)
      Subject  : "Payment Receipt — {Event Name} | ₹{Total}"
      Content  :
        · Invoice-style layout
        · Transaction ID (Cashfree)
        · Date & time of payment
        · Base amount + GST + Total
        · Payment method used

  [3] Ticket Email (with PDF attachment)
      Trigger  : After PDF ticket generated and uploaded to Supabase
      Subject  : "Your Race Bib & Ticket — {Event Name}"
      Content  :
        · Attached PDF ticket
        · QR code (unique per registration for check-in)
        · Event day instructions and what to bring

  [4] Event Reminder
      Trigger  : Scheduled job — 3 days before event_date (via Vercel Cron)
      Subject  : "3 Days Left! {Event Name} is Almost Here 🏃"
      Content  :
        · Date, time, venue reminder
        · Google Maps link
        · What to bring checklist
        · Organizer emergency contact

  ─────────────────────────────────────────────────────────────
  EMAILS TO ADMIN
  ─────────────────────────────────────────────────────────────

  [5] New Registration Alert
      Trigger  : After every new confirmed registration
      Subject  : "New Registration — {Name} for {Event Name}"
      Content  :
        · Full participant details
        · Payment amount
        · Registration code
        · Link to admin panel

  [6] Daily Summary
      Trigger  : Vercel Cron — daily at 8:00 AM IST
      Subject  : "Daily Report — {Date} | {Platform Name}"
      Content  :
        · Total registrations (today + all time)
        · Revenue (today + all time)
        · Tickets sold per event
        · Failed payments count


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  13. ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Route Prefix : /admin/*
  Access       : users.role = 'admin' + email in ADMIN_EMAIL_WHITELIST
  Auth         : Supabase Auth session + middleware RLS check
  UI Style     : Dark theme with gold accents (consistent with main brand)

  ─────────────────────────────────────────────────
  [1] ADMIN DASHBOARD  [ /admin ]
  ─────────────────────────────────────────────────
  Stats Cards (top row):
    · Total Users on platform
    · Total Revenue collected (₹)
    · Total Tickets sold
    · Overall registration conversion rate (%)
    · Events: Published vs Draft count

  Charts (Recharts):
    · Line chart — Daily registrations (last 30 days)
    · Bar chart  — Revenue per event
    · Pie chart  — Payment status breakdown (success/failed/pending)

  Quick Actions:
    · Create New Event
    · Export All Registrations (CSV)
    · Send Bulk Reminder Email

  ─────────────────────────────────────────────────
  [2] EVENT MANAGEMENT  [ /admin/events ]
  ─────────────────────────────────────────────────
  List View:
    · All events table: Title | Date | City | Status | Participants | Actions
    · Status badge: Draft | Published | Cancelled
    · Actions per row: Edit | View | Delete | Duplicate | Toggle Publish

  Create / Edit Event Form:
    · All fields from events table
    · Banner image upload → Supabase event-banners bucket
    · Gallery images upload (multi-file) → Supabase gallery bucket
    · TipTap rich text editor for description and rules
    · Prize pool builder: 1st, 2nd, 3rd prize input
    · Schedule builder: add/remove time slots (time + activity label)
    · FAQ builder: add/remove Q&A pairs
    · SEO fields: seo_title, seo_description
    · Toggle: Draft / Published
    · Toggle: Featured (shows prominently on home page)
    · Max Participants limit

  ─────────────────────────────────────────────────
  [3] REGISTRATION MANAGEMENT  [ /admin/registrations ]
  ─────────────────────────────────────────────────
  List View (filterable table):
    · Filters: Event | Payment Status | Registration Status | Date range
    · Search: name, email, registration code
    · Columns: Code | Name | Email | Event | Status | Payment | T-Shirt | Date
    · Sortable columns

  Per Registration Actions:
    · View full details (slide-over panel)
    · Approve / Reject
    · Resend confirmation email
    · Download ID proof (signed Supabase URL, server-side)
    · View / Re-download ticket

  Bulk Actions:
    · Export selected → CSV
    · Export all (filtered) → Excel (.xlsx)
    · Send bulk email to filtered list (with Resend)

  ─────────────────────────────────────────────────
  [4] PAYMENT MANAGEMENT  [ /admin/payments ]
  ─────────────────────────────────────────────────
  · All payments table: Amount | Gateway | Status | Method | Date
  · Filter by: status | event | date range
  · Cashfree transaction ID (link to Cashfree dashboard)
  · Revenue summary by event and date range
  · Failed payments count with reason

  ─────────────────────────────────────────────────
  [5] USER MANAGEMENT  [ /admin/users ]
  ─────────────────────────────────────────────────
  · All users list
  · Search by email / phone / name
  · View user's full registration history
  · Promote user to admin role
  · Deactivate user account

  ─────────────────────────────────────────────────
  [6] EMAIL MANAGER  [ /admin/emails ]
  ─────────────────────────────────────────────────
  · View email_logs table: recipient | type | status | sent_at
  · Filter by type, status, date
  · Retry failed emails (resend)
  · Send bulk email: select event → compose → send via Resend
  · Templates: Race Reminder | Results Announcement | Custom

  ─────────────────────────────────────────────────
  [7] SPONSORS MANAGEMENT  [ /admin/sponsors ]
  ─────────────────────────────────────────────────
  · Upload sponsor logo → Supabase sponsor-logos bucket
  · Set name + website URL
  · Set display_order for marquee
  · Toggle active / inactive


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  14. ANIMATION STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────┬─────────────────────────────────────────────────────┐
  │ Library          │ Use For                                             │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ GSAP             │ Hero text stagger reveals                           │
  │ + ScrollTrigger  │ Scroll-triggered animations (pin, scrub, parallax)  │
  │                  │ Golden light streak animations                      │
  │                  │ Count-up number animations on scroll                │
  │                  │ Timeline/history section animations                 │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ Framer Motion    │ Page transitions (AnimatePresence)                  │
  │                  │ Card hover effects (scale, glow)                    │
  │                  │ Modal and lightbox transitions                      │
  │                  │ FAQ accordion expand/collapse                       │
  │                  │ Sticky bar show/hide transitions                    │
  │                  │ Countdown timer digit flip                          │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ Lenis            │ Smooth momentum scroll (global, layout level)       │
  │                  │ Works together with GSAP ScrollTrigger              │
  ├──────────────────┼─────────────────────────────────────────────────────┤
  │ CSS              │ Infinite sponsor marquee scroll                     │
  │                  │ Noise texture overlay                               │
  │                  │ Gold gradient backgrounds                           │
  │                  │ Pulse/glow keyframe animations                      │
  └──────────────────┴─────────────────────────────────────────────────────┘

  Specific Animation Details:
  ───────────────────────────
  · Hero Section:
      - Background video plays muted + autoplay + loop + playsInline
      - GSAP SplitText: headline letters animate in with stagger
      - Floating golden particles: canvas overlay (requestAnimationFrame)
      - CTA buttons: magnetic hover effect (mouse tracking)
      - Parallax: hero content moves at 0.5x scroll speed

  · Event Cards:
      - 3D tilt on mouse move (Framer Motion useMotionValue)
      - Gold glow box-shadow on hover
      - Stagger-in animation as cards enter viewport

  · Section Transitions:
      - Clip-path wipe reveals (GSAP ScrollTrigger)
      - Blur-to-sharp fade on scroll (Framer Motion)
      - Section headings: word-by-word reveal

  · Prize Pool Cards:
      - Number count-up animation (GSAP) on scroll entry
      - Gold shimmer keyframe on 1st place card
      - Scale-up entrance with spring easing

  IMPORTANT PERFORMANCE NOTES:
  ─────────────────────────────
  · All animation components MUST use "use client" directive
  · Compress all videos: max 5MB, 1920x1080, 30fps, H.264
  · Deliver videos from Supabase Storage CDN (not bundled)
  · Use will-change: transform sparingly (only on actively animated els)
  · Disable/reduce animations if prefers-reduced-motion media query is set
  · Test on low-end Android devices (target 60fps on mid-range phones)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  15. FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  fitness-platform/
  ├── .env.example                     ← Safe to commit (no real values)
  ├── .env.local                       ← NEVER commit (real secrets)
  ├── .gitignore
  ├── next.config.ts
  ├── tailwind.config.ts
  ├── tsconfig.json
  ├── package.json
  │
  ├── public/
  │   ├── fonts/                       ← Bebas Neue, Inter (local fonts)
  │   ├── images/                      ← Static images (logo, og-image)
  │   └── videos/                      ← Hero video fallback poster image
  │
  └── src/
      ├── app/                         ← Next.js App Router pages
      │   ├── layout.tsx               ← Root layout (Lenis init here)
      │   ├── page.tsx                 ← Home page (/)
      │   ├── events/
      │   │   ├── page.tsx             ← /events listing
      │   │   └── [slug]/
      │   │       ├── page.tsx         ← /events/[slug] details
      │   │       └── register/
      │   │           └── page.tsx     ← /events/[slug]/register
      │   ├── registration/
      │   │   └── success/
      │   │       └── page.tsx         ← /registration/success
      │   ├── profile/
      │   │   └── page.tsx             ← /profile (protected)
      │   ├── auth/
      │   │   ├── login/
      │   │   │   └── page.tsx         ← /login
      │   │   ├── verify/
      │   │   │   └── page.tsx         ← /auth/verify (OTP)
      │   │   └── callback/
      │   │       └── route.ts         ← /auth/callback (Supabase OAuth)
      │   ├── admin/
      │   │   ├── layout.tsx           ← Admin layout (auth check)
      │   │   ├── page.tsx             ← /admin (dashboard)
      │   │   ├── login/page.tsx
      │   │   ├── events/
      │   │   │   ├── page.tsx
      │   │   │   ├── create/page.tsx
      │   │   │   └── [id]/edit/page.tsx
      │   │   ├── registrations/page.tsx
      │   │   ├── payments/page.tsx
      │   │   ├── users/page.tsx
      │   │   ├── emails/page.tsx
      │   │   └── sponsors/page.tsx
      │   ├── api/
      │   │   ├── auth/
      │   │   │   └── [...supabase]/route.ts
      │   │   ├── payments/
      │   │   │   ├── create-order/route.ts  ← Creates Cashfree order
      │   │   │   └── webhook/route.ts       ← Cashfree webhook handler
      │   │   ├── registrations/
      │   │   │   └── route.ts              ← Save registration
      │   │   ├── tickets/
      │   │   │   └── [id]/route.ts         ← Generate + serve PDF ticket
      │   │   ├── emails/
      │   │   │   └── send/route.ts         ← Trigger email sends
      │   │   └── admin/
      │   │       ├── events/route.ts
      │   │       ├── registrations/route.ts
      │   │       └── export/route.ts
      │   └── (static-pages)/
      │       ├── about/page.tsx
      │       ├── contact/page.tsx
      │       ├── privacy-policy/page.tsx
      │       ├── terms-of-service/page.tsx
      │       └── refund-policy/page.tsx
      │
      ├── components/                  ← Reusable UI components
      │   ├── ui/                      ← Base elements (Button, Input, Badge)
      │   ├── layout/
      │   │   ├── Navbar.tsx
      │   │   ├── Footer.tsx
      │   │   └── AdminSidebar.tsx
      │   ├── events/
      │   │   ├── EventCard.tsx
      │   │   ├── EventGrid.tsx
      │   │   ├── CountdownTimer.tsx
      │   │   └── StickyRegistrationBar.tsx
      │   ├── registration/
      │   │   ├── RegistrationStepper.tsx
      │   │   ├── Step1PersonalDetails.tsx
      │   │   ├── Step2EventDetails.tsx
      │   │   ├── Step3DocumentsWaiver.tsx
      │   │   └── OrderSummary.tsx
      │   ├── payment/
      │   │   └── CashfreeCheckout.tsx
      │   └── admin/
      │       ├── StatsCard.tsx
      │       ├── RevenueChart.tsx
      │       ├── RegistrationsTable.tsx
      │       └── EventForm.tsx
      │
      ├── sections/                    ← Page sections (larger components)
      │   ├── home/
      │   │   ├── HeroSection.tsx
      │   │   ├── UpcomingRacesSection.tsx
      │   │   ├── AboutSection.tsx
      │   │   ├── TestimonialsSection.tsx
      │   │   └── SponsorsSection.tsx
      │   └── event-detail/
      │       ├── EventHero.tsx
      │       ├── EventInfoBar.tsx
      │       ├── ChallengeDetails.tsx
      │       ├── PrizePoolSection.tsx
      │       ├── GallerySection.tsx
      │       └── FAQSection.tsx
      │
      ├── animations/                  ← GSAP + Framer Motion helpers
      │   ├── gsap/
      │   │   ├── heroAnimations.ts
      │   │   ├── scrollTriggerSetup.ts
      │   │   └── textReveal.ts
      │   ├── framer/
      │   │   ├── variants.ts          ← Shared animation variants
      │   │   └── transitions.ts
      │   └── particles/
      │       └── GoldenParticles.tsx
      │
      ├── hooks/                       ← Custom React hooks
      │   ├── useSupabaseClient.ts
      │   ├── useAuth.ts
      │   ├── useLenis.ts
      │   ├── useEventSpots.ts         ← Supabase Realtime spots left
      │   └── useCountUp.ts
      │
      ├── lib/                         ← Service integrations & utilities
      │   ├── supabase/
      │   │   ├── client.ts            ← createClientComponentClient
      │   │   ├── server.ts            ← createServerComponentClient
      │   │   ├── admin.ts             ← createClient (service role key)
      │   │   └── storage.ts           ← Storage upload/download helpers
      │   ├── cashfree/
      │   │   ├── createOrder.ts       ← Server-side order creation
      │   │   └── verifyWebhook.ts     ← Webhook signature verification
      │   ├── resend/
      │   │   ├── sendEmail.ts         ← Generic email sender
      │   │   └── templates/
      │   │       ├── RegistrationConfirmed.tsx
      │   │       ├── PaymentReceipt.tsx
      │   │       ├── TicketEmail.tsx
      │   │       ├── EventReminder.tsx
      │   │       └── AdminAlert.tsx
      │   ├── pdf/
      │   │   └── generateTicket.ts    ← PDF ticket with QR code
      │   ├── qr/
      │   │   └── generateQR.ts
      │   └── utils/
      │       ├── generateRegCode.ts   ← FIT-2026-XXXXX generator
      │       ├── calculateAmount.ts   ← base + GST calculation
      │       └── formatDate.ts
      │
      ├── styles/
      │   └── globals.css              ← Tailwind base + custom CSS vars
      │
      ├── types/
      │   ├── database.ts              ← Supabase table types (auto-gen)
      │   ├── event.ts
      │   ├── registration.ts
      │   └── payment.ts
      │
      └── middleware.ts                ← Protect /admin/* and /profile routes


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  16. API ROUTES REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────┬────────┬───────────────────────────┐
  │ Route                                │ Method │ Purpose                   │
  ├──────────────────────────────────────┼────────┼───────────────────────────┤
  │ /api/payments/create-order           │ POST   │ Create Cashfree order      │
  │ /api/payments/webhook                │ POST   │ Cashfree webhook handler  │
  │ /api/registrations                   │ POST   │ Save registration to DB   │
  │ /api/tickets/[id]                    │ GET    │ Generate/serve PDF ticket │
  │ /api/emails/send                     │ POST   │ Trigger email (internal)  │
  │ /api/admin/events                    │ GET    │ List all events (admin)   │
  │ /api/admin/events                    │ POST   │ Create event (admin)      │
  │ /api/admin/events/[id]               │ PUT    │ Update event (admin)      │
  │ /api/admin/events/[id]               │ DELETE │ Delete event (admin)      │
  │ /api/admin/registrations             │ GET    │ List registrations        │
  │ /api/admin/registrations/[id]        │ PATCH  │ Update registration       │
  │ /api/admin/export/registrations      │ GET    │ Export CSV/Excel          │
  │ /api/admin/stats                     │ GET    │ Dashboard stats           │
  │ /auth/callback                       │ GET    │ Supabase OAuth callback   │
  └──────────────────────────────────────┴────────┴───────────────────────────┘

  All /api/admin/* routes:
  · Verify Supabase session server-side
  · Check user role = 'admin' from public.users table
  · Use SUPABASE_SERVICE_ROLE_KEY for DB operations (from .env)
  · Return 401 if not authenticated, 403 if not admin


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  17. SEO REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  · Dynamic meta tags per page (Next.js Metadata API)
  · Event pages use event.seo_title + event.seo_description from DB
  · Open Graph tags (og:title, og:description, og:image) per page
  · og:image = event banner_url (served from Supabase Storage CDN)
  · Twitter Card meta tags
  · Structured Data (JSON-LD) for event pages:
      → Schema.org/Event with: name, startDate, location, offers, image
  · /sitemap.xml (auto-generated, includes all published event slugs)
  · /robots.txt (allow crawlers, disallow /admin/*)
  · Canonical URLs on all pages
  · Alt text on all images (from DB for event images)
  · Fast LCP: server-side render event details pages (generateStaticParams
    for top events, fallback: 'blocking' for rest)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  18. SECURITY REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  MUST HAVE (no exceptions):
  ─────────────────────────
  · ALL secrets in .env — never in code, never in frontend bundle
  · Cashfree webhook: verify HMAC-SHA256 signature before processing
  · Supabase RLS: enable on ALL tables (even if service role bypasses it)
  · Admin routes: protected by middleware + role check on every request
  · File uploads: validate MIME type + size server-side before accepting
  · Private bucket access: signed URLs only, generated server-side
  · Rate limiting on all API routes:
      → /api/payments/create-order: 5 req/min per IP
      → /api/registrations: 3 req/min per user
      → /api/emails/send: internal use only (no public access)
  · HTTPS only (Vercel enforces this by default)
  · Input sanitization: all user inputs sanitized before DB insert
  · Server-side Zod validation: every API route re-validates input
  · CSRF protection: Next.js API routes with SameSite cookies
  · ID proof uploads: stored in PRIVATE bucket, never publicly accessible
  · Admin panel: no direct Supabase client queries — all via API routes
    with service role (so RLS + admin check both apply)

  AVOID:
  ───────
  · Never trust frontend payment success confirmation
  · Never expose SUPABASE_SERVICE_ROLE_KEY to browser (no NEXT_PUBLIC_)
  · Never log full Cashfree payload to console in production
  · Never store credit card or UPI PIN (Cashfree handles this)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  19. PERFORMANCE GOALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────────────────────────────────┬──────────────────────┐
  │ Metric                               │ Target               │
  ├──────────────────────────────────────┼──────────────────────┤
  │ Lighthouse Performance Score         │ 90+                  │
  │ Largest Contentful Paint (LCP)       │ < 2.5 seconds        │
  │ First Input Delay (FID)              │ < 100ms              │
  │ Cumulative Layout Shift (CLS)        │ < 0.1                │
  │ Total Page Load Time                 │ < 3 seconds          │
  │ Animation Frame Rate                 │ 60 FPS               │
  │ Mobile Optimization Score            │ Excellent            │
  │ Video Background Size                │ < 5MB (compressed)   │
  │ Event images (cards)                 │ WebP, < 150KB each   │
  └──────────────────────────────────────┴──────────────────────┘

  Optimization Strategies:
  ─────────────────────────
  · All images: Next.js Image component (auto WebP + lazy loading)
  · Videos: lazy load, poster image shown before video loads
  · Fonts: next/font/local for Bebas Neue + Inter (zero layout shift)
  · Code splitting: automatic with Next.js App Router
  · Server Components: fetch event data server-side (no client waterfall)
  · Supabase queries: use .select() to fetch only needed columns
  · Client-side JS: minimize heavy libraries in Client Components
  · Animations: use transform + opacity only (GPU-accelerated)
  · prefers-reduced-motion: disable GSAP/Framer animations if set


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  20. DEVELOPMENT PHASES & ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌───────────┬────────────────────────────────────────────────────────────┐
  │ Phase     │ Tasks                                                      │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 1   │ Branding & Design                                          │
  │ Design    │ · Finalize logo, brand colors, typography                  │
  │           │ · Design wireframes for all pages (Figma)                  │
  │           │ · Create full design system (components, tokens)           │
  │           │ · Get client/stakeholder approval before coding            │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 2   │ Project Setup & Infrastructure                             │
  │ Setup     │ · Create Next.js project with TypeScript + Tailwind        │
  │           │ · Create Supabase project, configure Auth providers        │
  │           │ · Set up .env.local with all keys                          │
  │           │ · Create Supabase tables (SQL migrations)                  │
  │           │ · Set up RLS policies on all tables                        │
  │           │ · Create Supabase Storage buckets                          │
  │           │ · Connect GitHub → Vercel (preview deploys)                │
  │           │ · Install all npm packages (GSAP, Framer, Lenis, etc.)     │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 3   │ Frontend Pages & Animations                                │
  │ Frontend  │ · Build Navbar + Footer components                         │
  │           │ · Home page: all 6 sections with animations                │
  │           │ · Events listing page with filters                         │
  │           │ · Event details page ([slug]) with all sections            │
  │           │ · Auth pages: login, verify, callback                      │
  │           │ · Profile page                                             │
  │           │ · Static pages: about, contact, legal                      │
  │           │ · Full mobile responsive pass                              │
  │           │ · Animation QA (60fps target, test on real devices)        │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 4   │ Registration & Payment                                     │
  │ Payments  │ · Multi-step registration form                             │
  │           │ · ID proof upload to Supabase Storage                      │
  │           │ · Order summary screen                                     │
  │           │ · Cashfree order creation API route                        │
  │           │ · Cashfree JS SDK integration (frontend)                   │
  │           │ · Webhook handler with signature verification              │
  │           │ · Payment status update in Supabase                        │
  │           │ · Registration success page                                │
  │           │ · End-to-end payment flow testing (TEST mode)              │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 5   │ Email & Ticket System                                      │
  │ Emails    │ · React Email templates for all 6 email types              │
  │           │ · Resend integration + email send function                 │
  │           │ · PDF ticket generation with QR code                       │
  │           │ · Upload ticket to Supabase tickets bucket                 │
  │           │ · Email log entries in email_logs table                    │
  │           │ · Vercel Cron for event reminders + daily summary          │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 6   │ Admin Dashboard                                            │
  │ Admin     │ · Admin login + middleware role check                      │
  │           │ · Dashboard stats cards + Recharts charts                  │
  │           │ · Event management CRUD + banner upload                    │
  │           │ · Registration management table + filters                  │
  │           │ · CSV/Excel export                                         │
  │           │ · Payment management view                                  │
  │           │ · User management                                          │
  │           │ · Sponsors management                                      │
  │           │ · Email manager + bulk send                                │
  ├───────────┼────────────────────────────────────────────────────────────┤
  │ Phase 7   │ Testing, Security & Deployment                             │
  │ Launch    │ · End-to-end testing (registration → payment → email)      │
  │           │ · Security audit: RLS, webhook verification, rate limits   │
  │           │ · Performance audit (Lighthouse 90+ target)                │
  │           │ · SEO audit: meta tags, OG images, sitemap, schema         │
  │           │ · Cross-browser + mobile device testing                    │
  │           │ · Switch Cashfree from TEST to PROD                        │
  │           │ · Set all production env vars in Vercel                    │
  │           │ · Custom domain setup on Vercel                            │
  │           │ · Launch 🚀                                                │
  └───────────┴────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  21. FUTURE ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Post-Launch (V2 Features):
  ──────────────────────────
  · QR Code Check-in System
      → Unique QR on ticket
      → Admin scan app to verify entry at event gate
      → Realtime check-in count via Supabase Realtime

  · Live Leaderboard
      → Realtime race rankings using Supabase Realtime
      → Display on event page and big screen at venue

  · Referral & Rewards System
      → Unique referral code per user
      → Earn discount or cashback when friends register

  · Gamification
      → Achievement badges (First Race, 5K Club, etc.)
      → Fitness points / XP system
      → Public profile with stats

  · AI Personalization
      → Recommend events based on user location, past races, fitness level
      → Personalized training tips before each race

  · Multi-language Support
      → Hindi + Marathi support for broader reach

  · Mobile App (V3)
      → React Native (Expo) — can reuse all API routes and Supabase client
      → Same auth, same DB, same payment flow
      → App-specific: push notifications for reminders, live tracking

  · PWA (Progressive Web App)
      → Add to home screen support
      → Offline ticket viewing
      → Push notification support (Web Push API)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  22. IMPORTANT DEVELOPER NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠  NEVER trust frontend payment success.
     Always wait for Cashfree webhook with verified signature.
     The success page should poll DB status until webhook confirms.

  ⚠  NEVER put SUPABASE_SERVICE_ROLE_KEY in any NEXT_PUBLIC_ variable.
     This key bypasses RLS. Server-side API routes only.

  ⚠  NEVER call Cashfree API from the browser (client-side).
     Order creation and webhook verification = server-side only.

  ⚠  ALL animation components need "use client" directive.
     GSAP and Framer Motion cannot run in Server Components.

  ⚠  Compress ALL videos before uploading to Supabase Storage.
     Target: < 5MB, H.264, 1920x1080, 30fps.
     Uncompressed video = laggy animations and 10+ second load times.

  ⚠  Supabase free tier has 500MB DB and 1GB Storage.
     Plan for storage: use WebP images, compressed videos.
     Upgrade to Supabase Pro if growing past free limits.

  ⚠  Test Cashfree webhook locally using ngrok or Cashfree's test mode.
     Set your ngrok URL as webhook endpoint in Cashfree dashboard during dev.

  ✓  Use Supabase's auto-generated TypeScript types:
     Run: npx supabase gen types typescript --project-id your_id > src/types/database.ts
     Regenerate every time you change the schema.

  ✓  Use Vercel Cron Jobs for scheduled emails (event reminders, daily summary).
     Define in vercel.json under "crons" section.

  ✓  Use Supabase Realtime for live "spots left" counter on event detail page.
     Subscribe to changes on registrations table filtered by event_id.

  ✓  For admin's first time setup:
     Manually set role = 'admin' in Supabase dashboard for the first admin user.
     After that, the admin can promote others from the admin panel.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DOCUMENT END
  Fitness Event & Challenge Platform PRD  |  Version 2.0  |  May 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━