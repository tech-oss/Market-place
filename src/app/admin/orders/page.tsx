import { PageHeading } from "@/features/dashboard/ui";
import { EscrowBoard } from "@/features/dashboard/escrow-board";
import { getAdminOrders, getCommissionPct } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminOrdersPage() {
  const [orders, pct] = await Promise.all([getAdminOrders(), getCommissionPct()]);

  return (
    <>
      <PageHeading title="Orders & Buyer Protection" description="Fulfil orders and track buyer protection status." />
      <EscrowBoard initial={orders} commissionPct={pct} live={isSupabaseConfigured()} />
    </>
  );
}
