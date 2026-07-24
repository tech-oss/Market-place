import { cn } from "@/lib/utils";

const RED = "#E30613";
const INK = "#111111";
const STEEL = "#6D6E71";

/**
 * MP monogram from the brand guide: interlocked "M" (ink) + "P" (red) with a
 * gear / connecting-rod motif. Brand colours are baked into the artwork so the
 * mark is correct regardless of the surrounding theme.
 */
export function MpMark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const mColor = inverted ? "#FFFFFF" : INK;
  const holeColor = inverted ? INK : "#FFFFFF";
  const steel = inverted ? "#B9BABD" : STEEL;
  const font = "var(--font-condensed), 'Arial Narrow', 'Oswald', sans-serif";

  return (
    <svg
      viewBox="0 0 120 92"
      className={cn("h-9 w-auto", className)}
      role="img"
      aria-label="Motorcycle Products"
      fill="none"
    >
      {/* gear + connecting rod, behind the letters */}
      <g>
        <g fill={steel}>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="56"
              y="45"
              width="8"
              height="9"
              rx="1.5"
              transform={`rotate(${i * 45} 60 65)`}
            />
          ))}
        </g>
        <circle cx="60" cy="65" r="14" fill={steel} />
        <circle cx="60" cy="65" r="6" fill={holeColor} />
        {/* connecting rod / piston reaching up into the junction */}
        <rect x="56.5" y="34" width="7" height="26" fill={steel} />
        <circle cx="60" cy="33" r="7.5" fill={steel} />
        <circle cx="60" cy="33" r="3.2" fill={holeColor} />
      </g>

      {/* letters — typography via style so the CSS font variable resolves */}
      <text
        x="0" y="71" fill={mColor}
        style={{ fontFamily: font, fontWeight: 700, fontStyle: "italic", fontSize: "82px" }}
      >
        M
      </text>
      <text
        x="50" y="71" fill={RED}
        style={{ fontFamily: font, fontWeight: 700, fontStyle: "italic", fontSize: "82px" }}
      >
        P
      </text>
    </svg>
  );
}
