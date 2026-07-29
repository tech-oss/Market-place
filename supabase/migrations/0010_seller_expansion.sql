-- Seller expansion: proof of banking doc, seller type, admin doc-override tracking.
-- Safe to re-run.

do $$ begin
  create type seller_type as enum ('individual', 'parts_dealer', 'accessories_dealer');
exception when duplicate_object then null; end $$;

alter table sellers add column if not exists seller_type seller_type not null default 'individual';
alter table sellers add column if not exists proof_of_banking_url text;

-- Tracks how a seller was approved: 'docs_verified' (all KYC docs reviewed) or
-- 'admin_override' (admin bypassed doc review for a trusted seller). Null until
-- first approved.
alter table sellers add column if not exists approval_type text
  check (approval_type is null or approval_type in ('docs_verified', 'admin_override'));

-- Admins need to demote a deleted seller's profile back to 'buyer'. The base
-- schema only allowed self-updates on profiles, so add an admin update policy.
drop policy if exists "profiles admin update" on profiles;
create policy "profiles admin update" on profiles for update
  using (is_admin()) with check (is_admin());

-- Storage: allow proof-of-banking uploads under the kyc-documents bucket. The
-- existing owner/admin path policies from 0002 already cover any object keyed
-- under "<user_id>/..." so the new banking-<ts> filenames are handled — no new
-- storage policy required.
