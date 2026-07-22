import Link from "next/link";
import { cn } from "@/lib/utils";

/** MP monogram + wordmark used in the header and footer. */
export function Logo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-md bg-brand text-sm font-black tracking-tight text-brand-foreground">
        MP
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-sm font-black tracking-tight",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          MOTORCYCLE
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold tracking-[0.28em]",
            inverted ? "text-white/60" : "text-muted-foreground",
          )}
        >
          PRODUCTS
        </span>
      </span>
    </Link>
  );
}
