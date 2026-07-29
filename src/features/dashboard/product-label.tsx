"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { Printer, X } from "lucide-react";
import { formatZAR, conditionLabel } from "@/lib/format";
import { sanitizeForCode128 } from "@/lib/barcode";
import type { SellerListing } from "@/types";

function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    // Code128 only encodes printable ASCII — strip anything else so a
    // legacy SKU saved before this validation existed can't crash the
    // renderer or silently print a blank/garbled barcode.
    const safeValue = sanitizeForCode128(value);
    try {
      JsBarcode(ref.current, safeValue || " ", {
        format: "CODE128",
        width: 1.6,
        height: 46,
        displayValue: true,
        fontSize: 12,
        margin: 0,
        background: "#ffffff",
        lineColor: "#111111",
      });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [value]);

  if (failed) {
    return (
      <p className="rounded bg-red-50 px-2 py-3 text-center text-[11px] text-red-700">
        Couldn&rsquo;t generate a barcode for this SKU — edit it to use only letters, numbers and standard symbols.
      </p>
    );
  }
  return <svg ref={ref} className="w-full" />;
}

function QrCode({ value }: { value: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(value, { margin: 0, width: 120, errorCorrectionLevel: "M" })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [value]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="QR code" className="size-[92px]" /> : <div className="size-[92px] bg-neutral-100" />;
}

/** The physical label artwork (also the print target via id). */
export function ProductLabel({ listing }: { listing: SellerListing }) {
  const qrValue = `https://motorcycleproducts.co.za/parts/${listing.slug}`;
  return (
    <div
      id="printable-label"
      className="w-[340px] rounded-md border border-neutral-300 bg-white p-4 text-neutral-900"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <span className="grid size-6 place-items-center rounded bg-brand text-[10px] font-black text-white">
          MP
        </span>
        <span className="text-[10px] font-semibold uppercase text-neutral-500">
          {conditionLabel(listing.condition)}
        </span>
      </div>

      <div className="mt-2 flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{listing.title}</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">SKU: {listing.sku}</p>
          <p className="mt-1 text-lg font-black">{formatZAR(listing.priceCents)}</p>
          <p className="text-[11px] text-neutral-500">Bin: A-{listing.sku.slice(-2)} · Qty: {listing.stock}</p>
        </div>
        <QrCode value={qrValue} />
      </div>

      <div className="mt-2 border-t border-neutral-200 pt-2">
        <Barcode value={listing.sku} />
      </div>
    </div>
  );
}

/** Modal that previews the label with Print / Close actions. */
export function LabelDialog({
  listing,
  onClose,
}: {
  listing: SellerListing;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-8">
          <h3 className="font-bold text-foreground">Inventory Label</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <ProductLabel listing={listing} />

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            <Printer className="size-4" /> Print label
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
