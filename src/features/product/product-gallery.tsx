"use client";

import { useState } from "react";
import { PartImage } from "@/components/shared/part-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

/** Main image + thumbnail rail. Uses placeholders until Step 3 (Supabase Storage). */
export function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  // Demo gallery: derive 4 angles from the single mock image.
  const views = images.length
    ? [images[0], images[0], images[0], images[0]]
    : [];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {views.map((_, i) => (
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
            <PartImage seed={`${title}-${i}`} alt="" className="size-16" />
          </button>
        ))}
      </div>
      <PartImage
        seed={`${title}-${active}`}
        alt={views[active]?.alt ?? title}
        className="aspect-square flex-1 rounded-2xl border border-border"
      />
    </div>
  );
}
