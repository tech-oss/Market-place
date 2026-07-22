import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, MapPin, PackageSearch } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductGrid } from "@/components/shared/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { StarRating } from "@/components/shared/star-rating";
import { getProductsBySeller, getSellerBySlug, sellers } from "@/mocks";
import { formatCount } from "@/lib/format";

export function generateStaticParams() {
  return sellers.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);
  return seller
    ? { title: seller.name, description: `${seller.name} — verified motorcycle parts seller in ${seller.location}.` }
    : { title: "Seller not found" };
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);
  if (!seller) notFound();

  const products = getProductsBySeller(seller.id);
  const memberYear = new Date(seller.memberSince).getFullYear();

  return (
    <>
      {/* Storefront banner */}
      <div className="bg-ink text-white">
        <Container className="py-8">
          <Breadcrumbs
            className="mb-6 [&_*]:text-white/60 [&_[aria-current]]:text-white"
            items={[
              { label: "Home", href: "/" },
              { label: "Sellers", href: "/sellers" },
              { label: seller.name },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black">
              {seller.logo}
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
                {seller.name}
                {seller.verified && <BadgeCheck className="size-6 text-brand" />}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {seller.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> Member since {memberYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <StarRating rating={seller.rating} count={seller.reviewCount} size={14} />
                </span>
                <span>{formatCount(seller.partCount)} parts listed</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <h2 className="mb-6 text-xl font-bold text-foreground">
          Listings from {seller.name}
        </h2>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No active listings"
            description="This seller has no parts listed right now. Check back soon."
            action={{ label: "Browse all parts", href: "/parts" }}
          />
        )}
      </Container>
    </>
  );
}
