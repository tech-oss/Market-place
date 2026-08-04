import { PageHeading } from "@/features/dashboard/ui";
import { EscrowBoard } from "@/features/dashboard/escrow-board";
import { getAdminOrders, getCommissionPct, getPlatformSettings } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminOrdersPage() {
  const [orders, pct, settings] = await Promise.all([
    getAdminOrders(),
    getCommissionPct(),
    getPlatformSettings(),
  ]);

  return (
    <>
      <PageHeading
        title="Orders & Buyer Protection"
        description="Track every order and release held payments manually once you're satisfied."
      />
      <EscrowBoard
        initial={orders}
        commissionPct={pct}
        releaseAfterDays={settings.returnWindowDays}
        live={isSupabaseConfigured()}
      />
    </>
  );
}
