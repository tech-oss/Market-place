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
  orderId?: string;
  /** True when Supabase isn't connected / user not signed in — UI shows demo confirmation. */
  fellBack?: boolean;
}

const EFT_DEADLINE_DAYS = 3;

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
  paymentMethod: "online" | "eft";
}): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: true, fellBack: true };

  const { data: profile } = await supabase
    .from("profiles").select("full_name,email").eq("id", user.id).single();

  const subtotal = input.lines.reduce((s, l) => s + l.priceCents * l.qty, 0);
  const reference = `MP-${Math.floor(10000 + Math.random() * 89999)}`;

  // Reserve stock first, atomically per line, so two buyers can't both
  // check out the last unit. If any line fails (out of stock / raced),
  // put back what we already reserved and abort before an order exists.
  const realLines = input.lines.filter((l) => UUID.test(l.productId));
  const decremented: OrderLineInput[] = [];
  for (const line of realLines) {
    const { data: rows, error: decError } = await supabase
      .rpc("decrement_product_stock", { p_id: line.productId, p_qty: line.qty });
    if (decError || !rows || rows.length === 0) {
      for (const done of decremented) {
        await supabase.rpc("increment_product_stock", { p_id: done.productId, p_qty: done.qty });
      }
      return { ok: false, error: `${line.title} doesn't have enough stock left. Please update your cart.` };
    }
    decremented.push(line);
  }
  const rollbackStock = async () => {
    for (const done of decremented) {
      await supabase.rpc("increment_product_stock", { p_id: done.productId, p_qty: done.qty });
    }
  };

  const isEft = input.paymentMethod === "eft";
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      reference,
      buyer_id: user.id,
      buyer_name: profile?.full_name || profile?.email || "Buyer",
      status: isEft ? "pending-payment" : "paid-held",
      subtotal_cents: subtotal,
      shipping_cents: input.shippingCents,
      total_cents: subtotal + input.shippingCents,
      shipping_name: input.shippingAddress.name,
      shipping_phone: input.shippingAddress.phone,
      shipping_address: input.shippingAddress.address,
      shipping_city: input.shippingAddress.city,
      shipping_postal_code: input.shippingAddress.postalCode,
      payment_method: input.paymentMethod,
      payment_status: isEft ? "pending" : "confirmed",
      payment_deadline: isEft
        ? new Date(Date.now() + EFT_DEADLINE_DAYS * 86_400_000).toISOString()
        : null,
    })
    .select("id")
    .single();

  if (error || !order) {
    console.error("placeOrder: order insert failed", error);
    await rollbackStock();
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
    await rollbackStock();
    return { ok: false, error: "Could not place your order. Please try again." };
  }

  return { ok: true, reference, orderId: order.id };
}

/**
 * Buyer: attach uploaded proof of an EFT transfer to their order. Moves
 * payment_status to "submitted" — an admin then reviews and confirms it
 * (see confirmEftPayment in dashboard/actions.ts). Resubmitting (e.g. the
 * buyer uploaded the wrong file) is allowed as long as an admin hasn't
 * confirmed payment yet.
 */
export async function submitPaymentProof(orderId: string, proofUrl: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { ok: true, fellBack: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: order } = await supabase
    .from("orders")
    .select("id,buyer_id,payment_method,payment_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) return { ok: false, error: "Order not found." };
  if (order.payment_method !== "eft") return { ok: false, error: "This order isn't an EFT order." };
  if (order.payment_status === "confirmed") return { ok: false, error: "Payment for this order is already confirmed." };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "submitted",
      payment_proof_url: proofUrl,
      payment_proof_uploaded_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
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
export async function requestReturn(orderId: string, reason: string, photoUrl?: string): Promise<ActionResult> {
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
      return_photo_url: photoUrl || null,
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
