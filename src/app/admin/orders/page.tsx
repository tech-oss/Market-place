"use client";

import { useState } from "react";
import { formatZAR } from "@/lib/format";
import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { adminOrders as seed, DEFAULT_COMMISSION_PCT } from "@/mocks/dashboard";
import type { AdminOrderRow } from "@/mocks/dashboard";

const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>(seed);

  const act = (ref: string, escrow: "released" | "refunded") =>
    setOrders((prev) =>
      prev.map((o) =>
        o.reference === ref
          ? { ...o, escrow, status: escrow === "released" ? "Completed" : "Refunded" }
          : o,
      ),
    );

  const heldValue = orders.filter((o) => o.escrow === "held").reduce((s, o) => s + o.totalCents, 0);

  return (
    <>
      <PageHeading
        title="Orders & Escrow"
        description={`${formatZAR(heldValue)} currently held across ${orders.filter((o) => o.escrow === "held").length} orders.`}
      />

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Seller</th>
                <th className="px-5 py-3 font-medium">Buyer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Commission</th>
                <th className="px-5 py-3 font-medium">Escrow</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.reference} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-foreground">{o.reference}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.seller}</td>
                  <td className="px-5 py-3 text-muted-foreground">{o.buyer}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatZAR(Math.round(o.totalCents * (DEFAULT_COMMISSION_PCT / 100)))}
                  </td>
                  <td className="px-5 py-3"><StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} /></td>
                  <td className="px-5 py-3 text-right">
                    {o.escrow === "held" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => act(o.reference, "released")}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground hover:opacity-90"
                        >
                          Release
                        </button>
                        <button
                          onClick={() => act(o.reference, "refunded")}
                          className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Refund
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
