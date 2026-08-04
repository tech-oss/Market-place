"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Undo2, X } from "lucide-react";
import { requestReturn } from "@/features/cart/actions";

export function RequestReturnButton({
  orderId,
  returnAddress,
  returnContactName,
  returnContactPhone,
  daysLeft,
  commissionPct,
}: {
  orderId: string;
  returnAddress: string;
  returnContactName: string;
  returnContactPhone: string;
  daysLeft: number;
  commissionPct: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await requestReturn(orderId, reason);
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Something went wrong. Please try again."); return; }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        <Undo2 className="size-4" /> Return this order
      </button>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {daysLeft > 0
          ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left to return this order.`
          : "Today is the last day to return this order."}
      </p>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Return this order</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              You&rsquo;ll get a <strong className="text-foreground">full refund</strong> once we receive the part back.
              Ship it to the address below and we&rsquo;ll process your refund on arrival.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Return to</p>
              {returnAddress ? (
                <>
                  {returnContactName && <p className="mt-1 text-sm font-medium text-foreground">{returnContactName}</p>}
                  <p className="whitespace-pre-line text-sm text-foreground">{returnAddress}</p>
                  {returnContactPhone && <p className="text-sm text-muted-foreground">{returnContactPhone}</p>}
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Our team will email you the return address shortly after you submit this.
                </p>
              )}
            </div>

            <label className="mt-4 block text-xs font-semibold text-foreground">Reason for return</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Doesn't fit my bike, not as described…"
              className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />

            <p className="mt-3 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-[11px] text-muted-foreground">
              The seller is charged a {commissionPct}% handling fee on returned orders. Your refund is not reduced by it.
            </p>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
                {busy && <Loader2 className="size-4 animate-spin" />}
                Confirm return
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
