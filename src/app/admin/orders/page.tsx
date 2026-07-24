import { formatZAR } from "@/lib/format";
import { PageHeading } from "@/features/dashboard/ui";
import { EscrowBoard } from "@/features/dashboard/escrow-board";
import { getAdminOrders, getCommissionPct } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminOrdersPage() {
  const [orders, pct] = await Promise.all([getAdminOrders(), getCommissionPct()]);
  const held = orders.filter((o) => o.escrow === "held");
  const heldValue = held.reduce((s, o) => s + o.totalCents, 0);

  return (
    <>
      <PageHeading
        title="Orders & Escrow"
        description={`${formatZAR(heldValue)} currently held across ${held.length} orders.`}
      />
      <EscrowBoard initial={orders} commissionPct={pct} live={isSupabaseConfigured()} />
    </>
  );
}
