import { PageHeading } from "@/features/dashboard/ui";
import { YmmRequestsBoard } from "@/features/dashboard/ymm-requests-board";
import { getYmmRequests } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminYmmRequestsPage() {
  const requests = await getYmmRequests();

  return (
    <>
      <PageHeading
        title="YMM Requests"
        description={`${requests.length} seller-proposed make/model/year${requests.length === 1 ? "" : "s"} awaiting review.`}
      />
      <YmmRequestsBoard initial={requests} live={isSupabaseConfigured()} />
    </>
  );
}
