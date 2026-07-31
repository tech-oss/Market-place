import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, MapPin, Star } from "lucide-react";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { getProductById } from "@/lib/data/products";
import { formatZAR, conditionLabel } from "@/lib/format";
import type { ListingStatus, ProductCondition } from "@/types";

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const status = (product.status ?? "active") as ListingStatus;
  const meta = LISTING_STATUS_META[status] ?? { label: product.status ?? "—", tone: "gray" as const };
  const photos = product.images.filter((img) => img.url);

  const specs: [string, string][] = [
    ["Condition", conditionLabel(product.condition as ProductCondition)],
    ["Brand", product.brandName],
    ["Category", product.categorySlug],
    ["OEM Part Number", product.oemNumbers.join(", ") || "—"],
    ["Stock", `${product.stock} available`],
    ["Price", formatZAR(product.priceCents)],
    ...(product.compareAtCents ? [["Compare-at price", formatZAR(product.compareAtCents)] as [string, string]] : []),
    ["Shipping (nationwide)", product.shippingCents != null ? formatZAR(product.shippingCents) : "—"],
    ["Shipping (local)", product.shippingLocalCents != null ? formatZAR(product.shippingLocalCents) : "—"],
    ["Listed", new Date(product.listedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })],
  ];

  return (
    <>
      <PageHeading
        title={product.title}
        description={`${product.brandName} · Listed by ${product.seller.name}`}
      >
        <Link
          href="/admin/listings"
          className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
        >
          <ArrowLeft className="size-3.5" /> Back to listings
        </Link>
        {status === "active" && (
          <a
            href={`/parts/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90"
          >
            View live
          </a>
        )}
      </PageHeading>

      <div className="mb-6 flex items-center gap-2">
        <StatusPill label={meta.label} tone={meta.tone} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Photos — real images uploaded by the seller */}
          <SectionCard title="Photos">
            {photos.length === 0 ? (
              <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
                <ImageOff className="size-4" /> No photos were uploaded for this listing.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {photos.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt || product.title}
                    className="aspect-square w-full rounded-xl border border-border object-cover"
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Specifications */}
          <SectionCard title="Specifications">
            <dl className="divide-y divide-border">
              {specs.map(([k, v], i) => (
                <div
                  key={k}
                  className={`grid grid-cols-2 gap-4 px-5 py-3 text-sm ${i % 2 ? "bg-neutral-50" : ""}`}
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          {/* Compatibility */}
          <SectionCard title="Compatibility">
            {product.fitment.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No fitment data was added for this listing.</p>
            ) : (
              <div>
                <div className="grid grid-cols-3 bg-neutral-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Make</span>
                  <span>Model</span>
                  <span>Years</span>
                </div>
                {product.fitment.map((f, i) => (
                  <div key={i} className="grid grid-cols-3 px-5 py-3 text-sm text-foreground">
                    <span>{f.brand}</span>
                    <span>{f.model}</span>
                    <span>{f.yearFrom}–{f.yearTo}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Seller */}
        <div className="space-y-6">
          <SectionCard title="Seller">
            <div className="flex items-center gap-3 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-black text-white">
                {product.seller.logo}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{product.seller.name}</p>
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
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
