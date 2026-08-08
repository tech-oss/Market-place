"use client";

import { X } from "lucide-react";
import { formatZAR } from "@/lib/format";

const row = "flex items-center justify-between py-1.5 text-sm";

/**
 * Shared order invoice — same breakdown shown to the seller (what they earn)
 * and the admin (what the platform earns), just relabeled per perspective.
 * Commission is computed on the order total, matching the "Commission"
 * column already shown on the admin Orders & Buyer Protection board.
 */
export function InvoiceDialog({
  perspective,
  reference,
  date,
  counterpartyLabel,
  counterpartyName,
  fundsStatusLabel,
  subtotalCents,
  shippingCents,
  totalCents,
  commissionPct,
  onClose,
}: {
  perspective: "seller" | "admin";
  reference: string;
  date: string;
  counterpartyLabel: string;
  counterpartyName: string;
  fundsStatusLabel: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  commissionPct: number;
  onClose: () => void;
}) {
  const taxCents = 0;
  const commissionCents = Math.round(totalCents * (commissionPct / 100));
  const netCents = totalCents - commissionCents - taxCents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Invoice · {reference}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })} · {counterpartyLabel}: {counterpartyName}
        </p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-neutral-50 px-3.5 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Funds status</span>
          <span className="text-sm font-semibold text-foreground">{fundsStatusLabel}</span>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-foreground">What the buyer paid</p>
          <div className="mt-1 divide-y divide-border/60">
            <div className={row}><span className="text-muted-foreground">Product price</span><span className="text-foreground">{formatZAR(subtotalCents)}</span></div>
            <div className={row}><span className="text-muted-foreground">Shipping</span><span className="text-foreground">{formatZAR(shippingCents)}</span></div>
            <div className={row}><span className="text-muted-foreground">Tax*</span><span className="text-foreground">{formatZAR(taxCents)}</span></div>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
            <span>Order total</span><span>{formatZAR(totalCents)}</span>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-foreground">
            {perspective === "seller" ? "What you earn" : "Platform earnings"}
          </p>
          <div className="mt-1 divide-y divide-border/60">
            <div className={row}><span className="text-muted-foreground">Order total</span><span className="text-foreground">{formatZAR(totalCents)}</span></div>
            <div className={row}><span className="text-muted-foreground">Tax collected</span><span className="text-foreground">-{formatZAR(taxCents)}</span></div>
            {perspective === "seller" ? (
              <div className={row}><span className="text-muted-foreground">Platform commission ({commissionPct}%)</span><span className="text-foreground">-{formatZAR(commissionCents)}</span></div>
            ) : (
              <div className={row}><span className="text-muted-foreground">Commission earned ({commissionPct}%)</span><span className="text-foreground">+{formatZAR(commissionCents)}</span></div>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
            <span>{perspective === "seller" ? "Order earnings" : "Seller payout"}</span>
            <span>{formatZAR(perspective === "seller" ? netCents : netCents)}</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          *This platform doesn&rsquo;t collect sales tax/VAT on your behalf — sellers registered for VAT are responsible for accounting for it themselves.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
}
