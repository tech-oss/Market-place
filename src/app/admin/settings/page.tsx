import { PageHeading } from "@/features/dashboard/ui";
import { CommissionForm } from "@/features/dashboard/commission-form";
import { ReturnSettingsForm } from "@/features/dashboard/return-settings-form";
import { PaymentSettingsForm } from "@/features/dashboard/payment-settings-form";
import { getCommissionPct, getPaymentSettings, getPlatformSettings } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  const [pct, settings, paymentSettings] = await Promise.all([
    getCommissionPct(),
    getPlatformSettings(),
    getPaymentSettings(),
  ]);
  const live = isSupabaseConfigured();
  return (
    <>
      <PageHeading
        title="Commission & Returns"
        description="Set the platform's flat commission, where buyers ship returns back to, and how buyers can pay."
      />
      <div className="space-y-6">
        <PaymentSettingsForm initial={paymentSettings} live={live} />
        <CommissionForm initialPct={pct} live={live} />
        <ReturnSettingsForm initial={settings} live={live} />
      </div>
    </>
  );
}
