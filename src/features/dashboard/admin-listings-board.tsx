"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { conditionLabel } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { OrderThumb } from "@/components/shared/order-thumb";
import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { removeListing } from "@/features/dashboard/actions";
import type { AdminListingView } from "@/lib/data/dashboard";
import type { ListingStatus, ProductCondition } from "@/types";

export function AdminListingsBoard({ initial, live }: { initial: AdminListingView[]; live: boolean }) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const remove = async (id: string) => {
    setRemovingId(id);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "draft" } : l)));
    if (live) {
      const res = await removeListing(id);
      if (res.ok && !res.fellBack) router.refresh();
    }
    setRemovingId(null);
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? listings.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.itemNumber.toLowerCase().includes(q) ||
          l.sku.toLowerCase().includes(q) ||
          l.brandName.toLowerCase().includes(q) ||
          l.sellerName.toLowerCase().includes(q),
      )
    : listings;

  return (
    <SectionCard>
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by item #, product name, SKU/barcode, brand or seller…"
          className="w-full bg-transparent text-sm focus:outline-none"
        />
        <span className="shrink-0 text-xs text-muted-foreground">{filtered.length} items</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Item #</th>
              <th className="px-5 py-3 font-medium">Seller</th>
              <th className="px-5 py-3 font-medium">Condition</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">{listings.length === 0 ? "No listings yet." : "No listings match your search."}</td></tr>
            )}
            {filtered.map((p) => {
              const meta = LISTING_STATUS_META[p.status as ListingStatus] ?? { label: p.status, tone: "gray" as const };
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <OrderThumb src={p.imageUrl} alt={p.title} className="size-12" />
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brandName} · {p.sku}</p>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.itemNumber}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.sellerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{conditionLabel(p.condition as ProductCondition)}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(p.priceCents)}</td>
                  <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/listings/${p.id}`}
                        className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        View
                      </Link>
                      {p.slug && p.status === "active" && (
                        <a
                          href={`/parts/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          View live
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
                            <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                        </a>
                      )}
                      {p.status === "draft" ? (
                        <span className="text-xs text-muted-foreground">Removed</span>
                      ) : (
                        <button
                          onClick={() => remove(p.id)}
                          disabled={removingId === p.id}
                          className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
                        >
                          {removingId === p.id ? "Removing…" : "Remove"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
