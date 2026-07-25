-- Step 3: listing verification gating + seller-set shipping.
--
-- IMPORTANT: run the enum change (STEP A) on its own first, THEN the rest.
-- Postgres won't add an enum value inside the same transaction as its use.

-- ── STEP A — run this line by itself ────────────────────────────────────────
alter type listing_status add value if not exists 'awaiting-verification';

-- ── STEP B — run the rest ───────────────────────────────────────────────────
alter table products add column if not exists shipping_cents       int not null default 0;
alter table products add column if not exists shipping_local_cents int;
