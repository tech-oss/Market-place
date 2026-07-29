import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

/**
 * Persistent warning shown across the seller dashboard whenever the seller
 * still has outstanding verification documents. "Click here" deep-links to the
 * document upload step on the profile page.
 */
export function DocWarningBanner({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Your account isn&rsquo;t verified yet
          </p>
          <p className="text-sm text-amber-800">
            Upload your {missing.join(", ")} to get approved. Your listings only go live once
            an admin reviews your documents.
          </p>
        </div>
      </div>
      <Link
        href="/seller/profile#verification"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Click here to upload <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
