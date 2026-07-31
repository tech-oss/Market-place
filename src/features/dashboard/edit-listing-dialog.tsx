"use client";

import { useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { conditionOptions } from "@/mocks";
import { createClient } from "@/lib/supabase/client";
import { sanitizeForCode128 } from "@/lib/barcode";
import type { ProductCondition, SellerListing } from "@/types";
import type { UpdateListingInput } from "@/features/dashboard/actions";
import type { BikeMake, BikeModel, CatalogCategory } from "@/lib/data/products";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

export function EditListingDialog({
  listing,
  onClose,
  onSave,
  categories,
  bikeMakes,
  bikeModels,
}: {
  listing: SellerListing;
  onClose: () => void;
  onSave: (input: UpdateListingInput) => void | Promise<void>;
  categories: CatalogCategory[];
  bikeMakes: BikeMake[];
  bikeModels: BikeModel[];
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

  // Photos
  const [images, setImages] = useState<string[]>(listing.images?.map((i) => i.url).filter(Boolean) ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList) => {
    setUploadError(null);
    const supabase = createClient();
    if (!supabase) { setUploadError("Image storage isn't connected."); return; }
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

  const removeImage = (url: string) => setImages((prev) => prev.filter((u) => u !== url));

  // Compatibility: pick an existing catalog make/model, or request a new one.
  const [fitmentMode, setFitmentMode] = useState<"catalog" | "request">("catalog");
  const initialMakeId = bikeMakes.find(
    (m) => m.name.toLowerCase() === (listing.fitment?.brand ?? listing.brandName ?? "").toLowerCase(),
  )?.id ?? bikeMakes[0]?.id ?? "";
  const [makeId, setMakeId] = useState(initialMakeId);
  const modelsForMake = useMemo(() => bikeModels.filter((m) => m.makeId === makeId), [bikeModels, makeId]);
  const initialModelId = modelsForMake.find(
    (m) => m.name.toLowerCase() === (listing.fitment?.model ?? "").toLowerCase(),
  )?.id ?? modelsForMake[0]?.id ?? "";
  const [modelId, setModelId] = useState(initialModelId);
  const selectedModel = modelsForMake.find((m) => m.id === modelId);

  const [reqMake, setReqMake] = useState("");
  const [reqModel, setReqModel] = useState("");
  const [reqYearFrom, setReqYearFrom] = useState("");
  const [reqYearTo, setReqYearTo] = useState("");

  const changeMake = (id: string) => {
    setMakeId(id);
    const first = bikeModels.find((m) => m.makeId === id);
    setModelId(first?.id ?? "");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isRequest = fitmentMode === "request";
    const reqYf = parseInt(reqYearFrom, 10);
    const reqYt = parseInt(reqYearTo, 10);
    const selectedMake = bikeMakes.find((m) => m.id === makeId);

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
      imageUrls: images,
      brand: isRequest ? undefined : selectedMake?.name,
      model: isRequest ? undefined : selectedModel?.name,
      yearFrom: isRequest ? undefined : selectedModel?.yearFrom,
      yearTo: isRequest ? undefined : selectedModel?.yearTo,
      newYmm: isRequest && reqMake.trim() && reqModel.trim() && Number.isFinite(reqYf) && Number.isFinite(reqYt)
        ? { makeName: reqMake.trim(), modelName: reqModel.trim(), yearFrom: reqYf, yearTo: reqYt }
        : undefined,
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
            <p className="text-sm text-muted-foreground">Update details, photos, compatibility, price, stock and shipping.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Photos */}
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
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select required value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className={field}>
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
            <input value={sku} onChange={(e) => setSku(sanitizeForCode128(e.target.value))} className={field} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Printed as a Code128 barcode — letters, numbers and standard symbols only.
            </p>
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

          {/* Compatibility */}
          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <label className={labelCls}>Compatibility (make / model / years)</label>
              <button
                type="button"
                onClick={() => setFitmentMode(fitmentMode === "catalog" ? "request" : "catalog")}
                className="text-xs font-medium text-brand hover:underline"
              >
                {fitmentMode === "catalog" ? "Can't find your bike? Request it" : "Use existing catalog instead"}
              </button>
            </div>

            {fitmentMode === "catalog" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <select value={makeId} onChange={(e) => changeMake(e.target.value)} className={field}>
                    {bikeMakes.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={modelsForMake.length === 0} className={field}>
                    {modelsForMake.length === 0 && <option value="">No models yet for this make</option>}
                    {modelsForMake.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.yearFrom}–{m.yearTo})</option>
                    ))}
                  </select>
                </div>
                {modelsForMake.length === 0 && (
                  <p className="mt-1.5 text-[11px] text-amber-700">
                    No models are set up for this make yet — use “Request it” above to propose one.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input value={reqMake} onChange={(e) => setReqMake(e.target.value)} placeholder="Make, e.g. Indian" className={field} />
                  <input value={reqModel} onChange={(e) => setReqModel(e.target.value)} placeholder="Model, e.g. FTR 1200" className={field} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input type="number" value={reqYearFrom} onChange={(e) => setReqYearFrom(e.target.value)} placeholder="Year from" className={field} />
                  <input type="number" value={reqYearTo} onChange={(e) => setReqYearTo(e.target.value)} placeholder="Year to" className={field} />
                </div>
                <p className="mt-1.5 text-[11px] text-amber-700">
                  Submitting this will hold the listing in Pending Review until an admin approves the new make/model/year.
                </p>
              </>
            )}
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
