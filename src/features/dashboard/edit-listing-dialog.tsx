"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { categories, conditionOptions } from "@/mocks";
import type { ProductCondition, SellerListing } from "@/types";
import type { UpdateListingInput } from "@/features/dashboard/actions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function EditListingDialog({
  listing,
  onClose,
  onSave,
}: {
  listing: SellerListing;
  onClose: () => void;
  onSave: (input: UpdateListingInput) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(listing.title);
  const [categorySlug, setCategorySlug] = useState(listing.categorySlug);
  const [condition, setCondition] = useState<ProductCondition>(listing.condition);
  const [price, setPrice] = useState(String(listing.priceCents / 100));
  const [stock, setStock] = useState(String(listing.stock));
  const [sku, setSku] = useState(listing.sku);
  const [shipNational, setShipNational] = useState(
    listing.shippingCents ? String(listing.shippingCents / 100) : "",
  );
  const [shipLocal, setShipLocal] = useState(
    listing.shippingLocalCents ? String(listing.shippingLocalCents / 100) : "",
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: listing.id,
      title: title.trim() || listing.title,
      categorySlug,
      condition,
      priceCents: Math.round(Number(price || 0) * 100),
      stock: Number(stock || 0),
      sku: sku.trim() || listing.sku,
      shippingCents: shipNational ? Math.round(Number(shipNational) * 100) : 0,
      shippingLocalCents: shipLocal ? Math.round(Number(shipLocal) * 100) : undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative z-10 my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Edit Listing</h3>
            <p className="text-sm text-muted-foreground">Update details, price, stock and shipping.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className={field}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as ProductCondition)} className={field}>
              {conditionOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Price (R)</label>
            <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelCls}>Stock quantity</label>
            <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelCls}>SKU / Part No</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} className={field} />
          </div>
          <div />

          <div className="sm:col-span-2 rounded-xl border border-border bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-foreground">Shipping cost</p>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Set your own rate for this part — heavier items (e.g. engines) cost more than a light or panel.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Nationwide (R)</label>
                <input type="number" min="0" value={shipNational} onChange={(e) => setShipNational(e.target.value)} placeholder="150" className={field} />
              </div>
              <div>
                <label className={labelCls}>Local / same province (R) <span className="font-normal text-muted-foreground">— optional</span></label>
                <input type="number" min="0" value={shipLocal} onChange={(e) => setShipLocal(e.target.value)} placeholder="80" className={field} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
