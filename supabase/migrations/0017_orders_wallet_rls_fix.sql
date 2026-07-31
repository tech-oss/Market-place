-- Sellers could never actually mark an order shipped, and buyers could
-- never confirm delivery: the only UPDATE policy on `orders` was
-- "orders admin update" (admin-only), and the only write policy on
-- `wallet_transactions` was "wallet admin write" (also admin-only). So
-- markOrderShipped (seller) and confirmDelivery (buyer) both ran their
-- .update()/.insert() calls without error, but RLS silently blocked every
-- row -- zero rows changed, no exception thrown. That's why the buyer
-- dashboard kept showing the order as unshipped with no "Mark as received"
-- button: the seller's "Ship" action never actually reached the database.
--
-- Adds a permissive UPDATE policy so a seller can update an order they have
-- an item in (to ship it) and a buyer can update their own order (to
-- confirm delivery) -- Postgres OR's this with the existing admin-only
-- policy, it doesn't replace it. Also adds an INSERT policy on
-- wallet_transactions so a buyer confirming delivery can credit the
-- relevant seller's wallet (mirrors the math the admin release path uses).

drop policy if exists "orders seller ship / buyer confirm" on orders;
create policy "orders seller ship / buyer confirm" on orders for update using (
  is_admin() or is_order_seller(id) or buyer_id = auth.uid()
) with check (
  is_admin() or is_order_seller(id) or buyer_id = auth.uid()
);

drop policy if exists "wallet_transactions settlement insert" on wallet_transactions;
create policy "wallet_transactions settlement insert" on wallet_transactions for insert with check (
  is_admin()
  or exists (
    select 1 from order_items oi join orders o on o.id = oi.order_id
    where oi.seller_id = wallet_transactions.seller_id and o.buyer_id = auth.uid()
  )
);
