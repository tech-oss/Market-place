"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
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
        width: 1.3,
        height: 34,
        displayValue: true,
        fontSize: 10,
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
      <p className="rounded bg-red-50 px-1 py-1 text-center text-[8px] text-red-700">
        Invalid SKU for barcode — edit to use only letters, numbers and standard symbols.
      </p>
    );
  }
  return <svg ref={ref} className="w-full" />;
}

/**
 * The physical label artwork (also the print target via id). Sized in mm
 * to match the seller's Zebra label stock (90mm x 33mm) exactly — the
 * preview and the printed output use the same box so there are no
 * surprises between what you see and what comes out of the printer.
 */
export function ProductLabel({ listing }: { listing: SellerListing }) {
  return (
    <div
      id="printable-label"
      className="flex flex-col justify-center overflow-hidden border border-neutral-300 bg-white px-[3mm] py-[1.5mm] text-neutral-900"
      style={{ width: "90mm", height: "33mm" }}
    >
      <p className="truncate text-[3.2mm] font-bold leading-tight">{listing.title}</p>
      <p className="mt-[0.3mm] truncate text-[2.4mm] leading-tight text-neutral-500">
        SKU: {listing.sku} · {conditionLabel(listing.condition)}
      </p>
      <p className="mt-[0.3mm] text-[3.6mm] font-black leading-tight">{formatZAR(listing.priceCents)}</p>
      <div className="mt-[0.5mm]">
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
