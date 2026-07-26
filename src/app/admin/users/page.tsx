import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { getAdminUsers } from "@/lib/data/dashboard";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray"> = {
  active: "green",
  pending: "amber",
  rejected: "red",
  suspended: "red",
};

export default async function AdminUsersPage() {
  const rows = await getAdminUsers();

  return (
    <>
      <PageHeading title="Users" description="Buyers and sellers on the platform." />

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No users yet.</td></tr>
              )}
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <StatusPill label={u.role} tone={u.role === "seller" ? "indigo" : "gray"} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(u.joined).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={u.status} tone={STATUS_TONE[u.status] ?? "gray"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
