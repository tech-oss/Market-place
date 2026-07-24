"use client";

import { useState } from "react";
import { ImagePlus, QrCode, X } from "lucide-react";
import { categories, conditionOptions } from "@/mocks";
import type { ProductCondition, SellerListing } from "@/types";

export interface ListingInput {
  title: string;
  categorySlug: string;
  condition: ProductCondition;
  priceCents: number;
  stock: number;
  oem?: string;
  bin?: string;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
}

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function NewListingDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (listing: SellerListing, input: ListingInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [condition, setCondition] = useState<ProductCondition>("used");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [oem, setOem] = useState("");
  const [bin, setBin] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [years, setYears] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [yf, yt] = years.split(/[–-]/).map((y) => parseInt(y.trim(), 10));
    const input: ListingInput = {
      title: title.trim() || "Untitled part",
      categorySlug,
      condition,
      priceCents: Math.round(Number(price || 0) * 100),
      stock: Number(stock || 0),
      oem: oem || undefined,
      bin: bin || undefined,
      brand: brand || undefined,
      model: model || undefined,
      yearFrom: Number.isFinite(yf) ? yf : undefined,
      yearTo: Number.isFinite(yt) ? yt : undefined,
    };
    const listing: SellerListing = {
      id: `l-${Date.now()}`,
      title: input.title,
      slug: slug || `l-${Date.now()}`,
      sku: `MP-${categorySlug.slice(0, 3).toUpperCase()}-${seq}`,
      categorySlug,
      priceCents: input.priceCents,
      stock: input.stock,
      status: "pending-review",
      views: 0,
      sold: 0,
      condition,
      createdAt: new Date().toISOString(),
    };
    onCreate(listing, input);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} className="relative z-10 my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">New Listing</h3>
            <p className="text-sm text-muted-foreground">
              A printable barcode label is generated automatically on save.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div>
          <label className={labelCls}>Photos & video</label>
          <div className="grid grid-cols-4 gap-3">
            <button type="button" className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input text-muted-foreground hover:border-brand hover:text-brand">
              <ImagePlus className="size-5" />
              <span className="text-[10px]">Upload</span>
            </button>
            {[0, 1, 2].map((i) => <div key={i} className="aspect-square rounded-xl bg-neutral-100" />)}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. OEM Brake Lever" className={field} />
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
            <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2100" className={field} />
          </div>
          <div>
            <label className={labelCls}>Stock quantity</label>
            <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelCls}>OEM part number</label>
            <input value={oem} onChange={(e) => setOem(e.target.value)} placeholder="32-72-8-544-207" className={field} />
          </div>
          <div>
            <label className={labelCls}>Inventory location / bin</label>
            <input value={bin} onChange={(e) => setBin(e.target.value)} placeholder="Aisle A-12" className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Compatibility (make / model / years)</label>
            <div className="grid grid-cols-3 gap-3">
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="BMW" className={field} />
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="S1000RR" className={field} />
              <input value={years} onChange={(e) => setYears(e.target.value)} placeholder="2019–2023" className={field} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <QrCode className="size-4 text-brand" /> Label auto-generated on save
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
            <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">Save & generate label</button>
          </div>
        </div>
      </form>
    </div>
  );
}
