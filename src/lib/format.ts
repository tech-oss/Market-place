import type { ProductCondition } from "@/types";

/** Format cents (ZAR) as e.g. "R2,100" (comma grouping to match brand style). */
export function formatZAR(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** Comma-grouped integer, e.g. 13480 -> "13,480". */
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

/** Compact relative time, e.g. "12 mins ago", "2 hours ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) {
      const label = unit === "minute" ? "min" : unit;
      return `${value} ${label}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "New",
  "like-new": "Like New",
  "excellent-used": "Excellent Used",
  "good-used": "Good Used",
  used: "Used",
  "for-parts": "For Parts",
};

export function conditionLabel(condition: ProductCondition): string {
  return CONDITION_LABELS[condition];
}
