import { PageHeading } from "@/features/dashboard/ui";
import { SellerOrdersBoard } from "@/features/dashboard/orders-board";
import { getCommissionPct, getCurrentSeller, getSellerOrders } from "@/lib/data/dashboard";

export default async function SellerOrdersPage() {
  const [orders, seller, commissionPct] = await Promise.all([
    getSellerOrders(),
    getCurrentSeller(),
    getCommissionPct(),
  ]);
  return (
    <>
      <PageHeading title="Orders" description="Fulfil orders and track buyer protection status." />
      <SellerOrdersBoard initial={orders} live={Boolean(seller)} commissionPct={commissionPct} />
    </>
  );
}
