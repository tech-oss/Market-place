import Link from "next/link";
import { cn } from "@/lib/utils";
import { MpMark } from "./logo-mark";

const RED = "#E30613";

/** Horizontal brand lockup: MP monogram + wordmark. */
export function Logo({
  className,
  inverted = false,
  showWordmark = true,
}: {
  className?: string;
  inverted?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <Link href="/" aria-label="Motorcycle Products" className={cn("flex items-center gap-2.5", className)}>
      <MpMark inverted={inverted} className="h-9 w-auto" />

      {showWordmark && (
        <>
          <span className={cn("h-8 w-px", inverted ? "bg-white/25" : "bg-black/15")} />
          <span
            className="flex flex-col leading-[0.92]"
            style={{ fontFamily: "var(--font-condensed), 'Arial Narrow', sans-serif" }}
          >
            <span
              className="text-[15px] font-bold uppercase tracking-tight"
              style={{ color: inverted ? "#FFFFFF" : "#111111" }}
            >
              Motorcycle
            </span>
            <span
              className="text-[15px] font-bold uppercase tracking-[0.18em]"
              style={{ color: RED }}
            >
              Products
            </span>
            <span
              className={cn(
                "mt-0.5 text-[7px] font-semibold uppercase tracking-[0.22em]",
                inverted ? "text-white/50" : "text-muted-foreground",
              )}
            >
              Parts that keep you moving
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
