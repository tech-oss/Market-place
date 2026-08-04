"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/dashboard/actions";

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

/**
 * Buyer: confirm receipt of a shipped order.
 *
 * This does NOT pay the seller. Funds stay with the platform and the order
 * moves to "confirmed", where it waits for an admin to release it manually
 * (see settleOrder). The gap is deliberate: it keeps the money recoverable
 * while the buyer's return window is still open.
 */
export async function confirmDelivery(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: order } = await supabase
    .from("orders").select("id,status,buyer_id").eq("id", orderId).maybeSingle();
  if (!order || order.buyer_id !== user.id) return { ok: false, error: "Order not found." };
  if (order.status !== "shipped") return { ok: false, error: "This order isn't marked as shipped yet." };

  const { error } = await supabase
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/seller/orders");
  return { ok: true };
}

/**
 * Buyer: start a return. Only valid on an order the buyer has already
 * confirmed, and only inside the platform's return window (default 5 days
 * from confirmation). The buyer then ships the item back to the platform's
 * return address; an admin completes it with processReturn.
 */
export async function requestReturn(orderId: string, reason: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: order } = await supabase
    .from("orders").select("id,status,buyer_id,confirmed_at").eq("id", orderId).maybeSingle();
  if (!order || order.buyer_id !== user.id) return { ok: false, error: "Order not found." };
  if (order.status !== "confirmed") {
    return { ok: false, error: "Only orders you've marked as received can be returned." };
  }

  const { data: settings } = await supabase
    .from("platform_settings").select("return_window_days").eq("id", 1).maybeSingle();
  const windowDays = settings?.return_window_days ?? 5;

  if (order.confirmed_at) {
    const elapsedDays = (Date.now() - new Date(order.confirmed_at).getTime()) / 86_400_000;
    if (elapsedDays > windowDays) {
      return { ok: false, error: `The ${windowDays}-day return window for this order has closed.` };
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "return-requested",
      return_requested_at: new Date().toISOString(),
      return_reason: reason.trim() || null,
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/seller/orders");
  return { ok: true };
}
