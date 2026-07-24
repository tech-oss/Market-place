-- Allow admins to write wallet transactions (credit sellers on escrow release).
-- Sellers still only read their own (from 0001). Safe to re-run.

drop policy if exists "wallet admin write" on wallet_transactions;
create policy "wallet admin write" on wallet_transactions
  for all using (is_admin()) with check (is_admin());
