-- Fixes "infinite recursion detected in policy for relation 'orders'" hit
-- during checkout. "orders buyer read" subqueries order_items+sellers, and
-- "order_items read" subqueries orders — Postgres can't evaluate that mutual
-- cross-table reference safely. Same fix pattern as is_admin()/
-- is_convo_participant(): move the cross-table checks into security-definer
-- functions so they bypass RLS internally instead of re-triggering it.
--
-- Also adds the missing order_items INSERT policy — sellers/buyers had no
-- way to insert order_items at all, so placeOrder's order_items insert was
-- silently denied even once the orders insert succeeded.

create or replace function is_order_buyer(p_order_id uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from orders where id = p_order_id and buyer_id = auth.uid());
$$;

create or replace function is_order_seller(p_order_id uuid)
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from order_items oi join sellers s on s.id = oi.seller_id
    where oi.order_id = p_order_id and s.profile_id = auth.uid()
  );
$$;

drop policy if exists "orders buyer read" on orders;
create policy "orders buyer read" on orders for select using (
  buyer_id = auth.uid()
  or is_admin()
  or is_order_seller(id)
);

drop policy if exists "order_items read" on order_items;
create policy "order_items read" on order_items for select using (
  is_admin()
  or is_order_buyer(order_id)
  or exists (select 1 from sellers s where s.id = order_items.seller_id and s.profile_id = auth.uid())
);

drop policy if exists "order_items buyer insert" on order_items;
create policy "order_items buyer insert" on order_items for insert with check (
  is_order_buyer(order_id) or is_admin()
);
