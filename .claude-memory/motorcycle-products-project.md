---
name: motorcycle-products-project
description: "Location, repo, and stack of the Motorcycle Products marketplace project"
metadata: 
  node_type: memory
  type: project
  originSessionId: a3261bcc-0d32-4d81-a465-7da5e773d2c5
---

The **Motorcycle Products** marketplace (multivendor motorcycle spare-parts, escrow model, domain motorcycleproducts.co.za) lives at `C:\Users\ns\motorcycle-products` — a SIBLING of `C:\Users\ns\Town-center`, NOT inside it. The two must never be merged; Town-center is an unrelated Vite mobile-demo repo.

- Git remote `origin` = https://github.com/tech-oss/Market-place.git (GitHub account: tech-oss, email techmasterhome@gmail.com). Branch `main`.
- Stack: Next 16 (App Router) / React 19 / TypeScript / Tailwind v4 / Shadcn UI / Framer Motion / lucide-react. Dev server: `npm run dev` (falls back to port 3001 if 3000 busy).
- Design: light base + RED brand accent + near-black "ink" blocks (from the client's mock, which overrode an earlier "ink accent" theme pick). Tokens in `src/app/globals.css` (--brand, --ink).
- Architecture: feature-based — `src/features/`, `src/components/{layout,shared,ui}`, `src/types`, `src/mocks`, `src/lib`.
- Deployed on Vercel at https://market-place-flax.vercel.app (auto-deploys on push to main). Local hero/workshop images in public/img (from Unsplash, free license).
- Build plan (client's 4 steps): 1) customer frontend, 2) admin+seller dashboards, 3) Supabase backend integration, 4) QA+live.
- STEP 1 COMPLETE (mock data): home + all customer pages, in-session cart. Real hero photo + SVG part illustrations, premium animations, mobile-responsive.
- STEP 2 COMPLETE (mock data): routes split into (site) marketing shell vs standalone /seller + /admin dashboard shells (DashboardShell, role-based sidebar in src/features/dashboard). Seller Center: overview, listings + add-listing form + printable labels (real Code128 barcode via jsbarcode + QR via qrcode, print-isolated by @media print on #printable-label), orders (mark shipped), wallet, profile/KYC. Admin: overview, seller approvals (approve/reject w/ ID+proof checks), orders & escrow (release/refund), listings, users, editable 7% commission. Account page links to both dashboards.
- STEP 3 IN PROGRESS (slice 1 done): Supabase backend. Full SQL schema + RLS + triggers in supabase/migrations/0001_init.sql, storage buckets in 0002_storage.sql, seed.sql. Supabase clients in src/lib/supabase (env-gated via isSupabaseConfigured — app falls back to MOCK DATA when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY absent, so deploy stays green). Auth: email+password (src/features/auth/actions.ts), /login + /register, auth-aware header, middleware.ts protects /seller+/admin with admin role gate. Data layer src/lib/data/products.ts (Supabase-or-mock) wired into home/catalog/product. Setup steps in SUPABASE_SETUP.md.
- BLOCKED ON USER: to activate backend, user must create a Supabase project, run the 3 SQL files, and add NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (+ SUPABASE_SERVICE_ROLE_KEY) to .env.local and Vercel env vars. Then make self admin via SQL. I cannot provision Supabase or handle their secret keys.
- Supabase LIVE: project https://krchvzawhoayyvyydtpx.supabase.co, all 3 SQL files run + search_path trigger fix applied. Local .env.local has URL + publishable key (sb_publishable_..., the new anon key). Signup verified working (creates profile via trigger). Confirm-email is ON. User still needs to add the 2 NEXT_PUBLIC env vars to VERCEL for the live site to use DB.
- STEP 3 slice 2 DONE: dashboard data layer (src/lib/data/dashboard.ts, Supabase-or-mock) + server actions (src/features/dashboard/actions.ts, src/features/cart/actions.ts). Wired: seller listings create→DB, seller orders ship, seller wallet/overview reads, admin approvals/escrow/commission/listings, checkout placeOrder. getCurrentSeller auto-provisions a seller row (status pending) for seller-role users. All actions fall back gracefully; RBAC middleware redirects dashboards to /login when connected. Verified: public reads DB (8 products), dashboards 307→/login unauthenticated, build+typecheck green. Authed write paths NOT yet e2e-tested (email-confirm blocks scripted sessions) — user to test logged in.
- REMAINING Step 3: KYC document uploads to storage bucket; wire seller registration to create seller row with business fields; wallet transactions on escrow release (currently just status change); real payment gateway (PayFast/Ozow). Then Step 4 QA.
