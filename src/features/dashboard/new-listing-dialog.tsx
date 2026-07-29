"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, QrCode, X } from "lucide-react";
import { categories, conditionOptions } from "@/mocks";
import { createClient } from "@/lib/supabase/client";
import { sanitizeForCode128 } from "@/lib/barcode";
import type { ProductCondition, SellerListing } from "@/types";

export interface ListingInput {
  title: string;
  categorySlug: string;
  condition: ProductCondition;
  priceCents: number;
  stock: number;
  sku?: string;
  oem?: string;
  bin?: string;
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  shippingCents?: number;
  shippingLocalCents?: number;
  imageUrls?: string[];
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
  const [sku, setSku] = useState("");
  const [oem, setOem] = useState("");
  const [bin, setBin] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [years, setYears] = useState("");
  const [shipNational, setShipNational] = useState("");
  const [shipLocal, setShipLocal] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    setUploadError(null);
    const supabase = createClient();
    if (!supabase) {
      setUploadError("Image storage isn't connected.");
      return;
    }
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); setUploadError("Please sign in again."); return; }

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) { setUploadError(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const seq = String(Math.floor(1000 + Math.random() * 9000));
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [yf, yt] = years.split(/[–-]/).map((y) => parseInt(y.trim(), 10));
    const finalSku = sku.trim() || `MP-${categorySlug.slice(0, 3).toUpperCase()}-${seq}`;
    const input: ListingInput = {
      title: title.trim() || "Untitled part",
      categorySlug, condition,
      priceCents: Math.round(Number(price || 0) * 100),
      stock: Number(stock || 0),
      sku: finalSku,
      oem: oem || undefined,
      bin: bin || undefined,
      brand: brand || undefined,
      model: model || undefined,
      yearFrom: Number.isFinite(yf) ? yf : undefined,
      yearTo: Number.isFinite(yt) ? yt : undefined,
      shippingCents: shipNational ? Math.round(Number(shipNational) * 100) : 0,
      shippingLocalCents: shipLocal ? Math.round(Number(shipLocal) * 100) : undefined,
      imageUrls: images,
    };
    const listing: SellerListing = {
      id: `l-${Date.now()}`,
      title: input.title,
      slug: slug || `l-${Date.now()}`,
      sku: finalSku,
      categorySlug,
      priceCents: input.priceCents,
      stock: input.stock,
      status: "awaiting-verification",
      views: 0, sold: 0, condition,
      shippingCents: input.shippingCents,
      shippingLocalCents: input.shippingLocalCents,
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
            <p className="text-sm text-muted-foreground">A printable barcode label is generated automatically on save.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Images */}
        <div>
          <label className={labelCls}>Photos</label>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input text-muted-foreground hover:border-brand hover:text-brand disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              <span className="text-[10px]">{uploading ? "Uploading…" : "Upload"}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
            />
            {images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="aspect-square rounded-xl object-cover" />
            ))}
            {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
            ))}
          </div>
          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
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

          {/* SKU / Part No */}
          <div>
            <label className={labelCls}>SKU / Part No</label>
            <input
              value={sku}
              onChange={(e) => setSku(sanitizeForCode128(e.target.value))}
              placeholder="MP-BRK-0001 (auto if blank)"
              className={field}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Printed as a Code128 barcode — letters, numbers and standard symbols only.
            </p>
          </div>
          <div>
            <label className={labelCls}>OEM part number</label>
            <input value={oem} onChange={(e) => setOem(e.target.value)} placeholder="32-72-8-544-207" className={field} />
          </div>

          <div>
            <label className={labelCls}>Inventory location / bin</label>
            <input value={bin} onChange={(e) => setBin(e.target.value)} placeholder="Aisle A-12" className={field} />
          </div>
          <div />

          {/* Shipping */}
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
            <button type="submit" disabled={uploading} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">Save &amp; generate label</button>
          </div>
        </div>
      </form>
    </div>
  );
}
