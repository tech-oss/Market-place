import Link from "next/link";
import { AlertTriangle, Banknote, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, StatCard, SectionCard, StatusPill, MiniBarChart } from "@/features/dashboard/ui";
import { getActiveSellerCount, getAdminOrders, getCommissionPct, getSellerApplications } from "@/lib/data/dashboard";

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
  const [adminOrders, applications, activeSellers, commissionPct] = await Promise.all([
    getAdminOrders(),
    getSellerApplications(),
    getActiveSellerCount(),
    getCommissionPct(),
  ]);
  const pending = applications.filter((a) => a.status === "pending");
  const held = adminOrders.filter((o) => o.escrow === "held");

  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const gmvCents = adminOrders
    .filter((o) => new Date(o.date).getTime() >= cutoff)
    .reduce((s, o) => s + o.totalCents, 0);
  const commissionCents = Math.round(gmvCents * (commissionPct / 100));
  const revenue = last7DayRevenue(adminOrders);

  return (
    <>
      <PageHeading title="Overview" description="Platform health at a glance." />

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
            {formatZAR(held.reduce((s, o) => s + o.totalCents, 0))} currently held, awaiting delivery confirmation.
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
                  <th className="px-5 py-3 font-medium">Buyer Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminOrders.slice(0, 5).map((o) => (
                  <tr key={o.reference}>
                    <td className="px-5 py-3 font-medium text-foreground">{o.reference}</td>
                    <td className="px-5 py-3 text-muted-foreground">{o.seller}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                    <td className="px-5 py-3"><StatusPill label={o.escrow} tone={ESCROW_TONE[o.escrow]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
