"use client";

import { useState } from "react";
import { Pencil, QrCode, Search } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { LabelDialog } from "@/features/dashboard/product-label";
import { NewListingDialog } from "@/features/dashboard/new-listing-dialog";
import { sellerListings as seed } from "@/mocks/dashboard";
import type { SellerListing } from "@/types";

export default function SellerListingsPage() {
  const [listings, setListings] = useState<SellerListing[]>(seed);
  const [labelFor, setLabelFor] = useState<SellerListing | null>(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.sku.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeading title="Listings" description="Manage your products, stock and inventory labels.">
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          + New Listing
        </button>
      </PageHeading>

      <SectionCard>
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or SKU…"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
          <span className="shrink-0 text-xs text-muted-foreground">{filtered.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Sold</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => {
                const meta = LISTING_STATUS_META[l.status];
                return (
                  <tr key={l.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.sku}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatZAR(l.priceCents)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.stock}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.views}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.sold}</td>
                    <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setLabelFor(l)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <QrCode className="size-3.5" /> Label
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          <Pencil className="size-3.5" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {labelFor && <LabelDialog listing={labelFor} onClose={() => setLabelFor(null)} />}
      {adding && (
        <NewListingDialog
          onClose={() => setAdding(false)}
          onCreate={(l) => {
            setListings((prev) => [l, ...prev]);
            setAdding(false);
            setLabelFor(l); // show the auto-generated label for the new listing
          }}
        />
      )}
    </>
  );
}
