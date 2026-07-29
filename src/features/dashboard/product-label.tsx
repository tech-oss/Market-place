"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Printer, X } from "lucide-react";
import { formatZAR } from "@/lib/format";
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
        width: 1.4,
        height: 42,
        displayValue: true,
        fontSize: 11,
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

/** Collects every CSS rule already loaded on the page, as plain text. */
function collectPageCss(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) chunks.push(rule.cssText);
    } catch {
      // Cross-origin sheet — nothing we can (or need to) copy from it.
    }
  }
  return chunks.join("\n");
}

/**
 * Prints the label in an isolated hidden iframe containing only the label's
 * markup — not the dashboard page it's shown in. Hiding the rest of the page
 * with visibility:hidden still leaves it in the document's layout flow, so
 * the browser sees a full-height page and paginates it into several 33mm
 * "pages," repeating the one visible label on every one of them (this is
 * exactly what printed 8 copies). An isolated document has nothing else to
 * paginate, so exactly one label prints.
 */
function printLabel(labelEl: HTMLElement) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><style>${collectPageCss()}\n@page{size:90mm 33mm;margin:0;}html,body{margin:0;padding:0;}</style></head><body>${labelEl.outerHTML}</body></html>`,
  );
  doc.close();

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => document.body.removeChild(iframe), 1000);
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
      className="flex flex-col items-center justify-center overflow-hidden border border-neutral-300 bg-white px-[3mm] py-[1.5mm] text-center text-neutral-900"
      style={{ width: "90mm", height: "33mm" }}
    >
      <Barcode value={listing.sku} />
      <p className="mt-[0.5mm] w-full truncate text-[3mm] leading-tight">{listing.title}</p>
      <p className="mt-[0.3mm] text-[3.6mm] font-black leading-tight">{formatZAR(listing.priceCents)}</p>
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
            onClick={() => {
              const label = document.getElementById("printable-label");
              if (label) printLabel(label);
            }}
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
