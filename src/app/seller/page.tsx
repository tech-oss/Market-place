import Link from "next/link";
import { Package, Receipt, TrendingUp, Wallet } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, StatCard, SectionCard, StatusPill, MiniBarChart } from "@/features/dashboard/ui";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { getCurrentSeller, getSellerListings, getSellerOrders, getWallet } from "@/lib/data/dashboard";

/** Bucket order totals (in Rand) into the last 7 calendar days, oldest first. */
function last7DayTrend(orders: { totalCents: number; placedAt: string }[]): { data: number[]; labels: string[] } {
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
        const t = new Date(o.placedAt).getTime();
        return t >= day.getTime() && t < next.getTime();
      })
      .reduce((s, o) => s + o.totalCents, 0);
    return Math.round(cents / 100);
  });
  const labels = days.map((d) => d.toLocaleDateString("en-ZA", { weekday: "short" }));
  return { data, labels };
}

export default async function SellerOverview() {
  const [sellerListings, sellerOrders, wallet, seller] = await Promise.all([
    getSellerListings(),
    getSellerOrders(),
    getWallet(),
    getCurrentSeller(),
  ]);
  const walletBalanceCents = wallet.balanceCents;
  const activeListings = sellerListings.filter((l) => l.status === "active").length;
  const inEscrow = sellerOrders.filter((o) => o.status === "paid-held" || o.status === "shipped").length;
  const totalSalesCents = sellerOrders.reduce((s, o) => s + o.totalCents, 0);
  const trend = last7DayTrend(sellerOrders);

  return (
    <>
      <PageHeading title="Overview" description={`Welcome back, ${seller?.name ?? "Seller"}.`}>
        <Link
          href="/seller/listings"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          + New Listing
        </Link>
      </PageHeading>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales (30d)" value={formatZAR(totalSalesCents)} icon={TrendingUp} trend={{ value: "12.4%", up: true }} />
        <StatCard label="Active Listings" value={String(activeListings)} icon={Package} />
        <StatCard label="Orders in Buyer Protection" value={String(inEscrow)} icon={Receipt} trend={{ value: "2 new", up: true }} />
        <StatCard label="Wallet Balance" value={formatZAR(walletBalanceCents)} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Sales — last 7 days" className="lg:col-span-2">
          <div className="p-5">
            <MiniBarChart data={trend.data} labels={trend.labels} />
          </div>
        </SectionCard>

        <SectionCard title="Low stock">
          <ul className="divide-y divide-border">
            {sellerListings
              .filter((l) => l.stock <= 3)
              .map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="truncate text-foreground">{l.title}</span>
                  <span className={l.stock === 0 ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>
                    {l.stock} left
                  </span>
                </li>
              ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Recent orders"
          action={<Link href="/seller/orders" className="text-sm font-semibold text-brand hover:underline">View all</Link>}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Buyer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sellerOrders.slice(0, 5).map((o) => {
                  const meta = ORDER_STATUS_META[o.status];
                  return (
                    <tr key={o.id}>
                      <td className="px-5 py-3 font-medium text-foreground">{o.reference}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.productTitle}</td>
                      <td className="px-5 py-3 text-muted-foreground">{o.buyerName}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{formatZAR(o.totalCents)}</td>
                      <td className="px-5 py-3"><StatusPill label={meta.label} tone={meta.tone} /></td>
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
