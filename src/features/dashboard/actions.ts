"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSeller } from "@/lib/data/dashboard";

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** True when Supabase isn't connected — the UI keeps its optimistic state. */
  fellBack?: boolean;
}

const NOT_CONNECTED = { ok: true, fellBack: true } as const;

/** Seller: create a new product listing (status → pending review). */
export async function createListing(input: {
  title: string;
  categorySlug: string;
  condition: string;
  priceCents: number;
  stock: number;
  oem?: string;
  bin?: string;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found for this user." };

  const slug =
    input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Math.random().toString(36).slice(2, 6);
  const sku = `MP-${input.categorySlug.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      seller_id: seller.id,
      slug,
      sku,
      title: input.title,
      price_cents: input.priceCents,
      condition: input.condition,
      category_slug: input.categorySlug,
      brand_name: input.brand || "—",
      oem_numbers: input.oem ? [input.oem] : [],
      inventory_bin: input.bin || null,
      stock: input.stock,
      status: "pending-review",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  if (input.brand && input.model && input.yearFrom && input.yearTo) {
    await supabase.from("fitments").insert({
      product_id: product.id, brand: input.brand, model: input.model,
      year_from: input.yearFrom, year_to: input.yearTo,
    });
  }

  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  return { ok: true };
}

/** Admin: approve or reject a seller. */
export async function setSellerStatus(
  sellerId: string,
  status: "active" | "rejected",
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("sellers")
    .update({ status, verified: status === "active" })
    .eq("id", sellerId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sellers");
  return { ok: true };
}

/** Admin: update the flat platform commission. */
export async function updateCommission(pct: number): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("commission_settings")
    .update({ pct, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Seller: mark an order shipped with courier + tracking. */
export async function markOrderShipped(
  orderId: string,
  courier: string,
  tracking: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("orders")
    .update({ status: "shipped", courier, tracking })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/orders");
  return { ok: true };
}

/** Seller: update business profile details. */
export async function updateSellerProfile(input: {
  name: string;
  businessType: string;
  location: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found." };
  const { error } = await supabase
    .from("sellers")
    .update({ name: input.name, business_type: input.businessType, location: input.location })
    .eq("id", seller.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/profile");
  return { ok: true };
}

/** Seller: record an uploaded KYC document path on the seller row. */
export async function setKycDocPath(
  kind: "id" | "proof",
  path: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found." };
  const column = kind === "id" ? "id_doc_url" : "proof_of_residence_url";
  const { error } = await supabase.from("sellers").update({ [column]: path }).eq("id", seller.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/profile");
  revalidatePath("/admin/sellers");
  return { ok: true };
}

/** Admin: get a short-lived signed URL to view a private KYC document. */
export async function getKycSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Not connected." };
  const { data, error } = await supabase.storage
    .from("kyc-documents")
    .createSignedUrl(path, 60);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

/**
 * Admin: release escrow (→ released, credits seller wallet minus commission)
 * or refund (→ refunded). Idempotent — already-settled orders are skipped.
 */
export async function settleOrder(
  orderId: string,
  outcome: "released" | "refunded",
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: order } = await supabase
    .from("orders").select("reference,status").eq("id", orderId).single();
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "released" || order.status === "refunded") return { ok: true };

  if (outcome === "released") {
    const { data: setting } = await supabase
      .from("commission_settings").select("pct").eq("id", 1).maybeSingle();
    const pct = setting?.pct != null ? Number(setting.pct) : 7;

    const { data: items } = await supabase
      .from("order_items").select("seller_id,title,price_cents,qty").eq("order_id", orderId);

    const txns: Array<Record<string, unknown>> = [];
    for (const it of items ?? []) {
      if (!it.seller_id) continue;
      const sale = it.price_cents * it.qty;
      const commission = Math.round(sale * (pct / 100));
      txns.push({ seller_id: it.seller_id, type: "sale", description: `Order ${order.reference} · ${it.title}`, amount_cents: sale, status: "completed" });
      txns.push({ seller_id: it.seller_id, type: "commission", description: `Platform commission (${pct}%)`, amount_cents: -commission, status: "completed" });
    }
    if (txns.length) {
      const { error: txErr } = await supabase.from("wallet_transactions").insert(txns);
      if (txErr) return { ok: false, error: txErr.message };
    }
  }

  const { error } = await supabase.from("orders").update({ status: outcome }).eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/seller/wallet");
  return { ok: true };
}
