import Link from "next/link";
import { AlertTriangle, Banknote, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, StatCard, SectionCard, StatusPill, MiniBarChart } from "@/features/dashboard/ui";
import { adminOrders, adminRevenueTrend, adminStats, sellerApplications } from "@/mocks/dashboard";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ESCROW_TONE = { held: "blue", released: "green", refunded: "gray" } as const;

export default function AdminOverview() {
  const pending = sellerApplications.filter((a) => a.status === "pending");

  return (
    <>
      <PageHeading title="Overview" description="Platform health at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV (30d)" value={formatZAR(adminStats.gmvCents)} icon={TrendingUp} trend={{ value: "9.1%", up: true }} />
        <StatCard label="Commission Earned" value={formatZAR(adminStats.commissionCents)} icon={Banknote} trend={{ value: "7% flat", up: true }} />
        <StatCard label="Active Sellers" value={String(adminStats.activeSellers)} icon={Users} />
        <StatCard label="Pending Approvals" value={String(adminStats.pendingApprovals)} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Revenue — last 7 days" className="lg:col-span-2">
          <div className="p-5"><MiniBarChart data={adminRevenueTrend} labels={DAY_LABELS} /></div>
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
            <p className="font-bold text-foreground">{adminStats.disputes} open disputes</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {adminStats.ordersInEscrow} orders currently holding funds in escrow.
          </p>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Manage escrow →
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
                  <th className="px-5 py-3 font-medium">Escrow</th>
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
