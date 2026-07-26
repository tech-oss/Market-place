import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getUnreadTotal } from "@/lib/data/chat";
import { getCurrentSeller } from "@/lib/data/dashboard";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Seller Center",
  robots: { index: false },
};

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user && user.role !== "seller" && user.role !== "admin") redirect("/account");

  const [unread, seller] = await Promise.all([getUnreadTotal(), getCurrentSeller()]);
  const accountName = seller?.name || user?.fullName || undefined;
  const accountInitials = accountName
    ? accountName
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : undefined;

  return (
    <DashboardShell role="seller" messagesUnread={unread} accountName={accountName} accountInitials={accountInitials}>
      {children}
    </DashboardShell>
  );
}
