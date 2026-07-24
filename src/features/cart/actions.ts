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
export async function placeOrder(input: {
  lines: OrderLineInput[];
  shippingCents: number;
  courier: string;
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
    })
    .select("id")
    .single();

  if (error || !order) return { ok: false, error: error?.message ?? "Could not create order." };

  const items = input.lines.map((l) => ({
    order_id: order.id,
    product_id: UUID.test(l.productId) ? l.productId : null,
    seller_id: UUID.test(l.sellerId) ? l.sellerId : null,
    title: l.title,
    qty: l.qty,
    price_cents: l.priceCents,
  }));
  await supabase.from("order_items").insert(items);

  return { ok: true, reference };
}
