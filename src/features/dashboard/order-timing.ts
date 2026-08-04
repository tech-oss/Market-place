/**
 * Timing helpers for the manual payment-release workflow.
 *
 * Funds stay with the platform after a buyer confirms delivery. The admin
 * releases them by hand, typically once the return window has elapsed —
 * these helpers work out when an order has been sitting long enough to need
 * that decision.
 */

const DAY_MS = 86_400_000;

/** Whole days since an ISO timestamp, or null when there isn't one. */
export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / DAY_MS);
}

/** True when a confirmed order has sat past the review window and needs a release decision. */
export function isReleaseOverdue(confirmedAt: string | undefined | null, windowDays: number): boolean {
  const days = daysSince(confirmedAt);
  return days !== null && days >= windowDays;
}
