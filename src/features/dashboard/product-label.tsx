"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Printer, X } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { sanitizeForCode128 } from "@/lib/barcode";
import type { SellerListing } from "@/types";

const BARCODE_OPTS = {
  format: "CODE128" as const,
  width: 1.4,
  height: 42,
  displayValue: true,
  fontSize: 11,
  margin: 0,
  background: "#ffffff",
  lineColor: "#111111",
};

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
      JsBarcode(ref.current, safeValue || " ", BARCODE_OPTS);
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the barcode as a standalone SVG string — independent of any mounted component. */
function buildBarcodeSvg(sku: string): string {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try {
    JsBarcode(svg, sanitizeForCode128(sku) || " ", BARCODE_OPTS);
  } catch {
    return "";
  }
  return svg.outerHTML;
}

/**
 * Prints the label in an isolated hidden iframe with its own fully
 * self-contained, minimal stylesheet — no dependency on the app's compiled
 * CSS at all. Two earlier attempts both over-printed (8–9 copies): hiding
 * the rest of the dashboard with visibility:hidden still left it in the
 * document's layout flow, and later, copying the app's *entire* stylesheet
 * into the print document risked pulling in a rule that stretched the
 * body/html height (e.g. a min-height reset) well past one 33mm page. This
 * version defines every style itself, so nothing external can inflate the
 * page count.
 */
function printLabel(listing: SellerListing) {
  const barcodeSvg = buildBarcodeSvg(listing.sku);
  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: 90mm 33mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 90mm; height: 33mm; overflow: hidden; font-family: Arial, Helvetica, sans-serif; }
  .label {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    width: 90mm; height: 33mm; padding: 1.5mm 3mm; text-align: center; overflow: hidden;
  }
  .label svg { max-width: 100%; }
  .title {
    margin-top: 0.5mm; font-size: 3mm; line-height: 1.1; max-width: 100%;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .price { margin-top: 0.3mm; font-size: 3.6mm; font-weight: 900; line-height: 1.1; }
</style>
</head>
<body>
  <div class="label">
    ${barcodeSvg}
    <p class="title">${escapeHtml(listing.title)}</p>
    <p class="price">${escapeHtml(formatZAR(listing.priceCents))}</p>
  </div>
</body>
</html>`;

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
  doc.write(html);
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
            onClick={() => printLabel(listing)}
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
