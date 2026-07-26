-- Seller payout requests.
-- Sellers have no direct INSERT policy on wallet_transactions (only admins can
-- write, per 0003_wallet_policy.sql). This security-definer function lets a
-- seller request a payout of their own available balance without opening a
-- broader write policy a seller could otherwise abuse to credit themselves.

create or replace function request_payout()
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_seller_id uuid;
  v_balance   int;
begin
  select id into v_seller_id from sellers where profile_id = auth.uid();
  if v_seller_id is null then
    raise exception 'No seller account found for this user.';
  end if;

  select coalesce(sum(amount_cents), 0) into v_balance
  from wallet_transactions
  where seller_id = v_seller_id
    and (status = 'completed' or type = 'payout');

  if v_balance <= 0 then
    raise exception 'No available balance to pay out.';
  end if;

  insert into wallet_transactions (seller_id, type, description, amount_cents, status)
  values (v_seller_id, 'payout', 'Payout requested', -v_balance, 'pending');
end;
$$;

grant execute on function request_payout() to authenticated;
