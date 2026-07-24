import { PageHeading } from "@/features/dashboard/ui";
import { CommissionForm } from "@/features/dashboard/commission-form";
import { getCommissionPct } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  const pct = await getCommissionPct();
  return (
    <>
      <PageHeading title="Commission" description="Set the platform's flat commission on each completed sale." />
      <CommissionForm initialPct={pct} live={isSupabaseConfigured()} />
    </>
  );
}
