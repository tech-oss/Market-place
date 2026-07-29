import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { DocWarningBanner } from "@/features/dashboard/doc-warning-banner";
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

  // Only nag unverified sellers who still owe documents. An already-active
  // seller (incl. admin-override approvals) never sees the banner.
  const missing: string[] = [];
  if (seller && seller.status !== "active") {
    if (!seller.id_doc_url) missing.push("ID document");
    if (!seller.proof_of_residence_url) missing.push("proof of residence");
    if (!seller.proof_of_banking_url) missing.push("proof of banking");
  }

  return (
    <DashboardShell role="seller" messagesUnread={unread} accountName={accountName} accountInitials={accountInitials}>
      <DocWarningBanner missing={missing} />
      {children}
    </DashboardShell>
  );
}
