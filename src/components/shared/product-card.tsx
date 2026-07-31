import Link from "next/link";
import { Heart, MapPin, ScanLine } from "lucide-react";
import type { Product } from "@/types";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductVisual, productKind } from "./part-visual";
import { ConditionBadge } from "./condition-badge";

/** Full product card used in the Featured Products grid (Section 04). */
export function ProductCard({ product }: { product: Product }) {
  const fitment = product.fitment[0];
  const fitmentLabel = fitment
    ? `${fitment.brand} ${fitment.model} (${fitment.yearFrom}-${fitment.yearTo})`
    : product.brandName;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)]">
      <div className="relative aspect-square p-2">
        <Link href={`/parts/${product.slug}`} aria-label={product.title}>
          <ProductVisual
            image={product.images[0]}
            kind={productKind(product)}
            alt={product.images[0]?.alt ?? product.title}
            className="size-full rounded-xl"
          />
        </Link>
        <div className="absolute left-4 top-4 flex gap-2">
          {product.isNew ? (
            <ConditionBadge condition="new" />
          ) : (
            <ConditionBadge condition={product.condition} />
          )}
        </div>
        <button
          type="button"
          aria-label="Save to wishlist"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-white/90 text-neutral-600 shadow-sm backdrop-blur transition-all hover:text-brand hover:scale-110 active:scale-95"
        >
          <Heart className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-2">
        <h3 className="line-clamp-1 font-semibold text-foreground">
          <Link href={`/parts/${product.slug}`} className="hover:text-brand">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{fitmentLabel}</p>

        <p className="mt-3 text-lg font-bold text-foreground">
          {formatZAR(product.priceCents)}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">
              {product.seller.logo}
            </span>
            <span className="truncate text-xs font-medium text-foreground">
              {product.seller.name}
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className={cn("size-3")} />
              {product.seller.location}
            </span>
            <ScanLine className="size-3.5 text-muted-foreground/60" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
