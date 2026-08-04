"use client";

import { useState } from "react";
import { MessageSquareText, Truck, X } from "lucide-react";
import { CopyTrackingButton } from "@/features/cart/copy-tracking-button";

export function TrackShippingModal({
  courier,
  tracking,
  shippingService,
  shippingNote,
}: {
  courier?: string;
  tracking: string;
  shippingService?: string;
  shippingNote?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Truck className="size-3.5" /> Track Shipping
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Track Shipping</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shipping Company</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{courier || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracking Number</dt>
                <dd className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-muted px-2.5 py-1.5 font-mono text-sm font-medium text-foreground">{tracking}</span>
                  <CopyTrackingButton value={tracking} />
                </dd>
              </div>
              {shippingService && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{shippingService}</dd>
                </div>
              )}
              {shippingNote && (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <MessageSquareText className="size-3.5" /> Note from seller
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{shippingNote}</dd>
                </div>
              )}
            </dl>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
