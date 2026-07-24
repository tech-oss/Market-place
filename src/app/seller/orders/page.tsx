import { PageHeading } from "@/features/dashboard/ui";
import { SellerOrdersBoard } from "@/features/dashboard/orders-board";
import { getCurrentSeller, getSellerOrders } from "@/lib/data/dashboard";

export default async function SellerOrdersPage() {
  const [orders, seller] = await Promise.all([getSellerOrders(), getCurrentSeller()]);
  return (
    <>
      <PageHeading title="Orders" description="Fulfil orders and track escrow status." />
      <SellerOrdersBoard initial={orders} live={Boolean(seller)} />
    </>
  );
}
