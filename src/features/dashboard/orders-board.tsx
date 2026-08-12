"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Search, Truck, X } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { OrderThumb } from "@/components/shared/order-thumb";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { markOrderShipped } from "@/features/dashboard/actions";
import { InvoiceDialog } from "@/features/dashboard/invoice-dialog";
import type { SellerOrder } from "@/types";

type SellerSort = "date-desc" | "date-asc" | "status";

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

const ESCROW_LABEL: Record<string, string> = {
  "pending-payment": "Pending",
  "paid-held": "On hold",
  shipped: "On hold",
  delivered: "On hold",
  confirmed: "On hold",
  released: "Released",
  "return-requested": "On hold",
  returned: "Refunded",
  disputed: "On hold",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const field = "w-full rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelCls = "mb-1 block text-xs font-semibold text-foreground";

function ShipDialog({ order, onClose, onShip }: {
  order: SellerOrder;
  onClose: () => void;
  onShip: (courier: string, tracking: string, service: string, note: string) => void;
}) {
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [service, setService] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={(e) => { e.preventDefault(); onShip(courier, tracking, service, note); }} className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-foreground">Mark {order.reference} as shipped</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Tell the buyer and admin how you shipped this order — your own courier, not a fixed platform list.
        </p>
        <label className={labelCls}>Courier / delivery provider</label>
        <input required value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. The Courier Guy, PUDO, self-delivery…" className={`${field} mb-4`} />
        <label className={labelCls}>Tracking / shipment number</label>
        <input required value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="CG1234567ZA" className={`${field} mb-4`} />
        <label className={labelCls}>Shipping service <span className="font-normal text-muted-foreground">— optional</span></label>
        <input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Overnight, Standard, Locker-to-locker" className={`${field} mb-4`} />
        <label className={labelCls}>Note for buyer <span className="font-normal text-muted-foreground">— optional</span></label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Anything else the buyer should know" className={`${field} mb-5 resize-none`} />
        <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">Confirm shipment</button>
      </form>
    </div>
  );
}

export function SellerOrdersBoard({ initial, live, commissionPct }: { initial: SellerOrder[]; live: boolean; commissionPct: number }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [shipping, setShipping] = useState<SellerOrder | null>(null);
  const [invoice, setInvoice] = useState<SellerOrder | null>(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SellerSort>("date-desc");

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? orders.filter((o) => o.reference.toLowerCase().includes(q) || o.productTitle.toLowerCase().includes(q))
      : orders;

    const sorted = [...filtered];
    if (sortBy === "date-desc") sorted.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    else if (sortBy === "date-asc") sorted.sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
    else if (sortBy === "status") sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [orders, query, sortBy]);

  return (
    <SectionCard>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order # or product…"
          className="min-w-[200px] flex-1 bg-transparent text-sm focus:outline-none"
        />
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="size-3.5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SellerSort)}
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="date-desc">Date (newest first)</option>
            <option value="date-asc">Date (oldest first)</option>
            <option value="status">Status</option>
          </select>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{visibleOrders.length} of {orders.length} orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Buyer</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
            {orders.length > 0 && visibleOrders.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No orders match your search.</td></tr>
            )}
            {visibleOrders.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <OrderThumb src={o.productImageUrl} alt={o.productTitle} className="size-12" />
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{o.reference}</p>
                    {o.tracking && (
                      <p className="text-xs text-muted-foreground">
                        {o.courier} · {o.tracking}{o.shippingService ? ` · ${o.shippingService}` : ""}
                      </p>
                    )}
                    {(o.status === "return-requested" || o.status === "returned") && (
                      <div className="mt-1 max-w-[240px] rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                        <p className="font-semibold">
                          {o.status === "return-requested"
                            ? "Buyer is returning this to us"
                            : "Returned — 10% fee charged to your wallet"}
                        </p>
                        {o.returnReason && <p className="mt-0.5 text-amber-800">Reason: {o.returnReason}</p>}
                        {o.returnPhotoUrl && (
                          <a href={o.returnPhotoUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={o.returnPhotoUrl} alt="Return photo" className="size-10 rounded-md border border-amber-200 object-cover" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{formatOrderDate(o.placedAt)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.productTitle} × {o.qty}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.buyerName}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                  <td className="px-5 py-3">
                    <StatusPill label={meta.label} tone={meta.tone} />
                    {o.status === "pending-payment" && o.paymentMethod === "eft" && (
                      <p className="mt-1 text-[11px] text-muted-foreground">Waiting on buyer's EFT payment — Ship unlocks once admin confirms.</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {o.status === "paid-held" && (
                        <button onClick={() => setShipping(o)} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800">
                          <Truck className="size-3.5" /> Ship
                        </button>
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

      {shipping && (
        <ShipDialog
          order={shipping}
          onClose={() => setShipping(null)}
          onShip={async (courier, tracking, service, note) => {
            setOrders((prev) => prev.map((o) => (o.id === shipping.id ? { ...o, status: "shipped", courier, tracking, shippingService: service || undefined, shippingNote: note || undefined } : o)));
            setShipping(null);
            if (live) { const res = await markOrderShipped(shipping.id, courier, tracking, service, note); if (res.ok && !res.fellBack) router.refresh(); }
          }}
        />
      )}

      {invoice && (
        <InvoiceDialog
          perspective="seller"
          reference={invoice.reference}
          date={invoice.placedAt}
          counterpartyLabel="Buyer"
          counterpartyName={invoice.buyerName}
          fundsStatusLabel={ESCROW_LABEL[invoice.status] ?? invoice.status}
          subtotalCents={invoice.totalCents}
          shippingCents={invoice.shippingCents ?? 0}
          totalCents={invoice.totalCents + (invoice.shippingCents ?? 0)}
          commissionPct={commissionPct}
          onClose={() => setInvoice(null)}
        />
      )}
    </SectionCard>
  );
}
