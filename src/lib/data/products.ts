import { createClient } from "@/lib/supabase/server";
import {
  allProducts as mockAll,
  featuredProducts as mockFeatured,
  recentProducts as mockRecent,
  getProductBySlug as mockBySlug,
  getProductById as mockById,
} from "@/mocks";
import type { Product } from "@/types";

/**
 * Data-access layer for products. Reads from Supabase when configured,
 * otherwise returns mock data so the app works before the backend is live.
 */

const SELECT =
  "id, slug, title, price_cents, compare_at_cents, condition, category_slug, brand_name, oem_numbers, stock, status, is_featured, is_new, listed_at, shipping_cents, shipping_local_cents, product_images(id,url,alt,position), fitments(brand,model,year_from,year_to), seller:sellers(id,name,slug,location,logo,rating)";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): Product {
  const seller = Array.isArray(r.seller) ? r.seller[0] : r.seller;
  const images =
    (r.product_images ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((i: any) => ({ id: i.id, url: i.url ?? "", alt: i.alt ?? r.title })) ;
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    priceCents: r.price_cents,
    compareAtCents: r.compare_at_cents ?? undefined,
    condition: r.condition,
    categorySlug: r.category_slug,
    brandName: r.brand_name,
    oemNumbers: r.oem_numbers ?? [],
    fitment: (r.fitments ?? []).map((f: any) => ({
      brand: f.brand, model: f.model, yearFrom: f.year_from, yearTo: f.year_to,
    })),
    images: images.length ? images : [{ id: `${r.id}-i`, url: "", alt: r.title }],
    seller: {
      id: seller?.id ?? "",
      name: seller?.name ?? "Seller",
      slug: seller?.slug ?? "",
      location: seller?.location ?? "",
      logo: seller?.logo ?? "MP",
      rating: seller?.rating ?? 0,
    },
    stock: r.stock,
    shippingCents: r.shipping_cents ?? undefined,
    shippingLocalCents: r.shipping_local_cents ?? undefined,
    listedAt: r.listed_at,
    isFeatured: r.is_featured,
    isNew: r.is_new,
    status: r.status,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getCatalogProducts(): Promise<Product[]> {
  const supabase = await createClient();
  // Only fall back to demo data when there is no backend at all. When Supabase
  // is connected, return exactly what it holds — an empty catalog stays empty
  // rather than surfacing demo listings on the live site.
  if (!supabase) return mockAll;
  const { data, error } = await supabase.from("products").select(SELECT).eq("status", "active");
  if (error) return [];
  return (data ?? []).map(mapRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return mockFeatured;
  const { data } = await supabase.from("products").select(SELECT).eq("is_featured", true).limit(5);
  return (data ?? []).map(mapRow);
}

export async function getRecentProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return mockRecent;
  const { data } = await supabase
    .from("products").select(SELECT).eq("status", "active")
    .order("listed_at", { ascending: false }).limit(5);
  return (data ?? []).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  if (!supabase) return mockBySlug(slug) ?? null;
  const { data } = await supabase.from("products").select(SELECT).eq("slug", slug).maybeSingle();
  return data ? mapRow(data) : null;
}

/** Full product detail regardless of status — used by the admin listing view. */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  if (!supabase) return mockById(id) ?? null;
  const { data } = await supabase.from("products").select(SELECT).eq("id", id).maybeSingle();
  return data ? mapRow(data) : null;
}

export async function getRelatedProducts(categorySlug: string, excludeId: string): Promise<Product[]> {
  const all = await getCatalogProducts();
  return all.filter((p) => p.categorySlug === categorySlug && p.id !== excludeId).slice(0, 4);
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

/** Real reviews for a product. Empty when none exist — no demo reviews. */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("reviews")
    .select("id, author, rating, title, body, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id, author: r.author, rating: r.rating,
    title: r.title ?? "", body: r.body ?? "", createdAt: r.created_at,
  }));
}

export interface BikeMake {
  id: string;
  name: string;
  slug: string;
  logo: string;
  partCount: number;
}

/**
 * Motorcycle makes from the `bike_makes` table, each annotated with the
 * live count of active listings whose brand matches that make (a listing's
 * "brand" is the bike make it's compatible with — see createListing).
 * Falls back to the static mock list (zero counts) when unconfigured.
 */
export async function getBikeMakes(): Promise<BikeMake[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { brands } = await import("@/mocks");
    return brands.map((b) => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logo, partCount: 0 }));
  }

  const [{ data: makes }, { data: products }] = await Promise.all([
    supabase.from("bike_makes").select("id,name,slug,logo").order("sort_order"),
    supabase.from("products").select("brand_name").eq("status", "active"),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    const key = (p.brand_name ?? "").toLowerCase();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return (makes ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    logo: m.logo,
    partCount: counts.get(m.name.toLowerCase()) ?? 0,
  }));
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  partCount: number;
}

/**
 * Part categories from the `categories` table, each annotated with the live
 * count of active listings in it. Falls back to the static mock list (zero
 * counts, no banner image) when unconfigured.
 */
export async function getCategories(): Promise<CatalogCategory[]> {
  const supabase = await createClient();
  if (!supabase) {
    const { categories } = await import("@/mocks");
    return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: "", partCount: 0 }));
  }

  const [{ data: cats }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,name,slug,image_url").order("sort_order"),
    supabase.from("products").select("category_slug").eq("status", "active"),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    counts.set(p.category_slug, (counts.get(p.category_slug) ?? 0) + 1);
  }

  return (cats ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image_url,
    partCount: counts.get(c.slug) ?? 0,
  }));
}

export interface BikeModel {
  id: string;
  makeId: string;
  makeName: string;
  name: string;
  yearFrom: number;
  yearTo: number;
  status: "active" | "inactive";
}

/**
 * The admin-managed model catalog (`bike_models`), joined with its make name.
 * Used for the seller listing form's Make -> Model cascade and the admin
 * Bike Catalog management page. By default only active models are returned
 * (what a seller should be able to pick); pass includeInactive for admin use.
 */
export async function getBikeModelsCatalog({ includeInactive = false } = {}): Promise<BikeModel[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("bike_models")
    .select("id, make_id, name, year_from, year_to, status, bike_makes(name)")
    .order("name");
  if (!includeInactive) query = query.eq("status", "active");

  const { data } = await query;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data ?? []).map((m: any) => {
    const make = Array.isArray(m.bike_makes) ? m.bike_makes[0] : m.bike_makes;
    return {
      id: m.id,
      makeId: m.make_id,
      makeName: make?.name ?? "—",
      name: m.name,
      yearFrom: m.year_from,
      yearTo: m.year_to,
      status: m.status,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export interface FitmentFacet {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

/**
 * Distinct make/model/year fitments actually attached to *active* listings —
 * the source of truth for "what can a buyer search for right now". Unlike
 * the catalog (which an admin curates ahead of stock existing), this only
 * ever reflects real inventory: a make/model with no active listing simply
 * won't appear.
 */
export async function getFitmentFacets(): Promise<FitmentFacet[]> {
  const supabase = await createClient();
  if (!supabase) {
    return mockAll.flatMap((p) =>
      p.fitment.map((f) => ({ brand: f.brand, model: f.model, yearFrom: f.yearFrom, yearTo: f.yearTo })),
    );
  }

  const { data } = await supabase
    .from("fitments")
    .select("brand, model, year_from, year_to, products!inner(status)")
    .eq("products.status", "active");

  return (data ?? []).map((f) => ({
    brand: f.brand, model: f.model, yearFrom: f.year_from, yearTo: f.year_to,
  }));
}

export interface PublicSeller {
  id: string;
  name: string;
  slug: string;
  logo: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  memberSince: string;
}

/** Public seller storefront by slug (active sellers only), with their live products. */
export async function getSellerStorefront(
  slug: string,
): Promise<{ seller: PublicSeller; products: Product[] } | null> {
  const supabase = await createClient();
  if (!supabase) {
    const { getSellerBySlug, getProductsBySeller } = await import("@/mocks");
    const s = getSellerBySlug(slug);
    if (!s) return null;
    return {
      seller: {
        id: s.id, name: s.name, slug: s.slug, logo: s.logo, location: s.location,
        rating: s.rating, reviewCount: s.reviewCount, verified: s.verified, memberSince: s.memberSince,
      },
      products: getProductsBySeller(s.id),
    };
  }

  const { data: s } = await supabase
    .from("sellers")
    .select("id,name,slug,logo,location,rating,review_count,verified,member_since,status")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (!s) return null;

  const { data: prods } = await supabase
    .from("products").select(SELECT).eq("seller_id", s.id).eq("status", "active");

  return {
    seller: {
      id: s.id, name: s.name, slug: s.slug, logo: s.logo ?? s.name.slice(0, 2).toUpperCase(),
      location: s.location ?? "—", rating: Number(s.rating), reviewCount: s.review_count,
      verified: s.verified, memberSince: s.member_since,
    },
    products: (prods ?? []).map(mapRow),
  };
}
