"use client";

import { useState } from "react";
import { ProductVisual, type PartKind } from "@/components/shared/part-visual";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

/** Main image + thumbnail rail. Shows the seller's uploaded photos, falling back to an illustration when none exist. */
export function ProductGallery({
  images,
  title,
  kind,
}: {
  images: ProductImage[];
  title: string;
  kind: PartKind;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={cn(
                "overflow-hidden rounded-lg border-2 transition-colors",
                active === i ? "border-brand" : "border-transparent hover:border-input",
              )}
            >
              <ProductVisual image={img} kind={kind} alt="" className="size-16" />
            </button>
          ))}
        </div>
      )}
      <ProductVisual
        image={images[active]}
        kind={kind}
        alt={images[active]?.alt ?? title}
        className="aspect-square flex-1 rounded-2xl border border-border"
      />
    </div>
  );
}
