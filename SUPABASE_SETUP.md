# Supabase Setup — Motorcycle Products (Step 3)

The app runs on mock data until you connect Supabase. Follow these steps to
turn on the real backend. Nothing here exposes secrets in the browser except
the anon key (which is designed to be public).

## 1. Create the project
1. Go to <https://supabase.com/dashboard> and create a new project.
2. Choose a region close to South Africa (e.g. `eu-west` / `af-south` if available).
3. Wait for it to finish provisioning.

## 2. Run the schema
In the Supabase dashboard → **SQL Editor**, run these files in order (copy-paste
their contents and click **Run**):

1. `supabase/migrations/0001_init.sql` — tables, enums, RLS policies, triggers
2. `supabase/migrations/0002_storage.sql` — `product-images` + `kyc-documents` buckets
3. `supabase/seed.sql` — brands, categories, demo sellers & products

## 3. Get your keys
Dashboard → **Project Settings → API**. Copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

## 4. Local development
Create `.env.local` (see `.env.example`) with those three values, then:
```bash
npm run dev
```
The app now reads products from the database. Sign-up / sign-in work.

## 5. Deploy on Vercel
Vercel → your project → **Settings → Environment Variables**. Add the same three
variables (for Production + Preview). Redeploy (or push a commit). Done.

## 6. Create an admin
By default every sign-up is a `buyer` (or `seller`). To make yourself admin, run
in the SQL editor after signing up:
```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## Notes
- Auth uses email + password. Enable "Confirm email" in **Authentication → Providers**
  if you want email verification (off = instant sign-in for testing).
- Row Level Security is enabled on every table; policies enforce buyer/seller/admin access.
- Escrow release and live payment gateways (PayFast/Ozow) are modelled in the schema
  and are the next slice to wire up.
