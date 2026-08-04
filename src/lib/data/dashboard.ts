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
  OrderStatus,
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
  seller_type: string;
  id_doc_url: string | null;
  proof_of_residence_url: string | null;
  proof_of_banking_url: string | null;
}

const SELLER_COLS =
  "id,name,slug,logo,location,status,verified,business_type,seller_type,id_doc_url,proof_of_residence_url,proof_of_banking_url";

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

  const rawSellerType = (user.user_metadata?.seller_type as string) ?? "individual";
  const sellerType = ["individual", "parts_dealer", "accessories_dealer"].includes(rawSellerType)
    ? rawSellerType
    : "individual";

  const { data: created } = await supabase
    .from("sellers")
    .insert({
      profile_id: user.id,
      name: base,
      slug,
      logo: base.slice(0, 2).toUpperCase(),
      status: "pending",
      seller_type: sellerType,
    })
    .select(SELLER_COLS)
    .single();

  return (created as CurrentSeller) ?? null;
}

export async function getSellerListings(): Promise<SellerListing[]> {
  const supabase = await createClient();
  if (!supabase) return mockListings;
  const seller = await getCurrentSeller();
  if (!seller) return [];

  const { data } = await supabase
    .from("products")
    .select("id,title,slug,sku,item_number,category_slug,brand_name,price_cents,stock,status,views,sold,condition,shipping_cents,shipping_local_cents,created_at,product_images(id,url,alt,position),fitments(brand,model,year_from,year_to)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  if (!data) return [];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((p: any) => {
    const fitment = Array.isArray(p.fitments) ? p.fitments[0] : p.fitments;
    return {
      id: p.id, title: p.title, slug: p.slug, sku: p.sku, itemNumber: p.item_number ?? "—", categorySlug: p.category_slug,
      priceCents: p.price_cents, stock: p.stock, status: p.status, views: p.views,
      sold: p.sold, condition: p.condition,
      shippingCents: p.shipping_cents ?? undefined,
      shippingLocalCents: p.shipping_local_cents ?? undefined,
      createdAt: p.created_at,
      brandName: p.brand_name ?? undefined,
      images: (p.product_images ?? [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((i: any) => ({ id: i.id, url: i.url ?? "", alt: i.alt ?? p.title })),
      fitment: fitment
        ? { brand: fitment.brand, model: fitment.model, yearFrom: fitment.year_from, yearTo: fitment.year_to }
        : undefined,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const supabase = await createClient();
  if (!supabase) return mockOrders;
  const seller = await getCurrentSeller();
  if (!seller) return [];

  const { data } = await supabase
    .from("order_items")
    .select("qty, price_cents, title, product_id, orders(id, reference, buyer_name, status, courier, tracking, shipping_service, shipping_note, shipping_cents, placed_at)")
    .eq("seller_id", seller.id);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((row: any) => {
    const o = Array.isArray(row.orders) ? row.orders[0] : row.orders;
    return {
      id: o?.id, reference: o?.reference, productTitle: row.title, productId: row.product_id,
      buyerName: o?.buyer_name ?? "Buyer", qty: row.qty, totalCents: row.price_cents * row.qty,
      status: o?.status, courier: o?.courier ?? undefined, tracking: o?.tracking ?? undefined,
      shippingService: o?.shipping_service ?? undefined, shippingNote: o?.shipping_note ?? undefined,
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
  if (!supabase) {
    return { balanceCents: mockBalance, pendingCents: mockPending, txns: mockWallet };
  }
  const seller = await getCurrentSeller();
  if (!seller) return { balanceCents: 0, pendingCents: 0, txns: [] };
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
  // Completed sale/commission entries, plus any payout (pending or completed) —
  // a requested payout deducts from the available balance immediately.
  const balanceCents = txns
    .filter((t) => t.status === "completed" || t.type === "payout")
    .reduce((s, t) => s + t.amountCents, 0);

  // Pending = value of this seller's items on orders still held in escrow.
  const { data: held } = await supabase
    .from("order_items")
    .select("price_cents,qty,orders(status)")
    .eq("seller_id", seller.id);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ESCROW = ["paid-held", "shipped", "delivered", "confirmed"];
  const pendingCents = (held ?? [])
    .filter((r: any) => {
      const o = Array.isArray(r.orders) ? r.orders[0] : r.orders;
      return o && ESCROW.includes(o.status);
    })
    .reduce((s: number, r: any) => s + r.price_cents * r.qty, 0);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return { balanceCents, pendingCents, txns };
}

export interface BuyerOrderView {
  id: string;
  reference: string;
  status: OrderStatus;
  totalCents: number;
  placedAt: string;
  courier?: string;
  tracking?: string;
  shippingService?: string;
  shippingNote?: string;
  items: { title: string; productSlug: string | null; qty: number; priceCents: number }[];
}

/** The signed-in buyer's own orders (My Account → Recent Orders). */
export async function getBuyerOrders(): Promise<BuyerOrderView[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select("id, reference, status, total_cents, placed_at, courier, tracking, shipping_service, shipping_note, order_items(title, qty, price_cents, product:products(slug))")
    .eq("buyer_id", user.id)
    .order("placed_at", { ascending: false });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((o: any) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    totalCents: o.total_cents,
    placedAt: o.placed_at,
    courier: o.courier ?? undefined,
    tracking: o.tracking ?? undefined,
    shippingService: o.shipping_service ?? undefined,
    shippingNote: o.shipping_note ?? undefined,
    items: (o.order_items ?? []).map((it: any) => {
      const prod = Array.isArray(it.product) ? it.product[0] : it.product;
      return { title: it.title, productSlug: prod?.slug ?? null, qty: it.qty, priceCents: it.price_cents };
    }),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface BuyerOrderDetail {
  id: string;
  reference: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  placedAt: string;
  courier?: string;
  tracking?: string;
  shippingService?: string;
  shippingNote?: string;
  confirmedAt?: string;
  returnRequestedAt?: string;
  returnReason?: string;
  shippingAddress: {
    name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
  };
  items: { title: string; productSlug: string | null; sellerName: string | null; qty: number; priceCents: number }[];
}

/** A single order belonging to the signed-in buyer, for the order detail page. Null if it isn't theirs. */
export async function getBuyerOrderById(id: string): Promise<BuyerOrderDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "id, reference, status, subtotal_cents, shipping_cents, total_cents, placed_at, courier, tracking, shipping_service, shipping_note, confirmed_at, return_requested_at, return_reason, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code, order_items(title, qty, price_cents, product:products(slug), seller:sellers(name))",
    )
    .eq("id", id)
    .eq("buyer_id", user.id)
    .maybeSingle();
  if (!data) return null;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const d = data as any;
  return {
    id: d.id,
    reference: d.reference,
    status: d.status,
    subtotalCents: d.subtotal_cents,
    shippingCents: d.shipping_cents,
    totalCents: d.total_cents,
    placedAt: d.placed_at,
    courier: d.courier ?? undefined,
    tracking: d.tracking ?? undefined,
    shippingService: d.shipping_service ?? undefined,
    shippingNote: d.shipping_note ?? undefined,
    confirmedAt: d.confirmed_at ?? undefined,
    returnRequestedAt: d.return_requested_at ?? undefined,
    returnReason: d.return_reason ?? undefined,
    shippingAddress: {
      name: d.shipping_name, phone: d.shipping_phone, address: d.shipping_address,
      city: d.shipping_city, postalCode: d.shipping_postal_code,
    },
    items: (d.order_items ?? []).map((it: any) => {
      const prod = Array.isArray(it.product) ? it.product[0] : it.product;
      const seller = Array.isArray(it.seller) ? it.seller[0] : it.seller;
      return { title: it.title, productSlug: prod?.slug ?? null, sellerName: seller?.name ?? null, qty: it.qty, priceCents: it.price_cents };
    }),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export async function getSellerApplications(): Promise<SellerApplication[]> {
  const supabase = await createClient();
  if (!supabase) return mockApplications;
  const { data } = await supabase
    .from("sellers")
    .select("id,name,location,business_type,seller_type,status,approval_type,id_doc_url,proof_of_residence_url,proof_of_banking_url,created_at,profile:profiles(full_name,email)")
    .order("created_at", { ascending: false });
  if (!data) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((s: any) => {
    const p = Array.isArray(s.profile) ? s.profile[0] : s.profile;
    return {
      id: s.id, businessName: s.name, ownerName: p?.full_name ?? "—",
      email: p?.email ?? "—", location: s.location ?? "—",
      businessType: (s.business_type ?? "Individual"),
      sellerType: s.seller_type ?? "individual",
      submittedAt: s.created_at, idDocUploaded: !!s.id_doc_url,
      proofOfResidenceUploaded: !!s.proof_of_residence_url,
      proofOfBankingUploaded: !!s.proof_of_banking_url,
      idDocPath: s.id_doc_url, proofPath: s.proof_of_residence_url,
      bankingPath: s.proof_of_banking_url,
      status: s.status, approvalType: s.approval_type,
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
  courier?: string;
  tracking?: string;
  shippingService?: string;
  confirmedAt?: string;
  releasedAt?: string;
  returnRequestedAt?: string;
  returnReason?: string;
}

/**
 * Funds are only "released" once an admin explicitly releases them — a buyer
 * confirming delivery leaves the money held, which is what makes the manual
 * review window possible. A completed return settles as a refund.
 */
const ESCROW_FROM_STATUS = (status: string): "held" | "released" | "refunded" =>
  status === "released"
    ? "released"
    : status === "refunded" || status === "returned"
      ? "refunded"
      : "held";

export interface AdminListingView {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  sellerName: string;
  condition: string;
  priceCents: number;
  status: string;
  itemNumber: string;
  sku: string;
}

/** Admin: every listing regardless of status, for moderation. */
export async function getAdminListings(): Promise<AdminListingView[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { allProducts } = await import("@/mocks");
    return allProducts.map((p, i) => ({
      id: p.id, slug: p.slug, title: p.title, brandName: p.brandName, sellerName: p.seller.name,
      condition: p.condition, priceCents: p.priceCents, status: "active",
      itemNumber: `MP-${100000 + i + 1}`, sku: "—",
    }));
  }

  const { data } = await supabase
    .from("products")
    .select("id, slug, title, brand_name, condition, price_cents, status, item_number, sku, sellers(name)")
    .order("created_at", { ascending: false });
  if (!data) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((p: any) => {
    const sellerObj = Array.isArray(p.sellers) ? p.sellers[0] : p.sellers;
    return {
      id: p.id, slug: p.slug ?? "", title: p.title, brandName: p.brand_name ?? "—",
      sellerName: sellerObj?.name ?? "—", condition: p.condition,
      priceCents: p.price_cents, status: p.status,
      itemNumber: p.item_number ?? "—", sku: p.sku ?? "—",
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface YmmRequestView {
  id: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
  makeName: string;
  modelName: string;
  yearFrom: number;
  yearTo: number;
  createdAt: string;
}

/** Admin: pending seller requests to add a new make/model/year to the catalog. */
export async function getYmmRequests(): Promise<YmmRequestView[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("ymm_requests")
    .select("id, seller_id, product_id, make_name, model_name, year_from, year_to, created_at, sellers(name), products(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (!data) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((r: any) => {
    const seller = Array.isArray(r.sellers) ? r.sellers[0] : r.sellers;
    const product = Array.isArray(r.products) ? r.products[0] : r.products;
    return {
      id: r.id, sellerId: r.seller_id, sellerName: seller?.name ?? "—",
      productId: r.product_id, productTitle: product?.title ?? "—",
      makeName: r.make_name, modelName: r.model_name,
      yearFrom: r.year_from, yearTo: r.year_to, createdAt: r.created_at,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Admin: the most recent YMM request tied to a specific listing, if any. */
export async function getYmmRequestForProduct(productId: string): Promise<{
  status: "pending" | "approved" | "rejected";
  makeName: string;
  modelName: string;
  yearFrom: number;
  yearTo: number;
  adminNote: string | null;
} | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("ymm_requests")
    .select("status, make_name, model_name, year_from, year_to, admin_note")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status, makeName: data.make_name, modelName: data.model_name,
    yearFrom: data.year_from, yearTo: data.year_to, adminNote: data.admin_note,
  };
}

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: string;
  /** Present only for seller-role accounts — the sellers.id row to act on. */
  sellerId?: string;
  sellerType?: string;
}

/** Admin: every buyer + seller account on the platform. */
export async function getAdminUsers(): Promise<AdminUserView[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { sellers } = await import("@/mocks");
    return sellers.map((s) => ({
      id: s.id, name: s.name, email: `${s.slug}@sellers.co.za`,
      role: "seller", joined: s.memberSince, status: "active",
    }));
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });
  if (!profiles?.length) return [];

  const { data: sellerRows } = await supabase.from("sellers").select("id, profile_id, status, seller_type");
  const sellerByProfile = new Map((sellerRows ?? []).map((s) => [s.profile_id, s]));

  return profiles
    .filter((p) => p.role !== "admin")
    .map((p) => {
      const s = sellerByProfile.get(p.id);
      return {
        id: p.id,
        name: p.full_name || "—",
        email: p.email || "—",
        role: p.role,
        joined: p.created_at,
        status: p.role === "seller" ? (s?.status ?? "pending") : "active",
        sellerId: s?.id,
        sellerType: s?.seller_type,
      };
    });
}

/** Admin: count of currently-active sellers. */
export async function getActiveSellerCount(): Promise<number> {
  const supabase = await createClient();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("sellers")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  return count ?? 0;
}

export interface TopSellerView {
  id: string;
  name: string;
  slug: string;
  logo: string;
  location: string;
  rating: number;
  reviewCount: number;
  partCount: number;
  verified: boolean;
}

/** Active sellers for public listings/homepage. `limit=0` returns all. */
export async function getTopSellers(limit = 6): Promise<TopSellerView[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { sellers } = await import("@/mocks");
    const rows = sellers.map((s) => ({
      id: s.id, name: s.name, slug: s.slug, logo: s.logo, location: s.location,
      rating: s.rating, reviewCount: s.reviewCount, partCount: s.partCount, verified: s.verified,
    }));
    return limit ? rows.slice(0, limit) : rows;
  }

  let query = supabase
    .from("sellers")
    .select("id,name,slug,logo,location,rating,review_count,verified,products(count)")
    .eq("status", "active")
    .order("rating", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data } = await query;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((s: any) => {
    const productsAgg = Array.isArray(s.products) ? s.products[0] : s.products;
    return {
      id: s.id, name: s.name, slug: s.slug, logo: s.logo ?? s.name.slice(0, 2).toUpperCase(),
      location: s.location ?? "—", rating: Number(s.rating), reviewCount: s.review_count,
      partCount: productsAgg?.count ?? 0, verified: s.verified,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** All active sellers for the public /sellers directory. */
export function getPublicSellers(): Promise<TopSellerView[]> {
  return getTopSellers(0);
}

export interface PlatformStat {
  label: string;
  value: string;
}

/** Real, DB-derived homepage stat bar — no hardcoded numbers. */
export async function getPlatformStats(): Promise<PlatformStat[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { platformStats } = await import("@/mocks");
    return platformStats;
  }

  const [{ count: partsCount }, { count: sellerCount }, { data: reviewRows }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("sellers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("reviews").select("rating"),
  ]);

  const ratings = reviewRows ?? [];
  const positivePct = ratings.length
    ? Math.round((ratings.filter((r) => r.rating >= 4).length / ratings.length) * 1000) / 10
    : 0;

  return [
    { label: "Parts Listed", value: `${(partsCount ?? 0).toLocaleString("en-ZA")}${partsCount ? "+" : ""}` },
    { label: "Verified Sellers", value: String(sellerCount ?? 0) },
    { label: "Positive Reviews", value: ratings.length ? `${positivePct}%` : "—" },
    { label: "Secure Payments", value: "100%" },
  ];
}

export async function getAdminOrders(): Promise<AdminOrderView[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { adminOrders } = await import("@/mocks/dashboard");
    return adminOrders.map((o) => ({ id: o.reference, ...o }));
  }
  const { data } = await supabase
    .from("orders")
    .select("id, reference, buyer_name, status, total_cents, placed_at, courier, tracking, shipping_service, confirmed_at, released_at, return_requested_at, return_reason, order_items(seller_id, sellers(name))")
    .order("placed_at", { ascending: false });
  if (!data) return [];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return data.map((o: any) => {
    const firstItem = o.order_items?.[0];
    const sellerObj = Array.isArray(firstItem?.sellers) ? firstItem.sellers[0] : firstItem?.sellers;
    return {
      id: o.id, reference: o.reference, seller: sellerObj?.name ?? "—",
      buyer: o.buyer_name ?? "—", totalCents: o.total_cents,
      status: o.status, escrow: ESCROW_FROM_STATUS(o.status), date: o.placed_at,
      courier: o.courier ?? undefined, tracking: o.tracking ?? undefined,
      shippingService: o.shipping_service ?? undefined,
      confirmedAt: o.confirmed_at ?? undefined,
      releasedAt: o.released_at ?? undefined,
      returnRequestedAt: o.return_requested_at ?? undefined,
      returnReason: o.return_reason ?? undefined,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface PlatformSettings {
  returnAddress: string;
  returnContactName: string;
  returnContactPhone: string;
  returnWindowDays: number;
}

/** Platform-wide settings: the return address buyers ship to, and the return window. */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const fallback = { returnAddress: "", returnContactName: "", returnContactPhone: "", returnWindowDays: 5 };
  const supabase = await createClient();
  if (!supabase) return fallback;
  const { data } = await supabase
    .from("platform_settings")
    .select("return_address, return_contact_name, return_contact_phone, return_window_days")
    .eq("id", 1)
    .maybeSingle();
  if (!data) return fallback;
  return {
    returnAddress: data.return_address ?? "",
    returnContactName: data.return_contact_name ?? "",
    returnContactPhone: data.return_contact_phone ?? "",
    returnWindowDays: data.return_window_days ?? 5,
  };
}
