"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSeller } from "@/lib/data/dashboard";
import { sanitizeForCode128 } from "@/lib/barcode";
import { sanitizeRichText } from "@/lib/rich-text";

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** True when Supabase isn't connected — the UI keeps its optimistic state. */
  fellBack?: boolean;
}

const NOT_CONNECTED = { ok: true, fellBack: true } as const;

export interface CreateListingInput {
  title: string;
  /** Rich-text HTML from the listing form; sanitised before it's stored. */
  description?: string;
  categorySlug: string;
  condition: string;
  priceCents: number;
  stock: number;
  sku?: string;
  oem?: string;
  bin?: string;
  /** Bike make — the only required part of fitment. */
  brand?: string;
  /** Optional: the admin catalog may not have this model yet. */
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  shippingCents?: number;
  shippingLocalCents?: number;
  imageUrls?: string[];
  /**
   * Set when the seller couldn't find their bike in the catalog and is
   * proposing a new make/model/year. Overrides brand/model/yearFrom/yearTo.
   * The listing is held in "pending-review" until an admin approves the
   * request (see approveYmmRequest / rejectYmmRequest).
   */
  newYmm?: {
    makeName: string;
    modelName: string;
    yearFrom: number;
    yearTo: number;
  };
}

/**
 * Seller: create a listing. If the seller isn't yet verified (approved by an
 * admin), the listing is held in "awaiting-verification" and auto-activates
 * when the admin approves the seller.
 */
export async function createListing(input: CreateListingInput): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found for this user." };

  // A pending YMM request holds the whole listing back regardless of the
  // seller's own verification status — it isn't live until an admin approves
  // both the seller's fitness to sell AND the new make/model/year proposal.
  const status = input.newYmm
    ? "pending-review"
    : seller.status === "active" ? "active" : "awaiting-verification";

  const brandName = input.newYmm?.makeName || input.brand || "—";

  const slug =
    input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + Math.random().toString(36).slice(2, 6);
  const sku =
    sanitizeForCode128(input.sku?.trim() ?? "") ||
    `MP-${input.categorySlug.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      seller_id: seller.id,
      slug,
      sku,
      title: input.title,
      description: sanitizeRichText(input.description) || null,
      price_cents: input.priceCents,
      condition: input.condition,
      category_slug: input.categorySlug,
      brand_name: brandName,
      oem_numbers: input.oem ? [input.oem] : [],
      inventory_bin: input.bin || null,
      stock: input.stock,
      shipping_cents: input.shippingCents ?? 0,
      shipping_local_cents: input.shippingLocalCents ?? null,
      status,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  if (input.newYmm) {
    await supabase.from("fitments").insert({
      product_id: product.id, brand: input.newYmm.makeName, model: input.newYmm.modelName,
      year_from: input.newYmm.yearFrom, year_to: input.newYmm.yearTo,
    });
    await supabase.from("ymm_requests").insert({
      seller_id: seller.id, product_id: product.id,
      make_name: input.newYmm.makeName, model_name: input.newYmm.modelName,
      year_from: input.newYmm.yearFrom, year_to: input.newYmm.yearTo,
    });
  } else if (input.brand) {
    // Model and years are optional — record whatever the seller could give us
    // so the listing still carries its make into search facets.
    await supabase.from("fitments").insert({
      product_id: product.id, brand: input.brand,
      model: input.model || null,
      year_from: input.yearFrom ?? null,
      year_to: input.yearTo ?? null,
    });
  }

  if (input.imageUrls?.length) {
    await supabase.from("product_images").insert(
      input.imageUrls.map((url, i) => ({ product_id: product.id, url, alt: input.title, position: i })),
    );
  }

  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  if (input.newYmm) revalidatePath("/admin/ymm-requests");
  return { ok: true };
}

export interface UpdateListingInput {
  id: string;
  title: string;
  description?: string;
  categorySlug: string;
  condition: string;
  priceCents: number;
  stock: number;
  sku?: string;
  shippingCents?: number;
  shippingLocalCents?: number;
  /** Full replacement list — whatever's here becomes the listing's photos. */
  imageUrls?: string[];
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  /**
   * Set when the seller couldn't find their bike in the catalog and is
   * proposing a new make/model/year for this existing listing. Overrides
   * brand/model/yearFrom/yearTo and pulls the listing back to pending-review
   * until an admin approves the request (see approveYmmRequest / rejectYmmRequest).
   */
  newYmm?: {
    makeName: string;
    modelName: string;
    yearFrom: number;
    yearTo: number;
  };
}

/** Seller: update an existing listing's details, price, stock, shipping, photos and fitment. */
export async function updateListing(input: UpdateListingInput): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found for this user." };

  const { data: existing } = await supabase
    .from("products").select("status").eq("id", input.id).eq("seller_id", seller.id).maybeSingle();

  const patch: Record<string, unknown> = {
    title: input.title,
    description: sanitizeRichText(input.description) || null,
    category_slug: input.categorySlug,
    condition: input.condition,
    price_cents: input.priceCents,
    stock: input.stock,
    sku: input.sku ? sanitizeForCode128(input.sku) : input.sku,
    shipping_cents: input.shippingCents ?? 0,
    shipping_local_cents: input.shippingLocalCents ?? null,
  };

  // Stock edits drive the out-of-stock status directly: restocking brings a
  // listing back live, and zeroing it out takes it down — same transition
  // the atomic decrement/increment RPCs apply when orders are placed.
  if (existing?.status === "out-of-stock" && input.stock > 0) {
    patch.status = "active";
  } else if (existing && existing.status !== "out-of-stock" && input.stock <= 0) {
    patch.status = "out-of-stock";
  }

  if (input.newYmm) {
    patch.brand_name = input.newYmm.makeName;
    patch.status = "pending-review";
  } else if (input.brand) {
    patch.brand_name = input.brand;
  }

  const { error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", input.id)
    .eq("seller_id", seller.id);
  if (error) return { ok: false, error: error.message };

  if (input.newYmm) {
    await supabase.from("fitments").delete().eq("product_id", input.id);
    await supabase.from("fitments").insert({
      product_id: input.id, brand: input.newYmm.makeName, model: input.newYmm.modelName,
      year_from: input.newYmm.yearFrom, year_to: input.newYmm.yearTo,
    });
    await supabase.from("ymm_requests").insert({
      seller_id: seller.id, product_id: input.id,
      make_name: input.newYmm.makeName, model_name: input.newYmm.modelName,
      year_from: input.newYmm.yearFrom, year_to: input.newYmm.yearTo,
    });
  } else if (input.brand) {
    await supabase.from("fitments").delete().eq("product_id", input.id);
    await supabase.from("fitments").insert({
      product_id: input.id, brand: input.brand,
      model: input.model || null,
      year_from: input.yearFrom ?? null,
      year_to: input.yearTo ?? null,
    });
  }

  if (input.imageUrls) {
    await supabase.from("product_images").delete().eq("product_id", input.id);
    if (input.imageUrls.length) {
      await supabase.from("product_images").insert(
        input.imageUrls.map((url, i) => ({ product_id: input.id, url, alt: input.title, position: i })),
      );
    }
  }

  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  if (input.newYmm) revalidatePath("/admin/ymm-requests");
  return { ok: true };
}

/** Admin: unpublish a listing (moderation "Remove"). Sets it back to draft
 *  rather than deleting, so the seller can see and fix it. */
export async function removeListing(productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("products").update({ status: "draft" }).eq("id", productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/listings");
  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  return { ok: true };
}

/**
 * Admin: approve (with or without doc review), reject, suspend or reactivate
 * a seller. `approvalType` is only meaningful when moving to "active":
 * "docs_verified" for a normal reviewed approval, "admin_override" when the
 * admin is bypassing document review for a trusted seller.
 */
export async function setSellerStatus(
  sellerId: string,
  status: "active" | "rejected" | "suspended",
  approvalType?: "docs_verified" | "admin_override",
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("sellers")
    .update({
      status,
      verified: status === "active",
      approval_type: status === "active" ? (approvalType ?? "docs_verified") : null,
    })
    .eq("id", sellerId);
  if (error) return { ok: false, error: error.message };

  // On approval, auto-activate the seller's held listings.
  if (status === "active") {
    await supabase
      .from("products")
      .update({ status: "active" })
      .eq("seller_id", sellerId)
      .in("status", ["awaiting-verification", "pending-review"]);
  }

  // On suspension, pull the seller's listings off the live marketplace.
  if (status === "suspended") {
    await supabase
      .from("products")
      .update({ status: "draft" })
      .eq("seller_id", sellerId)
      .eq("status", "active");
  }

  revalidatePath("/admin/sellers");
  revalidatePath("/admin/users");
  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  return { ok: true };
}

/**
 * Admin: permanently delete a seller and wipe all their data — listings,
 * images, fitments and wallet transactions cascade via FK; the linked
 * profile is reverted to a plain buyer account rather than deleted (the
 * underlying auth.users login is untouched — full account deletion needs a
 * service-role key that isn't configured in this project).
 */
export async function deleteSellerPermanently(sellerId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: seller } = await supabase
    .from("sellers").select("profile_id").eq("id", sellerId).maybeSingle();

  const { error } = await supabase.from("sellers").delete().eq("id", sellerId);
  if (error) return { ok: false, error: error.message };

  if (seller?.profile_id) {
    await supabase.from("profiles").update({ role: "buyer" }).eq("id", seller.profile_id);
  }

  revalidatePath("/admin/sellers");
  revalidatePath("/admin/users");
  revalidatePath("/parts");
  return { ok: true };
}

/** Admin: change a seller's declared seller type. */
export async function setSellerType(
  sellerId: string,
  sellerType: "individual" | "parts_dealer" | "accessories_dealer",
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("sellers").update({ seller_type: sellerType }).eq("id", sellerId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
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
  shippingService?: string,
  note?: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("orders")
    .update({
      status: "shipped", courier, tracking,
      shipping_service: shippingService || null,
      shipping_note: note || null,
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  return { ok: true };
}

/**
 * Seller: request a payout of the full available balance. Runs through a
 * security-definer RPC so the seller can't insert arbitrary wallet rows —
 * the function computes the balance server-side and inserts one pending
 * "payout" debit for that amount.
 */
export async function requestPayout(): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found." };

  const { error } = await supabase.rpc("request_payout");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/wallet");
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

const KYC_COLUMNS = {
  id: "id_doc_url",
  proof: "proof_of_residence_url",
  banking: "proof_of_banking_url",
} as const;

/** Seller: record an uploaded KYC document path on the seller row. */
export async function setKycDocPath(
  kind: "id" | "proof" | "banking",
  path: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const seller = await getCurrentSeller();
  if (!seller) return { ok: false, error: "No seller account found." };
  const column = KYC_COLUMNS[kind];
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

/** Admin: get a short-lived signed URL to view a buyer's uploaded EFT payment proof. */
export async function getPaymentProofSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Not connected." };
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(path, 60);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}

/**
 * Admin: confirm a buyer's EFT payment. Moves the order into the same
 * "paid-held" state an online payment starts in, so shipping / delivery /
 * release all flow through the existing order machinery unchanged — the
 * seller's Ship Now button (gated on status === "paid-held") activates
 * automatically.
 */
export async function confirmEftPayment(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: order } = await supabase
    .from("orders").select("id,payment_method,status").eq("id", orderId).maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };
  if (order.payment_method !== "eft") return { ok: false, error: "This order isn't an EFT order." };
  if (order.status !== "pending-payment") return { ok: true };

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid-held",
      payment_status: "confirmed",
      payment_confirmed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/seller/orders");
  return { ok: true };
}

/**
 * Admin: cancel an unpaid/unconfirmed EFT order and restore reserved stock —
 * used when the buyer's transfer never arrives or proof turns out invalid,
 * without waiting for the 3-day auto-expiry.
 */
export async function cancelEftOrder(orderId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: order } = await supabase
    .from("orders").select("id,payment_method,status").eq("id", orderId).maybeSingle();
  if (!order) return { ok: false, error: "Order not found." };
  if (order.payment_method !== "eft") return { ok: false, error: "This order isn't an EFT order." };
  if (order.status !== "pending-payment") return { ok: false, error: "This order is no longer awaiting payment." };

  const { data: items } = await supabase
    .from("order_items").select("product_id,qty").eq("order_id", orderId);
  for (const it of items ?? []) {
    if (it.product_id) await supabase.rpc("increment_product_stock", { p_id: it.product_id, p_qty: it.qty });
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      payment_status: "expired",
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason?.trim() || "Cancelled by admin",
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/seller/orders");
  return { ok: true };
}

/** Admin: enable/disable payment methods and set the EFT bank details shown to buyers. */
export async function updatePaymentSettings(input: {
  onlineEnabled: boolean;
  eftEnabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  branchCode: string;
  iban: string;
  eftInstructions: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("payment_settings")
    .update({
      online_enabled: input.onlineEnabled,
      eft_enabled: input.eftEnabled,
      bank_name: input.bankName || null,
      account_title: input.accountTitle || null,
      account_number: input.accountNumber || null,
      branch_code: input.branchCode || null,
      iban: input.iban || null,
      eft_instructions: input.eftInstructions || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { ok: true };
}

const SETTLED_STATUSES = ["released", "refunded", "returned"];

/**
 * Admin: manually release the held payment (→ released, credits the seller's
 * wallet minus commission) or refund the buyer (→ refunded).
 *
 * Release is always a deliberate admin action — nothing pays out automatically
 * when the buyer confirms delivery. Idempotent: already-settled orders no-op.
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
  if (SETTLED_STATUSES.includes(order.status)) return { ok: true };

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

  const { error } = await supabase
    .from("orders")
    .update({
      status: outcome,
      ...(outcome === "released" ? { released_at: new Date().toISOString() } : {}),
    })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/orders");
  return { ok: true };
}

/**
 * Admin: complete a return once the item is physically back.
 *
 * The buyer is refunded in full (they were never charged out of the held
 * funds, so nothing is paid to the seller). The seller is charged the
 * platform commission as a handling fee — they were never credited for this
 * sale, so their wallet only sees the negative commission line, which is
 * exactly the amount they owe the platform to get the part back.
 */
export async function processReturn(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: order } = await supabase
    .from("orders").select("reference,status").eq("id", orderId).single();
  if (!order) return { ok: false, error: "Order not found." };
  if (SETTLED_STATUSES.includes(order.status)) return { ok: true };
  if (order.status !== "return-requested") {
    return { ok: false, error: "This order doesn't have a return in progress." };
  }

  const { data: setting } = await supabase
    .from("commission_settings").select("pct").eq("id", 1).maybeSingle();
  const pct = setting?.pct != null ? Number(setting.pct) : 7;

  const { data: items } = await supabase
    .from("order_items").select("seller_id,title,price_cents,qty").eq("order_id", orderId);

  const txns: Array<Record<string, unknown>> = [];
  for (const it of items ?? []) {
    if (!it.seller_id) continue;
    const commission = Math.round(it.price_cents * it.qty * (pct / 100));
    if (commission <= 0) continue;
    txns.push({
      seller_id: it.seller_id,
      type: "commission",
      description: `Return fee (${pct}%) · Order ${order.reference} · ${it.title}`,
      amount_cents: -commission,
      status: "completed",
    });
  }
  if (txns.length) {
    const { error: txErr } = await supabase.from("wallet_transactions").insert(txns);
    if (txErr) return { ok: false, error: txErr.message };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/seller/wallet");
  revalidatePath("/seller/orders");
  return { ok: true };
}

/** Admin: update the return address buyers ship to, and the return window. */
export async function updatePlatformSettings(input: {
  returnAddress: string;
  returnContactName: string;
  returnContactPhone: string;
  returnWindowDays: number;
}): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase
    .from("platform_settings")
    .update({
      return_address: input.returnAddress || null,
      return_contact_name: input.returnContactName || null,
      return_contact_phone: input.returnContactPhone || null,
      return_window_days: input.returnWindowDays,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/account");
  return { ok: true };
}

/* ---------------------------------------------------------------------------
 * Bike catalog (Make / Model) — admin CRUD
 * ------------------------------------------------------------------------- */

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Admin: add a new bike make to the catalog. */
export async function createBikeMake(name: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { data: existing } = await supabase.from("bike_makes").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const logo = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "MP";
  const { error } = await supabase.from("bike_makes").insert({
    name: name.trim(), slug: slugify(name), logo, sort_order: (existing?.[0]?.sort_order ?? 0) + 1,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/brands");
  revalidatePath("/");
  return { ok: true };
}

/** Admin: rename a bike make (slug/logo stay fixed once created). */
export async function updateBikeMake(id: string, name: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("bike_makes").update({ name: name.trim() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/brands");
  return { ok: true };
}

/** Admin: remove a bike make. Its models cascade-delete with it. */
export async function deleteBikeMake(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("bike_makes").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/brands");
  return { ok: true };
}

export interface BikeModelInput {
  makeId: string;
  name: string;
  yearFrom: number;
  yearTo: number;
}

/** Admin: add a new model (with its year range) under a make. */
export async function createBikeModel(input: BikeModelInput): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("bike_models").insert({
    make_id: input.makeId, name: input.name.trim(), year_from: input.yearFrom, year_to: input.yearTo,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/seller/listings");
  return { ok: true };
}

/** Admin: edit a model's name, year range or active/inactive status. */
export async function updateBikeModel(
  id: string,
  input: Partial<BikeModelInput> & { status?: "active" | "inactive" },
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.yearFrom !== undefined) patch.year_from = input.yearFrom;
  if (input.yearTo !== undefined) patch.year_to = input.yearTo;
  if (input.status !== undefined) patch.status = input.status;
  const { error } = await supabase.from("bike_models").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/seller/listings");
  return { ok: true };
}

/** Admin: remove a model from the catalog. */
export async function deleteBikeModel(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;
  const { error } = await supabase.from("bike_models").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/catalog");
  revalidatePath("/seller/listings");
  return { ok: true };
}

/* ---------------------------------------------------------------------------
 * YMM (Year/Make/Model) requests — seller-proposed catalog additions
 * ------------------------------------------------------------------------- */

/**
 * Admin: approve a seller's proposed make/model/year. Reuses an existing
 * make/model when the name already exists (case-insensitive) instead of
 * creating a duplicate, then publishes the listing that was waiting on it.
 */
export async function approveYmmRequest(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: req } = await supabase.from("ymm_requests").select("*").eq("id", id).maybeSingle();
  if (!req) return { ok: false, error: "Request not found." };

  let { data: make } = await supabase
    .from("bike_makes").select("id").ilike("name", req.make_name).maybeSingle();
  if (!make) {
    const { data: existing } = await supabase.from("bike_makes").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const logo = req.make_name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "MP";
    const { data: created, error: makeErr } = await supabase
      .from("bike_makes")
      .insert({ name: req.make_name, slug: slugify(req.make_name), logo, sort_order: (existing?.[0]?.sort_order ?? 0) + 1 })
      .select("id").single();
    if (makeErr) return { ok: false, error: makeErr.message };
    make = created;
  }

  const { data: model } = await supabase
    .from("bike_models").select("id")
    .eq("make_id", make.id).ilike("name", req.model_name)
    .eq("year_from", req.year_from).eq("year_to", req.year_to).maybeSingle();
  if (!model) {
    const { error: modelErr } = await supabase.from("bike_models").insert({
      make_id: make.id, name: req.model_name, year_from: req.year_from, year_to: req.year_to,
    });
    if (modelErr) return { ok: false, error: modelErr.message };
  }

  const { error: reqErr } = await supabase
    .from("ymm_requests").update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", id);
  if (reqErr) return { ok: false, error: reqErr.message };

  const { data: seller } = await supabase.from("sellers").select("status").eq("id", req.seller_id).maybeSingle();
  const productStatus = seller?.status === "active" ? "active" : "awaiting-verification";
  await supabase.from("products").update({ status: productStatus }).eq("id", req.product_id).eq("status", "pending-review");

  revalidatePath("/admin/ymm-requests");
  revalidatePath("/admin/catalog");
  revalidatePath("/admin/listings");
  revalidatePath("/seller/listings");
  revalidatePath("/parts");
  revalidatePath("/brands");
  return { ok: true };
}

/** Admin: reject a seller's proposed make/model/year. The listing is pulled back to draft. */
export async function rejectYmmRequest(id: string, note?: string): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONNECTED;

  const { data: req } = await supabase.from("ymm_requests").select("product_id").eq("id", id).maybeSingle();
  if (!req) return { ok: false, error: "Request not found." };

  const { error } = await supabase
    .from("ymm_requests")
    .update({ status: "rejected", admin_note: note || null, decided_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("products").update({ status: "draft" }).eq("id", req.product_id).eq("status", "pending-review");

  revalidatePath("/admin/ymm-requests");
  revalidatePath("/admin/listings");
  revalidatePath("/seller/listings");
  return { ok: true };
}
