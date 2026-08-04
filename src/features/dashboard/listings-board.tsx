"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, QrCode, Search } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { LISTING_STATUS_META } from "@/features/dashboard/status";
import { LabelDialog } from "@/features/dashboard/product-label";
import { NewListingDialog } from "@/features/dashboard/new-listing-dialog";
import { EditListingDialog } from "@/features/dashboard/edit-listing-dialog";
import { createListing, updateListing } from "@/features/dashboard/actions";
import type { SellerListing } from "@/types";
import type { BikeMake, BikeModel, CatalogCategory } from "@/lib/data/products";

export function ListingsBoard({
  initial,
  live,
  bikeMakes,
  bikeModels,
  categories,
}: {
  initial: SellerListing[];
  live: boolean;
  bikeMakes: BikeMake[];
  bikeModels: BikeModel[];
  categories: CatalogCategory[];
}) {
  const router = useRouter();
  const [listings, setListings] = useState<SellerListing[]>(initial);
  const [labelFor, setLabelFor] = useState<SellerListing | null>(null);
  const [editing, setEditing] = useState<SellerListing | null>(null);
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Keep local state in sync after router.refresh() re-fetches `initial`
  // from the server (e.g. after creating or editing a listing).
  useEffect(() => {
    setListings(initial);
  }, [initial]);

  const filtered = listings.filter((l) => {
    const q = query.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.sku.toLowerCase().includes(q) ||
      l.itemNumber.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          + New Listing
        </button>
      </div>

      <SectionCard>
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item #, title or SKU/barcode…"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
          <span className="shrink-0 text-xs text-muted-foreground">{filtered.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Item #</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Views</th>
                <th className="px-5 py-3 font-medium">Sold</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">{listings.length === 0 ? "No listings yet — add your first part." : "No listings match your search."}</td></tr>
              )}
              {filtered.map((l) => {
                const meta = LISTING_STATUS_META[l.status];
                return (
                  <tr key={l.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.sku}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.itemNumber}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatZAR(l.priceCents)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.stock}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.views}</td>
                    <td className="px-5 py-3 text-muted-foreground">{l.sold}</td>
                    <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setLabelFor(l)} className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                          <QrCode className="size-3.5" /> Label
                        </button>
                        <button
                          onClick={() => setEditing(l)}
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
      {editing && (
        <EditListingDialog
          listing={editing}
          categories={categories}
          bikeMakes={bikeMakes}
          bikeModels={bikeModels}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            setEditing(null);
            if (live && !saving) {
              setSaving(true);
              const res = await updateListing(input);
              setSaving(false);
              if (res.ok && !res.fellBack) {
                router.refresh();
                return;
              }
            }
            setListings((prev) =>
              prev.map((l) =>
                l.id === input.id
                  ? {
                      ...l,
                      title: input.title,
                      categorySlug: input.categorySlug,
                      condition: input.condition as SellerListing["condition"],
                      priceCents: input.priceCents,
                      stock: input.stock,
                      sku: input.sku || l.sku,
                      shippingCents: input.shippingCents,
                      shippingLocalCents: input.shippingLocalCents,
                      status: input.newYmm ? "pending-review" : l.status,
                      brandName: input.newYmm?.makeName ?? input.brand ?? l.brandName,
                      images: input.imageUrls ? input.imageUrls.map((url, i) => ({ id: `${l.id}-${i}`, url, alt: input.title })) : l.images,
                      fitment: input.newYmm
                        ? { brand: input.newYmm.makeName, model: input.newYmm.modelName, yearFrom: input.newYmm.yearFrom, yearTo: input.newYmm.yearTo }
                        : input.brand && input.model && input.yearFrom && input.yearTo
                          ? { brand: input.brand, model: input.model, yearFrom: input.yearFrom, yearTo: input.yearTo }
                          : l.fitment,
                    }
                  : l,
              ),
            );
          }}
        />
      )}
      {adding && (
        <NewListingDialog
          bikeMakes={bikeMakes}
          bikeModels={bikeModels}
          categories={categories}
          onClose={() => setAdding(false)}
          onCreate={async (listing, input) => {
            setAdding(false);
            setLabelFor(listing); // show label immediately
            if (live && !saving) {
              setSaving(true);
              const res = await createListing(input);
              setSaving(false);
              if (res.ok && !res.fellBack) {
                router.refresh(); // pull the persisted row
                return;
              }
            }
            setListings((prev) => [listing, ...prev]); // optimistic (demo / offline)
          }}
        />
      )}
    </>
  );
}
