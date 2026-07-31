"use server";

import { createClient } from "@/lib/supabase/server";

export interface OrderLineInput {
  productId: string;
  sellerId: string;
  title: string;
  priceCents: number;
  qty: number;
}

export interface PlaceOrderResult {
  ok: boolean;
  error?: string;
  reference?: string;
  /** True when Supabase isn't connected / user not signed in — UI shows demo confirmation. */
  fellBack?: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Create an escrow-held order for the signed-in buyer. Line ids that aren't
 * real DB uuids (demo cart seed) are stored as snapshots with null refs so the
 * insert never violates a foreign key.
 */
export interface ShippingAddressInput {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export async function placeOrder(input: {
  lines: OrderLineInput[];
  shippingCents: number;
  shippingAddress: ShippingAddressInput;
}): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: true, fellBack: true };

  const { data: profile } = await supabase
    .from("profiles").select("full_name,email").eq("id", user.id).single();

  const subtotal = input.lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const reference = `MP-${Math.floor(10000 + Math.random() * 89999)}`;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      reference,
      buyer_id: user.id,
      buyer_name: profile?.full_name || profile?.email || "Buyer",
      status: "paid-held",
      subtotal_cents: subtotal,
      shipping_cents: input.shippingCents,
      total_cents: subtotal + input.shippingCents,
      shipping_name: input.shippingAddress.name,
      shipping_phone: input.shippingAddress.phone,
      shipping_address: input.shippingAddress.address,
      shipping_city: input.shippingAddress.city,
      shipping_postal_code: input.shippingAddress.postalCode,
    })
    .select("id")
    .single();

  if (error || !order) {
    console.error("placeOrder: order insert failed", error);
    return { ok: false, error: "Could not place your order. Please try again." };
  }

  const items = input.lines.map((l) => ({
    order_id: order.id,
    product_id: UUID.test(l.productId) ? l.productId : null,
    seller_id: UUID.test(l.sellerId) ? l.sellerId : null,
    title: l.title,
    qty: l.qty,
    price_cents: l.priceCents,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(items);
  if (itemsError) {
    console.error("placeOrder: order_items insert failed", itemsError);
    return { ok: false, error: "Could not place your order. Please try again." };
  }

  return { ok: true, reference };
}
