import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, MessageSquare, Star } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { StarRating } from "@/components/shared/star-rating";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGrid } from "@/components/shared/product-grid";
import { conditionLabel } from "@/lib/format";
import { hasRichText, richTextToPlain } from "@/lib/rich-text";
import { categories } from "@/mocks";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/data/products";
import { ProductGallery } from "@/features/product/product-gallery";
import { productKind } from "@/components/shared/part-visual";
import { BuyBox } from "@/features/product/buy-box";
import { contactSeller } from "@/features/chat/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Part not found" };
  return {
    title: product.title,
    description:
      richTextToPlain(product.description, 160) ||
      `${product.title} — ${conditionLabel(product.condition)} ${product.brandName} part from ${product.seller.name}, ${product.seller.location}.`,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ contact?: string }>;
}) {
  const { slug } = await params;
  const { contact } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.categorySlug);
  const [related, productReviews] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id),
    getProductReviews(product.id),
  ]);

  const avgRating = productReviews.length
    ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
    : 0;

  const specs: [string, string][] = [
    ["Condition", conditionLabel(product.condition)],
    ["Brand", product.brandName],
    ["Category", category?.name ?? "—"],
    ["OEM Part Number", product.oemNumbers.join(", ")],
    ["Seller Location", product.seller.location],
    ["Stock", `${product.stock} available`],
  ];

  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Shop Parts", href: "/parts" },
          ...(category
            ? [{ label: category.name, href: `/parts?category=${category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} kind={productKind(product)} />
        </div>

        {/* Summary + buy box */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ConditionBadge condition={product.isNew ? "new" : product.condition} />
              <span className="text-xs font-medium text-muted-foreground">
                {product.brandName}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.title}
            </h1>
            {product.fitment[0] && (
              <p className="mt-1 text-muted-foreground">
                Fits {product.fitment[0].brand} {product.fitment[0].model} (
                {product.fitment[0].yearFrom}–{product.fitment[0].yearTo})
              </p>
            )}
            {productReviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={Number(avgRating.toFixed(1))} count={productReviews.length} />
              </div>
            )}
          </div>

          <BuyBox product={product} />

          {/* Seller card */}
          <Link
            href={`/sellers/${product.seller.slug}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-neutral-300"
          >
            <span className="grid size-11 place-items-center rounded-full bg-ink text-sm font-black text-white">
              {product.seller.logo}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                {product.seller.name}
                <BadgeCheck className="size-4 text-brand" />
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {product.seller.rating.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" /> {product.seller.location}
                </span>
              </p>
            </div>
            <span className="text-sm font-semibold text-brand">Visit store</span>
          </Link>

          {/* Contact seller */}
          <form action={contactSeller}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-sm font-semibold text-foreground transition-colors hover:border-neutral-300 hover:bg-muted"
            >
              <MessageSquare className="size-4 text-brand" />
              Message seller about this part
            </button>
          </form>
          {contact === "unavailable" && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
              Messaging isn&rsquo;t available for this demo listing.
            </p>
          )}
          {contact === "error" && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              Something went wrong starting that conversation. Please try again.
            </p>
          )}
        </div>
      </div>

      {/* Seller's description — sanitised HTML from the listing form */}
      {hasRichText(product.description) && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">Description</h2>
          <div
            className="prose-description max-w-3xl text-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{ __html: product.description! }}
          />
        </section>
      )}

      {/* Specs + fitment */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Specifications</h2>
          <dl className="overflow-hidden rounded-2xl border border-border">
            {specs.map(([k, v], i) => (
              <div
                key={k}
                className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${i % 2 ? "bg-neutral-50" : "bg-card"}`}
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Compatibility</h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-3 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Make</span>
              <span>Model</span>
              <span>Years</span>
            </div>
            {product.fitment.map((f, i) => (
              <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm text-foreground">
                <span>{f.brand}</span>
                <span className={f.model ? "" : "text-muted-foreground"}>{f.model || "All models"}</span>
                <span className={f.yearFrom && f.yearTo ? "" : "text-muted-foreground"}>
                  {f.yearFrom && f.yearTo
                    ? f.yearFrom === f.yearTo ? f.yearFrom : `${f.yearFrom}–${f.yearTo}`
                    : "All years"}
                </span>
              </div>
            ))}
            {product.fitment.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No compatibility details supplied — check with the seller.
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Always confirm the OEM part number against your vehicle before purchase.
          </p>
        </section>
      </div>

      {/* Reviews */}
      {productReviews.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Reviews ({productReviews.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {productReviews.map((r) => (
              <article key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <StarRating rating={r.rating} size={13} />
                <h3 className="mt-2 font-semibold text-foreground">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-3 text-xs font-medium text-foreground">— {r.author}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading title="Related parts" href="/parts" />
          <ProductGrid products={related} />
        </section>
      )}
    </Container>
  );
}
