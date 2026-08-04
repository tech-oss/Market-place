import { PageHeading } from "@/features/dashboard/ui";
import { CommissionForm } from "@/features/dashboard/commission-form";
import { ReturnSettingsForm } from "@/features/dashboard/return-settings-form";
import { getCommissionPct, getPlatformSettings } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  const [pct, settings] = await Promise.all([getCommissionPct(), getPlatformSettings()]);
  const live = isSupabaseConfigured();
  return (
    <>
      <PageHeading
        title="Commission & Returns"
        description="Set the platform's flat commission, and where buyers ship returns back to."
      />
      <div className="space-y-6">
        <CommissionForm initialPct={pct} live={live} />
        <ReturnSettingsForm initial={settings} live={live} />
      </div>
    </>
  );
}
