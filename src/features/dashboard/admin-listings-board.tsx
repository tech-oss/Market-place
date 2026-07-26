"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatZAR } from "@/lib/format";
import { conditionLabel } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { removeListing } from "@/features/dashboard/actions";
import type { AdminListingView } from "@/lib/data/dashboard";
import type { ListingStatus, ProductCondition } from "@/types";

export function AdminListingsBoard({ initial, live }: { initial: AdminListingView[]; live: boolean }) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const remove = async (id: string) => {
    setRemovingId(id);
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "draft" } : l)));
    if (live) {
      const res = await removeListing(id);
      if (res.ok && !res.fellBack) router.refresh();
    }
    setRemovingId(null);
  };

  return (
    <SectionCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Seller</th>
              <th className="px-5 py-3 font-medium">Condition</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No listings yet.</td></tr>
            )}
            {listings.map((p) => {
              const meta = LISTING_STATUS_META[p.status as ListingStatus] ?? { label: p.status, tone: "gray" as const };
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brandName}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.sellerName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{conditionLabel(p.condition as ProductCondition)}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(p.priceCents)}</td>
                  <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
                  <td className="px-5 py-3 text-right">
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
