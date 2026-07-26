import Link from "next/link";
import { Package, Receipt, TrendingUp, Wallet } from "lucide-react";
import { formatZAR } from "@/lib/format";
import { PageHeading, StatCard, SectionCard, StatusPill, MiniBarChart } from "@/features/dashboard/ui";
import { ORDER_STATUS_META } from "@/features/dashboard/status";
import { sellerSalesTrend } from "@/mocks/dashboard";
import { getCurrentSeller, getSellerListings, getSellerOrders, getWallet } from "@/lib/data/dashboard";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  return (
    <>
      <PageHeading title="Overview" description={`Welcome back, ${seller?.name ?? "RideFast Motorcycles"}.`}>
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
        <StatCard label="Orders in Escrow" value={String(inEscrow)} icon={Receipt} trend={{ value: "2 new", up: true }} />
        <StatCard label="Wallet Balance" value={formatZAR(walletBalanceCents)} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard title="Sales — last 7 days" className="lg:col-span-2">
          <div className="p-5">
            <MiniBarChart data={sellerSalesTrend} labels={DAY_LABELS} />
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
