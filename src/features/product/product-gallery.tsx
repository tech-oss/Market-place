"use client";

import { useState } from "react";
import { PartVisual, type PartKind } from "@/components/shared/part-visual";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

/** Main image + thumbnail rail. Uses placeholders until Step 3 (Supabase Storage). */
export function ProductGallery({
  images,
  title,
  kind,
}: {
  images: ProductImage[];
  title: string;
  kind: PartKind;
}) {
  // Demo gallery: a single illustration shown across 4 thumbnail slots.
  const views = images.length ? [0, 1, 2, 3] : [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {views.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View ${i + 1}`}
            className={cn(
              "overflow-hidden rounded-lg border-2 transition-colors",
              active === i ? "border-brand" : "border-transparent hover:border-input",
            )}
          >
            <PartVisual kind={kind} alt="" className="size-16" />
          </button>
        ))}
      </div>
      <PartVisual
        kind={kind}
        alt={images[active]?.alt ?? title}
        className="aspect-square flex-1 rounded-2xl border border-border"
      />
    </div>
  );
}
