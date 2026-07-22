import Link from "next/link";
import type { Product } from "@/types";
import { conditionLabel, formatZAR, timeAgo } from "@/lib/format";
import { PartVisual, productKind } from "./part-visual";

/** Slim card used in the Recently Added strip (Section 05). */
export function CompactProductCard({ product }: { product: Product }) {
  const fitment = product.fitment[0];
  return (
    <Link
      href={`/parts/${product.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
    >
      <PartVisual
        kind={productKind(product)}
        alt={product.images[0]?.alt ?? product.title}
        className="mb-3 aspect-[4/3] w-full rounded-lg"
      />
      <span
        className="text-[11px] text-muted-foreground"
        suppressHydrationWarning
      >
        {timeAgo(product.listedAt)}
      </span>
      <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground group-hover:text-brand">
        {product.title}
      </h3>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {fitment ? `${fitment.brand} ${fitment.model}` : product.brandName}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold text-foreground">{formatZAR(product.priceCents)}</span>
        <span className="text-[11px] text-muted-foreground">
          {conditionLabel(product.condition)}
        </span>
      </div>
    </Link>
  );
}
