-- Delivery is arranged by each seller, not picked by the buyer from a fixed
-- courier list. Sellers now provide free-text shipment details (courier
-- name, tracking number, service level, note) when they mark an order
-- shipped — add columns to capture the service level and an optional note
-- (courier + tracking already existed as free text columns).
alter table orders add column if not exists shipping_service text;
alter table orders add column if not exists shipping_note text;
