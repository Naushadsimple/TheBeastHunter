# The Beast Hunter — Easy Setup Guide

Follow these steps in order. Your Supabase project **TheBeastHunter** is already connected and healthy.

---

## Step 1 — Fill `.env.local` (in project root)

Copy `.env.example` to `.env.local` if needed, then paste your real values.

### Supabase (Dashboard → Project Settings → API)

| Variable | Where to copy |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL → `https://riyaseiklavfzxjldzrg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (**secret — never commit**) |

### Cashfree (Dashboard → Developers → Credentials)

Use **TEST** keys first, then **PRODUCTION** when you go live.

| Variable | Where to copy |
|----------|----------------|
| `CASHFREE_APP_ID` | App ID (Client ID) |
| `CASHFREE_SECRET_KEY` | Secret Key |
| `CASHFREE_WEBHOOK_SECRET` | Developers → Webhooks → secret |
| `CASHFREE_ENV` | `TEST` for sandbox, `PROD` for live |
| `NEXT_PUBLIC_CASHFREE_ENV` | `TEST` or `production` (must match) |

### Site URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

On Vercel production, set this to `https://yourdomain.com`.

### Admin whitelist

```env
ADMIN_EMAIL_WHITELIST=shaikhnaushuu78636@gmail.com
```

Add every email that is allowed to open `/thebeasthunteradmin` (comma-separated, no spaces).

---

## Step 2 — Cashfree webhook (required for real payments)

1. Log in to [Cashfree Merchant Dashboard](https://merchant.cashfree.com/).
2. Go to **Developers** → **Webhooks**.
3. Add webhook URL:
   - Local (testing): use [ngrok](https://ngrok.com/) → `https://YOUR-NGROK.ngrok.io/api/webhook/cashfree`
   - Production: `https://yourdomain.com/api/webhook/cashfree`
4. Copy the **webhook secret** into `CASHFREE_WEBHOOK_SECRET` in `.env.local`.
5. Enable payment success / failure events (PG order webhooks).

**Test payment flow**

1. `npm run dev`
2. Register for an event → Confirm slot → Cashfree sandbox checkout
3. After payment, registration should show as **confirmed** in Supabase `registrations` table

---

## Step 3 — Admin login (email + password)

Google sign-in is **not** used for admin anymore.

### A. Enable Email auth in Supabase

1. [Supabase Dashboard](https://supabase.com/dashboard) → project **TheBeastHunter**
2. **Authentication** → **Providers** → **Email**
3. Turn **Email** ON
4. For quick setup you can disable “Confirm email” under Email settings (optional for dev)

### B. Create your admin user

1. **Authentication** → **Users** → **Add user**
2. Email: `shaikhnaushuu78636@gmail.com` (must match `ADMIN_EMAIL_WHITELIST`)
3. Password: choose a strong password
4. Check **Auto Confirm User**

### C. Set admin role in database

**Authentication** → **Users** → copy the user **UUID**, then run in **SQL Editor**:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'shaikhnaushuu78636@gmail.com';
```

(Your account may already be `admin` — verified in project.)

### D. Sign in

1. Open `http://localhost:3000/thebeasthunteradmin`
2. Enter admin email + password
3. You should see the dashboard

---

## Step 4 — Run the site

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5 — Deploy to Vercel (production)

1. Push code to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add **all** variables from `.env.local` in Vercel → Settings → Environment Variables
4. Set `NEXT_PUBLIC_APP_URL` to your live domain
5. Set Cashfree to **PROD** keys and update webhook URL to production
6. Redeploy

---

## Quick checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is real (not `placeholder_...`)
- [ ] Cashfree TEST keys in `.env.local`
- [ ] `ADMIN_EMAIL_WHITELIST` includes your admin email
- [ ] Admin user exists in Supabase Auth with password
- [ ] `public.users.role = 'admin'` for that email
- [ ] Cashfree webhook URL configured
- [ ] `npm run dev` → test registration + payment

---

## Your Supabase project status (checked)

| Item | Status |
|------|--------|
| Project name | TheBeastHunter |
| Region | ap-south-1 (Mumbai) |
| Tables | users, events, registrations, payments, sponsors, testimonials, email_logs |
| Admin user | `shaikhnaushuu78636@gmail.com` → role **admin** |

---

## Need help?

- Payment stuck on pending → webhook not reaching your server (check ngrok / Vercel URL)
- Admin “Access denied” → email not in whitelist OR `role` not `admin`
- Checkout error “SERVICE_ROLE_KEY” → add real service role key to `.env.local`
