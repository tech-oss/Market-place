import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact product thumbnail for order/listing tables and rows — shows the
 * product's photo when one exists, falling back to the same placeholder
 * icon these rows already used before any image was wired up.
 */
export function OrderThumb({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <span className={cn("relative block shrink-0 overflow-hidden rounded-xl border border-border bg-muted", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="absolute inset-0 size-full object-cover" />
      </span>
    );
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground", className)}>
      <Package className="size-5" />
    </span>
  );
}
