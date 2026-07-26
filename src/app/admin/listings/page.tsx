import { PageHeading } from "@/features/dashboard/ui";
import { AdminListingsBoard } from "@/features/dashboard/admin-listings-board";
import { getAdminListings } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminListingsPage() {
  const listings = await getAdminListings();
  return (
    <>
      <PageHeading title="Listings" description="Moderate products listed across the marketplace." />
      <AdminListingsBoard initial={listings} live={isSupabaseConfigured()} />
    </>
  );
}
