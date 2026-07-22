import { PageHeading, SectionCard, StatusPill } from "@/features/dashboard/ui";
import { sellers } from "@/mocks";

interface UserRow {
  name: string;
  email: string;
  role: "Buyer" | "Seller";
  joined: string;
  status: "Active" | "Suspended";
}

const BUYERS: UserRow[] = [
  { name: "Sipho Mahlangu", email: "sipho.m@gmail.com", role: "Buyer", joined: "2025-11-02", status: "Active" },
  { name: "Danie van Wyk", email: "danie.vw@gmail.com", role: "Buyer", joined: "2026-01-18", status: "Active" },
  { name: "Thandi Khumalo", email: "thandi.k@gmail.com", role: "Buyer", joined: "2026-03-09", status: "Active" },
  { name: "Ayesha Bhana", email: "ayesha.b@gmail.com", role: "Buyer", joined: "2026-05-22", status: "Suspended" },
];

export default function AdminUsersPage() {
  const rows: UserRow[] = [
    ...sellers.map((s) => ({
      name: s.name,
      email: `${s.slug}@sellers.co.za`,
      role: "Seller" as const,
      joined: s.memberSince,
      status: "Active" as const,
    })),
    ...BUYERS,
  ];

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
              {rows.map((u) => (
                <tr key={u.email} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3">
                    <StatusPill label={u.role} tone={u.role === "Seller" ? "indigo" : "gray"} />
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(u.joined).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill label={u.status} tone={u.status === "Active" ? "green" : "red"} />
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
