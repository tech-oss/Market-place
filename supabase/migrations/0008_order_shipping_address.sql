-- Shipping address fields were captured on the checkout form but never
-- persisted or read anywhere.
alter table orders add column if not exists shipping_name text;
alter table orders add column if not exists shipping_phone text;
alter table orders add column if not exists shipping_address text;
alter table orders add column if not exists shipping_city text;
alter table orders add column if not exists shipping_postal_code text;
