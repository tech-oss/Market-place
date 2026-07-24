import { PageHeading } from "@/features/dashboard/ui";
import { ApprovalsBoard } from "@/features/dashboard/approvals-board";
import { getSellerApplications } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminSellersPage() {
  const apps = await getSellerApplications();
  const pending = apps.filter((a) => a.status === "pending").length;

  return (
    <>
      <PageHeading
        title="Seller Approvals"
        description={`${pending} application${pending === 1 ? "" : "s"} awaiting review.`}
      />
      <ApprovalsBoard initial={apps} live={isSupabaseConfigured()} />
    </>
  );
}
