import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import {
  sellerListings as mockListings,
  sellerOrders as mockOrders,
  walletTxns as mockWallet,
  walletBalanceCents as mockBalance,
  walletPendingCents as mockPending,
  sellerApplications as mockApplications,
  DEFAULT_COMMISSION_PCT,
} from "@/mocks/dashboard";
import type {
  SellerApplication,
  SellerListing,
  SellerOrder,
  WalletTxn,
} from "@/types";

export interface CurrentSeller {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  location: string | null;
  status: string;
  verified: boolean;
  business_type: string | null;
  id_doc_url: string | null;
  proof_of_residence_url: string | null;
}

const SELLER_COLS =
  "id,name,slug,logo,location,status,verified,business_type,id_doc_url,proof_of_residence_url";

/**
 * Resolve the seller row for the signed-in seller, creating one on first
 * visit. Returns null when unconfigured / not signed in / not a seller —
 * callers then fall back to demo data.
 */
export async function getCurrentSeller(): Promise<CurrentSeller | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("sellers")
    .select(SELLER_COLS)
    .eq("profile_id", user.id)
    .maybeSingle();
  if (existing) return existing as CurrentSeller;

  // Only auto-provision a storefront for seller-role accounts.
  const { data: profile } = await supabase
    .from("profiles").select("role, full_name, email").eq("id", user.id).single();
  if (profile?.role !== "seller") return null;

  const base =
    (profile.full_name || profile.email || "seller").toString().trim() || "Seller";
  const slug =
    base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" + user.id.slice(0, 6);

  const { data: created } = await supabase
    .from("sellers")
    .insert({
      profile_id: user.id,
      name: base,
      slug,
      logo: base.slice(0, 2).toUpperCase(),
      status: "pending",
    })
    .select(SELLER_COLS)
    .single();

  return (created as CurrentSeller) ?? null;
}

export async function getSellerListings(): Promise<SellerListing[]> {
  const supabase = await createClient();
  const seller = await getCurrentSeller();
  if (!supabase || !seller) return mockListings;

  const { data } = await supabase
    .from("products")
    .select("id,title,slug,sku,category_slug,price_cents,stock,status,views,sold,condition,created_at")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  if (!data) return [];
  return data.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, sku: p.sku, categorySlug: p.category_slug,
    priceCents: p.price_cents, stock: p.stock, status: p.status, views: p.views,
    sold: p.sold, condition: p.condition, createdAt: p.created_at,
  }));
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const supabase = await createClient();
  const seller = await getCurrentSeller();
  if (!supabase || !seller) return mockOrders;

  const { data } = await supabase
    .from("order_items")
    .select("qty, price_cents, title, product_id, orders(id, reference, buyer_name, status, courier, tracking, shipping_cents, placed_at)")
    .eq("seller_id", seller.id);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const o = Array.isArray(row.orders) ? row.orders[0] : row.orders;
    return {
      id: o?.id, reference: o?.reference, productTitle: row.title, productId: row.product_id,
      buyerName: o?.buyer_name ?? "Buyer", qty: row.qty, totalCents: row.price_cents * row.qty,
      status: o?.status, courier: o?.courier ?? undefined, tracking: o?.tracking ?? undefined,
      shippingCents: o?.shipping_cents ?? undefined, placedAt: o?.placed_at,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getWallet(): Promise<{
  balanceCents: number;
  pendingCents: number;
  txns: WalletTxn[];
}> {
  const supabase = await createClient();
  const seller = await getCurrentSeller();
  if (!supabase || !seller) {
    return { balanceCents: mockBalance, pendingCents: mockPending, txns: mockWallet };
  }
  const { data } = await supabase
    .from("wallet_transactions")
    .select("id,type,description,amount_cents,status,created_at")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  const txns: WalletTxn[] = (data ?? []).map((t) => ({
    id: t.id, type: t.type, description: t.description ?? "",
    amountCents: t.amount_cents, date: t.created_at,
    status: t.status === "pending" ? "pending" : "completed",
  }));
  const balanceCents = txns.filter((t) => t.status === "completed").reduce((s, t) => s + t.amountCents, 0);
  const pendingCents = txns.filter((t) => t.status === "pending").reduce((s, t) => s + Math.max(t.amountCents, 0), 0);
  return { balanceCents, pendingCents, txns };
}

export async function getSellerApplications(): Promise<SellerApplication[]> {
  const supabase = await createClient();
  if (!supabase) return mockApplications;
  const { data } = await supabase
    .from("sellers")
    .select("id,name,location,business_type,status,id_doc_url,proof_of_residence_url,created_at,profile:profiles(full_name,email)")
    .order("created_at", { ascending: false });
  if (!data?.length) return mockApplications;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((s: any) => {
    const p = Array.isArray(s.profile) ? s.profile[0] : s.profile;
    return {
      id: s.id, businessName: s.name, ownerName: p?.full_name ?? "—",
      email: p?.email ?? "—", location: s.location ?? "—",
      businessType: (s.business_type ?? "Individual"),
      submittedAt: s.created_at, idDocUploaded: !!s.id_doc_url,
      proofOfResidenceUploaded: !!s.proof_of_residence_url,
      idDocPath: s.id_doc_url, proofPath: s.proof_of_residence_url, status: s.status,
    } as SellerApplication;
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getCommissionPct(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_COMMISSION_PCT;
  const { data } = await supabase.from("commission_settings").select("pct").eq("id", 1).maybeSingle();
  return data?.pct != null ? Number(data.pct) : DEFAULT_COMMISSION_PCT;
}

export async function currentUserIsSeller(): Promise<boolean> {
  const u = await getSessionUser();
  return u?.role === "seller" || u?.role === "admin";
}

export interface AdminOrderView {
  id: string;
  reference: string;
  seller: string;
  buyer: string;
  totalCents: number;
  status: string;
  escrow: "held" | "released" | "refunded";
  date: string;
}

const ESCROW_FROM_STATUS = (status: string): "held" | "released" | "refunded" =>
  status === "released" || status === "confirmed"
    ? "released"
    : status === "refunded"
      ? "refunded"
      : "held";

export async function getAdminOrders(): Promise<AdminOrderView[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { adminOrders } = await import("@/mocks/dashboard");
    return adminOrders.map((o) => ({ id: o.reference, ...o }));
  }
  const { data } = await supabase
    .from("orders")
    .select("id, reference, buyer_name, status, total_cents, placed_at, order_items(seller_id, sellers(name))")
    .order("placed_at", { ascending: false });
  if (!data?.length) {
    const { adminOrders } = await import("@/mocks/dashboard");
    return adminOrders.map((o) => ({ id: o.reference, ...o }));
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((o: any) => {
    const firstItem = o.order_items?.[0];
    const sellerObj = Array.isArray(firstItem?.sellers) ? firstItem.sellers[0] : firstItem?.sellers;
    return {
      id: o.id, reference: o.reference, seller: sellerObj?.name ?? "—",
      buyer: o.buyer_name ?? "—", totalCents: o.total_cents,
      status: o.status, escrow: ESCROW_FROM_STATUS(o.status), date: o.placed_at,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
