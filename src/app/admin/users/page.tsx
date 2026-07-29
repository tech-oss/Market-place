import { PageHeading } from "@/features/dashboard/ui";
import { AdminUsersBoard } from "@/features/dashboard/admin-users-board";
import { getAdminUsers } from "@/lib/data/dashboard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminUsersPage() {
  const rows = await getAdminUsers();

  return (
    <>
      <PageHeading title="Users" description="Buyers and sellers on the platform." />
      <AdminUsersBoard initial={rows} live={isSupabaseConfigured()} />
    </>
  );
}
