import { cn } from "@/lib/utils";
import { Cog } from "lucide-react";

interface PartImageProps {
  /** Used to deterministically pick a subtle gradient so cards feel varied. */
  seed: string;
  alt: string;
  className?: string;
  dark?: boolean;
}

const LIGHT_GRADIENTS = [
  "from-neutral-100 to-neutral-200",
  "from-stone-100 to-stone-200",
  "from-zinc-100 to-neutral-200",
  "from-neutral-50 to-stone-200",
];

/**
 * Placeholder product visual for the mock phase. In Step 3 this is replaced
 * by <Image> from Supabase Storage — the card contract stays identical.
 */
export function PartImage({ seed, alt, className, dark = false }: PartImageProps) {
  const idx =
    seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % LIGHT_GRADIENTS.length;

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        dark ? "from-neutral-800 to-neutral-950" : LIGHT_GRADIENTS[idx],
        className,
      )}
    >
      <Cog
        className={cn(
          "size-10 opacity-20",
          dark ? "text-white" : "text-neutral-500",
        )}
        strokeWidth={1.25}
      />
    </div>
  );
}
