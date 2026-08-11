import { cn } from "@/lib/utils";
import type { Product, ProductImage } from "@/types";

/**
 * Premium SVG part illustrations used as listing imagery in the mock phase.
 * Each illustration is relevant to the part type (brake disc, exhaust, etc.).
 * In Step 3 these are swapped for seller-uploaded photos from Supabase Storage
 * — the card contract (className/aspect) stays identical.
 */

export type PartKind =
  | "brakes"
  | "engine"
  | "exhaust"
  | "suspension"
  | "bodywork"
  | "electronics"
  | "lighting"
  | "tyres"
  | "controls"
  | "accessories"
  | "default";

/** Map a category slug to an illustration kind. */
export function categoryKind(slug: string): PartKind {
  const known: PartKind[] = [
    "brakes", "engine", "exhaust", "suspension", "bodywork",
    "electronics", "lighting", "tyres", "controls", "accessories",
  ];
  return (known as string[]).includes(slug) ? (slug as PartKind) : "default";
}

/** Refine the illustration using the product title, then fall back to category. */
export function productKind(product: Pick<Product, "title" | "categorySlug">): PartKind {
  const t = product.title.toLowerCase();
  if (/(brake|caliper|rotor|disc|pad|lever)/.test(t)) return "brakes";
  if (/(exhaust|slip-on|muffler|pipe)/.test(t)) return "exhaust";
  if (/(head\s?light|tail\s?light|indicator|led|lamp)/.test(t)) return "lighting";
  if (/(shock|fork|suspension|spring)/.test(t)) return "suspension";
  if (/(battery|fuse|ecu|regulator|electronic)/.test(t)) return "electronics";
  if (/(tyre|tire|wheel|rim)/.test(t)) return "tyres";
  if (/(fairing|windscreen|screen|panel|bodywork|seat)/.test(t)) return "bodywork";
  if (/(grip|rearset|footpeg|control|throttle)/.test(t)) return "controls";
  if (/(engine|piston|clutch|radiator|fan|sprocket|chain|fuel pump|gasket)/.test(t)) return "engine";
  return categoryKind(product.categorySlug);
}

/* --------------------------------------------------------------------------
 * Illustrations — stroke-based line art on a 120×120 canvas.
 * ------------------------------------------------------------------------ */
const ART: Record<PartKind, React.ReactNode> = {
  brakes: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="54" cy="60" r="34" strokeWidth="3" />
      <circle cx="54" cy="60" r="13" strokeWidth="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = 23;
        const x = 54 + r * Math.cos((a * Math.PI) / 180);
        const y = 60 + r * Math.sin((a * Math.PI) / 180);
        return <circle key={a} cx={x} cy={y} r="2.4" strokeWidth="2" />;
      })}
      <path d="M82 46h14a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H82" strokeWidth="3" stroke="var(--brand)" />
    </g>
  ),
  engine: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="30" y="52" width="52" height="40" rx="6" strokeWidth="3" />
      <path d="M38 52V40h14v12M60 52V44h16v8" strokeWidth="3" />
      <path d="M84 62h10M84 72h10M84 82h10" strokeWidth="3" />
      <path d="M45 34v6" strokeWidth="3" stroke="var(--brand)" />
      <path d="M36 64h40M36 72h40M36 80h40" strokeWidth="2" opacity="0.6" />
    </g>
  ),
  exhaust: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="34" y="48" width="60" height="30" rx="15" strokeWidth="3" transform="rotate(-12 64 63)" />
      <path d="M28 74c-6 2-10 4-12 8" strokeWidth="3" />
      <path d="M92 50l8-4" strokeWidth="3" stroke="var(--brand)" />
      <ellipse cx="90" cy="58" rx="4" ry="9" strokeWidth="3" transform="rotate(-12 90 58)" />
    </g>
  ),
  suspension: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="26" r="7" strokeWidth="3" />
      <circle cx="60" cy="96" r="7" strokeWidth="3" />
      <path d="M60 33v10" strokeWidth="3" />
      <path
        d="M50 45c20-6 20 6 0 0 20-6 20 6 0 0 20-6 20 6 0 0 20-6 20 6 0 0"
        strokeWidth="3"
        stroke="var(--brand)"
      />
      <path d="M52 46h16M52 54h16M52 62h16M52 70h16M52 78h16" strokeWidth="3" />
      <rect x="49" y="43" width="22" height="44" rx="4" strokeWidth="3" />
    </g>
  ),
  bodywork: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 44c26-10 44-6 60 8 6 6 4 26-8 32-18 8-40 6-52-6-8-8-6-28 0-34z" strokeWidth="3" />
      <path d="M44 52c14-4 26-2 36 6" strokeWidth="2.5" opacity="0.6" />
      <path d="M40 72l24 6" strokeWidth="3" stroke="var(--brand)" />
    </g>
  ),
  electronics: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="34" y="40" width="52" height="44" rx="5" strokeWidth="3" />
      <path d="M46 40v-6h8v6M66 40v-6h8v6" strokeWidth="3" />
      <path d="M52 62h16" strokeWidth="3" />
      <path d="M60 54v16" strokeWidth="3" stroke="var(--brand)" />
      <path d="M78 54l6-8-3 6h5l-6 8" strokeWidth="2.5" stroke="var(--brand)" />
    </g>
  ),
  lighting: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="58" cy="60" r="32" strokeWidth="3" />
      <circle cx="58" cy="60" r="20" strokeWidth="3" />
      <path d="M50 52a12 12 0 0 1 8-4" strokeWidth="3" stroke="var(--brand)" />
      <path d="M94 50l8-4M96 60h9M94 70l8 4" strokeWidth="3" opacity="0.7" />
    </g>
  ),
  tyres: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="60" r="34" strokeWidth="3" />
      <circle cx="60" cy="60" r="20" strokeWidth="3" />
      <circle cx="60" cy="60" r="7" strokeWidth="3" stroke="var(--brand)" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
        const x1 = 60 + 34 * Math.cos((a * Math.PI) / 180);
        const y1 = 60 + 34 * Math.sin((a * Math.PI) / 180);
        const x2 = 60 + 27 * Math.cos((a * Math.PI) / 180);
        const y2 = 60 + 27 * Math.sin((a * Math.PI) / 180);
        return <path key={a} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth="2.5" />;
      })}
    </g>
  ),
  controls: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="30" y="54" width="34" height="14" rx="7" strokeWidth="3" />
      <path d="M64 61h10" strokeWidth="3" />
      <path d="M74 61c14 0 22-8 28-20" strokeWidth="3" stroke="var(--brand)" />
      <path d="M34 58h24" strokeWidth="2.5" opacity="0.5" />
    </g>
  ),
  accessories: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="60" r="16" strokeWidth="3" />
      <circle cx="60" cy="60" r="6" strokeWidth="3" stroke="var(--brand)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const x1 = 60 + 16 * Math.cos((a * Math.PI) / 180);
        const y1 = 60 + 16 * Math.sin((a * Math.PI) / 180);
        const x2 = 60 + 24 * Math.cos((a * Math.PI) / 180);
        const y2 = 60 + 24 * Math.sin((a * Math.PI) / 180);
        return <path key={a} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth="5" />;
      })}
    </g>
  ),
  default: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="60" cy="60" r="18" strokeWidth="3" />
      <circle cx="60" cy="60" r="7" strokeWidth="3" stroke="var(--brand)" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const x1 = 60 + 18 * Math.cos((a * Math.PI) / 180);
        const y1 = 60 + 18 * Math.sin((a * Math.PI) / 180);
        const x2 = 60 + 27 * Math.cos((a * Math.PI) / 180);
        const y2 = 60 + 27 * Math.sin((a * Math.PI) / 180);
        return <path key={a} d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth="5" />;
      })}
    </g>
  ),
};

interface PartVisualProps {
  kind: PartKind;
  alt: string;
  className?: string;
  dark?: boolean;
}

export function PartVisual({ kind, alt, className, dark = false }: PartVisualProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        dark
          ? "bg-[radial-gradient(circle_at_50%_35%,#2a2a2e,#0c0c0e)] text-white/85"
          : "bg-[radial-gradient(circle_at_50%_30%,#ffffff,#e9eaee)] text-neutral-700",
        className,
      )}
    >
      <svg viewBox="0 0 120 120" className="h-3/5 w-3/5 drop-shadow-sm">
        {ART[kind]}
      </svg>
      {/* soft ground shadow for a product-shot feel */}
      <span
        className={cn(
          "pointer-events-none absolute bottom-[14%] left-1/2 h-2 w-1/2 -translate-x-1/2 rounded-[50%] blur-md",
          dark ? "bg-black/50" : "bg-black/10",
        )}
      />
    </div>
  );
}

/**
 * Renders the seller's uploaded photo when one exists, falling back to the
 * illustration for listings without real images. Same className/aspect
 * contract as PartVisual so it's a drop-in replacement everywhere.
 */
export function ProductVisual({
  image,
  kind,
  alt,
  className,
  dark = false,
}: {
  image?: ProductImage;
  kind: PartKind;
  alt: string;
  className?: string;
  dark?: boolean;
}) {
  if (image?.url) {
    // The wrapping element owns the fixed box (aspect ratio / size classes from
    // `className`); the img is absolutely positioned inside it so an oddly-shaped
    // source photo (portrait, ultra-wide, huge) can never inflate that box — it just
    // gets cropped via object-cover, keeping every card the same size regardless of
    // what the seller uploaded.
    return (
      <span className={cn("relative block overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={alt} className="absolute inset-0 size-full object-cover" />
      </span>
    );
  }
  return <PartVisual kind={kind} alt={alt} className={className} dark={dark} />;
}
