"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatZAR } from "@/lib/format";
import { SectionCard, StatusPill } from "@/features/dashboard/ui";
import { settleOrder } from "@/features/dashboard/actions";
import type { AdminOrderView } from "@/lib/data/dashboard";

const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;

export function EscrowBoard({
  initial,
  commissionPct,
  live,
}: {
  initial: AdminOrderView[];
  commissionPct: number;
  live: boolean;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initial);

  const act = async (id: string, outcome: "released" | "refunded") => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, escrow: outcome, status: outcome === "released" ? "Completed" : "Refunded" } : o)));
    if (live) { const res = await settleOrder(id, outcome); if (res.ok && !res.fellBack) router.refresh(); }
  };

  const held = orders.filter((o) => o.escrow === "held");
  const heldValue = held.reduce((s, o) => s + o.totalCents, 0);

  return (
    <SectionCard>
      <p className="border-b border-border px-5 py-3 text-sm text-muted-foreground">
        {formatZAR(heldValue)} currently held across {held.length} order{held.length === 1 ? "" : "s"}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Seller</th>
              <th className="px-5 py-3 font-medium">Buyer</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Commission</th>
              <th className="px-5 py-3 font-medium">Buyer Protection</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{o.reference}</p>
                  {o.tracking && (
                    <p className="text-xs text-muted-foreground">
                      {o.courier} · {o.tracking}{o.shippingService ? ` · ${o.shippingService}` : ""}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{o.seller}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.buyer}</td>
                <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                <td className="px-5 py-3 text-muted-foreground">{formatZAR(Math.round(o.totalCents * (commissionPct / 100)))}</td>
                <td className="px-5 py-3"><StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} /></td>
                <td className="px-5 py-3 text-right">
                  {o.escrow === "held" ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => act(o.id, "released")} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90">Release</button>
                      <button onClick={() => act(o.id, "refunded")} className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">Refund</button>
                    </div>
                  ) : <span className="text-xs text-muted-foreground">Settled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
