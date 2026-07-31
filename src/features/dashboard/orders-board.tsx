"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, X } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { markOrderShipped } from "@/features/dashboard/actions";
import type { SellerOrder } from "@/types";

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

export function SellerOrdersBoard({ initial, live }: { initial: SellerOrder[]; live: boolean }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);
  const [shipping, setShipping] = useState<SellerOrder | null>(null);

  return (
    <SectionCard>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Buyer</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
            {orders.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{o.reference}</p>
                    {o.tracking && (
                      <p className="text-xs text-muted-foreground">
                        {o.courier} · {o.tracking}{o.shippingService ? ` · ${o.shippingService}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{o.productTitle} × {o.qty}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.buyerName}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                  <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
                  <td className="px-5 py-3 text-right">
                    {o.status === "paid-held" ? (
                      <button onClick={() => setShipping(o)} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800">
                        <Truck className="size-3.5" /> Ship
                      </button>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
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
    </SectionCard>
  );
}
