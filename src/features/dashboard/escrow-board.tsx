"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, PackageCheck, Truck } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { processReturn, settleOrder } from "@/features/dashboard/actions";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { daysSince, isReleaseOverdue } from "@/features/dashboard/order-timing";
import type { AdminOrderView } from "@/lib/data/dashboard";
import type { OrderStatus } from "@/types";

const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;

/** Rows needing an explicit admin decision get a tinted background so they stand out. */
function rowTint(o: AdminOrderView, overdue: boolean): string {
  if (o.status === "return-requested") return "bg-amber-50/60 hover:bg-amber-50";
  if (o.status === "confirmed") return overdue ? "bg-red-50/60 hover:bg-red-50" : "bg-blue-50/40 hover:bg-blue-50";
  return "hover:bg-neutral-50";
}

export function EscrowBoard({
  initial,
  commissionPct,
  releaseAfterDays,
  live,
}: {
  initial: AdminOrderView[];
  commissionPct: number;
  releaseAfterDays: number;
  live: boolean;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, outcome: "released" | "refunded") => {
    const verb = outcome === "released" ? "Release payment to the seller" : "Refund the buyer";
    if (!window.confirm(`${verb} for this order? This can't be undone.`)) return;
    setBusy(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: outcome, escrow: outcome === "released" ? "released" : "refunded" } : o)));
    if (live) { const res = await settleOrder(id, outcome); if (res.ok && !res.fellBack) router.refresh(); }
    setBusy(null);
  };

  const completeReturn = async (id: string) => {
    if (!window.confirm(`Confirm the returned item is back? The buyer is refunded in full and the seller is charged the ${commissionPct}% return fee.`)) return;
    setBusy(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "returned", escrow: "refunded" } : o)));
    if (live) { const res = await processReturn(id); if (res.ok && !res.fellBack) router.refresh(); }
    setBusy(null);
  };

  const held = orders.filter((o) => o.escrow === "held");
  const heldValue = held.reduce((s, o) => s + o.totalCents, 0);
  const awaitingRelease = orders.filter((o) => o.status === "confirmed");
  const overdue = awaitingRelease.filter((o) => isReleaseOverdue(o.confirmedAt, releaseAfterDays));
  const returns = orders.filter((o) => o.status === "return-requested");

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">
              {overdue.length} order{overdue.length === 1 ? "" : "s"} received over {releaseAfterDays} days ago — payment needs reassessing
            </p>
            <p className="mt-1 text-sm text-red-800">
              {overdue.map((o) => o.reference).join(", ")} — the buyer confirmed delivery and the return window has closed.
              Review and release {formatZAR(overdue.reduce((s, o) => s + o.totalCents, 0))} to the relevant sellers.
            </p>
          </div>
        </div>
      )}

      {returns.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">
              {returns.length} return{returns.length === 1 ? "" : "s"} on the way back to you
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Mark each one received once the part physically arrives — that refunds the buyer and charges the seller the {commissionPct}% return fee.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-2xl font-black text-foreground">{formatZAR(heldValue)}</p>
          <p className="text-sm text-muted-foreground">Held across {held.length} order{held.length === 1 ? "" : "s"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-2xl font-black text-foreground">{awaitingRelease.length}</p>
          <p className="text-sm text-muted-foreground">Received — awaiting your release</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className={`text-2xl font-black ${overdue.length ? "text-red-600" : "text-foreground"}`}>{overdue.length}</p>
          <p className="text-sm text-muted-foreground">Past the {releaseAfterDays}-day review window</p>
        </div>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Seller</th>
                <th className="px-5 py-3 font-medium">Buyer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Commission</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Funds</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
              )}
              {orders.map((o) => {
                const meta = ORDER_STATUS_META[o.status as OrderStatus];
                const isOverdue = o.status === "confirmed" && isReleaseOverdue(o.confirmedAt, releaseAfterDays);
                const confirmedDays = daysSince(o.confirmedAt);
                return (
                  <tr key={o.id} className={rowTint(o, isOverdue)}>
                    <td className="px-5 py-3 align-top">
                      <p className="font-medium text-foreground">{o.reference}</p>
                      {o.tracking && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="size-3" />
                          {o.courier} · <span className="font-mono">{o.tracking}</span>
                          {o.shippingService ? ` · ${o.shippingService}` : ""}
                        </p>
                      )}
                      {o.status === "return-requested" && o.returnReason && (
                        <p className="mt-0.5 text-xs text-amber-800">Reason: {o.returnReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 align-top text-muted-foreground">{o.seller}</td>
                    <td className="px-5 py-3 align-top text-muted-foreground">{o.buyer}</td>
                    <td className="px-5 py-3 align-top font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                    <td className="px-5 py-3 align-top text-muted-foreground">{formatZAR(Math.round(o.totalCents * (commissionPct / 100)))}</td>
                    <td className="px-5 py-3 align-top">
                      {meta ? <StatusPill label={meta.label} tone={meta.tone} /> : <span className="text-xs text-muted-foreground">{o.status}</span>}
                      {o.status === "confirmed" && confirmedDays !== null && (
                        <p className={`mt-1 text-[11px] font-medium ${isOverdue ? "text-red-700" : "text-muted-foreground"}`}>
                          {confirmedDays === 0 ? "Received today" : `Received ${confirmedDays}d ago`}
                          {isOverdue ? " — review payout" : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 align-top"><StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} /></td>
                    <td className="px-5 py-3 align-top text-right">
                      {o.status === "return-requested" ? (
                        <button
                          onClick={() => completeReturn(o.id)}
                          disabled={busy === o.id}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                        >
                          Mark return received
                        </button>
                      ) : o.escrow === "held" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => act(o.id, "released")}
                            disabled={busy === o.id}
                            title={o.status === "confirmed" ? undefined : "The buyer hasn't confirmed delivery yet"}
                            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
                          >
                            Release
                          </button>
                          <button
                            onClick={() => act(o.id, "refunded")}
                            disabled={busy === o.id}
                            className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
                          >
                            Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
