import { cn } from "@/lib/utils";
import { conditionLabel } from "@/lib/format";
import type { ProductCondition } from "@/types";

const STYLES: Record<ProductCondition, string> = {
  new: "bg-brand text-brand-foreground",
  "like-new": "bg-neutral-900 text-white",
  "excellent-used": "bg-neutral-900 text-white",
  "good-used": "bg-neutral-900 text-white",
  used: "bg-neutral-900 text-white",
  "for-parts": "bg-neutral-500 text-white",
};

export function ConditionBadge({
  condition,
  className,
}: {
  condition: ProductCondition;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
        STYLES[condition],
        className,
      )}
    >
      {conditionLabel(condition)}
    </span>
  );
}
