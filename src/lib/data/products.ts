import { createClient } from "@/lib/supabase/server";
import {
  allProducts as mockAll,
  featuredProducts as mockFeatured,
  recentProducts as mockRecent,
  getProductBySlug as mockBySlug,
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
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getCatalogProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return mockAll;
  const { data, error } = await supabase.from("products").select(SELECT).eq("status", "active");
  if (error || !data) return mockAll;
  return data.map(mapRow);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return mockFeatured;
  const { data } = await supabase.from("products").select(SELECT).eq("is_featured", true).limit(5);
  return data?.length ? data.map(mapRow) : mockFeatured;
}

export async function getRecentProducts(): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase) return mockRecent;
  const { data } = await supabase
    .from("products").select(SELECT).eq("status", "active")
    .order("listed_at", { ascending: false }).limit(5);
  return data?.length ? data.map(mapRow) : mockRecent;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  if (!supabase) return mockBySlug(slug) ?? null;
  const { data } = await supabase.from("products").select(SELECT).eq("slug", slug).single();
  return data ? mapRow(data) : mockBySlug(slug) ?? null;
}

export async function getRelatedProducts(categorySlug: string, excludeId: string): Promise<Product[]> {
  const all = await getCatalogProducts();
  return all.filter((p) => p.categorySlug === categorySlug && p.id !== excludeId).slice(0, 4);
}
