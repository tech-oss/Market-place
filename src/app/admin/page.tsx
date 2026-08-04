import Link from "next/link";
import { AlertTriangle, Banknote, PackageCheck, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, StatCard, SectionCard, StatusPill, MiniBarChart } from "@/features/dashboard/ui";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { isReleaseOverdue } from "@/features/dashboard/order-timing";
import {
  getActiveSellerCount,
  getAdminOrders,
  getCommissionPct,
  getPlatformSettings,
  getSellerApplications,
} from "@/lib/data/dashboard";
import type { OrderStatus } from "@/types";

const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Bucket order GMV (in Rand) into the last 7 calendar days, oldest first. */
function last7DayRevenue(orders: { totalCents: number; date: string }[]): { data: number[]; labels: string[] } {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const data = days.map((day) => {
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const cents = orders
      .filter((o) => {
        const t = new Date(o.date).getTime();
        return t >= day.getTime() && t < next.getTime();
      })
      .reduce((s, o) => s + o.totalCents, 0);
    return Math.round(cents / 100);
  });
  const labels = days.map((d) => d.toLocaleDateString("en-ZA", { weekday: "short" }));
  return { data, labels };
}

export default async function AdminOverview() {
  const [adminOrders, applications, activeSellers, commissionPct, settings] = await Promise.all([
    getAdminOrders(),
    getSellerApplications(),
    getActiveSellerCount(),
    getCommissionPct(),
    getPlatformSettings(),
  ]);
  const pending = applications.filter((a) => a.status === "pending");
  const held = adminOrders.filter((o) => o.escrow === "held");
  const overdueRelease = adminOrders.filter(
    (o) => o.status === "confirmed" && isReleaseOverdue(o.confirmedAt, settings.returnWindowDays),
  );
  const pendingReturns = adminOrders.filter((o) => o.status === "return-requested");

  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const gmvCents = adminOrders
    .filter((o) => new Date(o.date).getTime() >= cutoff)
    .reduce((s, o) => s + o.totalCents, 0);
  const commissionCents = Math.round(gmvCents * (commissionPct / 100));
  const revenue = last7DayRevenue(adminOrders);

  return (
    <>
      <PageHeading title="Overview" description="Platform health at a glance." />

      {overdueRelease.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div className="min-w-0">
            <p className="font-semibold text-red-900">
              Payments need reassessing — {overdueRelease.length} order{overdueRelease.length === 1 ? "" : "s"} received by the buyer over {settings.returnWindowDays} days ago
            </p>
            <p className="mt-1 text-sm text-red-800">
              {overdueRelease.map((o) => o.reference).join(", ")} — the return window has closed on{" "}
              {overdueRelease.length === 1 ? "this order" : "these orders"}, totalling{" "}
              {formatZAR(overdueRelease.reduce((s, o) => s + o.totalCents, 0))} still held.
            </p>
            <Link href="/admin/orders" className="mt-2 inline-block text-sm font-semibold text-red-900 underline">
              Review and release →
            </Link>
          </div>
        </div>
      )}

      {pendingReturns.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <PackageCheck className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="min-w-0">
            <p className="font-semibold text-amber-900">
              {pendingReturns.length} return{pendingReturns.length === 1 ? "" : "s"} in transit back to you
            </p>
            <p className="mt-1 text-sm text-amber-800">
              {pendingReturns.map((o) => o.reference).join(", ")} — mark each received once the part arrives to refund the buyer and charge the seller the {commissionPct}% return fee.
            </p>
            <Link href="/admin/orders" className="mt-2 inline-block text-sm font-semibold text-amber-900 underline">
              Process returns →
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV (30d)" value={formatZAR(gmvCents)} icon={TrendingUp} />
        <StatCard label="Commission Earned" value={formatZAR(commissionCents)} icon={Banknote} trend={{ value: `${commissionPct}% flat`, up: true }} />
        <StatCard label="Active Sellers" value={String(activeSellers)} icon={Users} />
        <StatCard label="Pending Approvals" value={String(pending.length)} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Revenue — last 7 days" className="lg:col-span-2">
          <div className="p-5"><MiniBarChart data={revenue.data} labels={revenue.labels} /></div>
        </SectionCard>

        <SectionCard
          title="Pending approvals"
          action={<Link href="/admin/sellers" className="text-sm font-semibold text-brand hover:underline">Review</Link>}
        >
          <ul className="divide-y divide-border">
            {pending.map((a) => (
              <li key={a.id} className="px-5 py-3">
                <p className="text-sm font-medium text-foreground">{a.businessName}</p>
                <p className="text-xs text-muted-foreground">{a.businessType} · {a.location}</p>
              </li>
            ))}
            {pending.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">All caught up 🎉</li>}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5 lg:col-span-1">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="size-5" />
            <p className="font-bold text-foreground">{held.length} orders in Buyer Protection</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatZAR(held.reduce((s, o) => s + o.totalCents, 0))} currently held. Nothing pays out until you release it.
          </p>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Manage Buyer Protection →
          </Link>
        </div>

        <SectionCard title="Recent orders" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Seller</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminOrders.slice(0, 5).map((o) => {
                  const meta = ORDER_STATUS_META[o.status as OrderStatus];
                  return (
                    <tr key={o.reference}>
                      <td className="px-5 py-3 font-medium text-foreground">{o.reference}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.seller}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                      <td className="px-5 py-3">
                        {meta ? <StatusPill label={meta.label} tone={meta.tone} /> : <StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
