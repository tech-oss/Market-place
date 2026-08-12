"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Banknote, FileText, PackageCheck, Truck } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { cancelEftOrder, confirmEftPayment, getPaymentProofSignedUrl, processReturn, settleOrder } from "@/features/dashboard/actions";
import { InvoiceDialog } from "@/features/dashboard/invoice-dialog";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { daysSince, isReleaseOverdue } from "@/features/dashboard/order-timing";
import type { AdminOrderView } from "@/lib/data/dashboard";
import type { OrderStatus } from "@/types";

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting transfer",
  submitted: "Awaiting verification",
  confirmed: "Confirmed",
  expired: "Expired",
};

const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;
const ESCROW_LABEL = { held: "On hold", released: "Released", refunded: "Refunded" } as const;

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
  const [invoice, setInvoice] = useState<AdminOrderView | null>(null);

  const confirmEft = async (id: string) => {
    if (!window.confirm("Confirm this EFT payment was received? The order moves to Awaiting Shipment and the seller's Ship Now button activates.")) return;
    setBusy(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "paid-held" as OrderStatus, paymentStatus: "confirmed" } : o)));
    if (live) { const res = await confirmEftPayment(id); if (res.ok && !res.fellBack) router.refresh(); }
    setBusy(null);
  };

  const cancelEft = async (id: string) => {
    if (!window.confirm("Cancel this EFT order? Reserved stock is restored to the seller and the buyer is notified.")) return;
    setBusy(id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus, paymentStatus: "expired" } : o)));
    if (live) { const res = await cancelEftOrder(id); if (res.ok && !res.fellBack) router.refresh(); }
    setBusy(null);
  };

  const viewProof = async (path: string) => {
    if (!live) return;
    const res = await getPaymentProofSignedUrl(path);
    if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
  };

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
          <table className="w-full min-w-[1180px] text-sm">
            <colgroup>
              <col className="w-[130px]" />
              <col className="w-[190px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[170px]" />
              <col className="w-[110px]" />
              <col className="w-[190px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Shipping</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Commission</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Funds</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
              )}
              {orders.map((o) => {
                const meta = ORDER_STATUS_META[o.status as OrderStatus];
                const isOverdue = o.status === "confirmed" && isReleaseOverdue(o.confirmedAt, releaseAfterDays);
                const confirmedDays = daysSince(o.confirmedAt);
                return (
                  <tr key={o.id} className={rowTint(o, isOverdue)}>
                    <td className="px-5 py-3.5 align-top">
                      <p className="font-medium text-foreground">{o.reference}</p>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      {o.tracking ? (
                        <div className="text-xs text-muted-foreground">
                          <p className="flex items-center gap-1 font-medium text-foreground">
                            <Truck className="size-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">{o.courier || "Courier"}</span>
                          </p>
                          <p className="mt-0.5 truncate font-mono">{o.tracking}</p>
                          {o.shippingService && <p className="truncate">{o.shippingService}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not shipped yet</span>
                      )}
                      {o.status === "return-requested" && o.returnReason && (
                        <p className="mt-1 text-xs text-amber-800">Reason: {o.returnReason}</p>
                      )}
                      {o.status === "return-requested" && o.returnPhotoUrl && (
                        <a href={o.returnPhotoUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={o.returnPhotoUrl} alt="Return photo" className="size-12 rounded-lg border border-amber-200 object-cover" />
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-3.5 align-top text-muted-foreground">
                      <span className="line-clamp-2">{o.seller}</span>
                    </td>
                    <td className="px-5 py-3.5 align-top text-muted-foreground">
                      <span className="line-clamp-2">{o.buyer}</span>
                    </td>
                    <td className="px-5 py-3.5 align-top font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                    <td className="px-5 py-3.5 align-top text-muted-foreground">{formatZAR(Math.round(o.totalCents * (commissionPct / 100)))}</td>
                    <td className="px-5 py-3.5 align-top">
                      {meta ? <StatusPill label={meta.label} tone={meta.tone} /> : <span className="text-xs text-muted-foreground">{o.status}</span>}
                      {o.status === "confirmed" && confirmedDays !== null && (
                        <p className={`mt-1.5 text-[11px] font-medium ${isOverdue ? "text-red-700" : "text-muted-foreground"}`}>
                          {confirmedDays === 0 ? "Received today" : `Received ${confirmedDays}d ago`}
                          {isOverdue ? " — review payout" : ""}
                        </p>
                      )}
                      {o.paymentMethod === "eft" && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-800">
                          <Banknote className="size-3 shrink-0" /> EFT · {PAYMENT_STATUS_LABEL[o.paymentStatus] ?? o.paymentStatus}
                        </div>
                      )}
                      {o.paymentMethod === "eft" && o.paymentProofUrl && (
                        <button
                          type="button"
                          onClick={() => viewProof(o.paymentProofUrl!)}
                          className="mt-1 flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                        >
                          <FileText className="size-3 shrink-0" /> View proof
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3.5 align-top"><StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} /></td>
                    <td className="px-5 py-3.5 align-top text-right">
                      <div className="flex flex-col items-stretch gap-1.5">
                        {o.status === "pending-payment" && o.paymentMethod === "eft" ? (
                          <>
                            <button
                              onClick={() => confirmEft(o.id)}
                              disabled={busy === o.id}
                              className="whitespace-nowrap rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
                            >
                              Confirm Payment Received
                            </button>
                            <button
                              onClick={() => cancelEft(o.id)}
                              disabled={busy === o.id}
                              className="whitespace-nowrap rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
                            >
                              Cancel order
                            </button>
                          </>
                        ) : o.status === "return-requested" ? (
                          <button
                            onClick={() => completeReturn(o.id)}
                            disabled={busy === o.id}
                            className="w-full whitespace-nowrap rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                          >
                            Mark return received
                          </button>
                        ) : o.escrow === "held" ? (
                          <>
                            <button
                              onClick={() => act(o.id, "released")}
                              disabled={busy === o.id}
                              title={o.status === "confirmed" ? undefined : "The buyer hasn't confirmed delivery yet"}
                              className="whitespace-nowrap rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
                            >
                              Release payment
                            </button>
                            <button
                              onClick={() => act(o.id, "refunded")}
                              disabled={busy === o.id}
                              className="whitespace-nowrap rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-60"
                            >
                              Refund buyer
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Settled</span>
                        )}
                        <button
                          onClick={() => setInvoice(o)}
                          className="whitespace-nowrap rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          View invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {invoice && (
        <InvoiceDialog
          perspective="admin"
          reference={invoice.reference}
          date={invoice.date}
          counterpartyLabel="Seller"
          counterpartyName={invoice.seller}
          fundsStatusLabel={ESCROW_LABEL[invoice.escrow]}
          subtotalCents={invoice.subtotalCents}
          shippingCents={invoice.shippingCents}
          totalCents={invoice.totalCents}
          commissionPct={commissionPct}
          onClose={() => setInvoice(null)}
        />
      )}
    </div>
  );
}
