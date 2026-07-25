import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { getUnreadTotal } from "@/lib/data/chat";

export const metadata: Metadata = {
  title: "Seller Center",
  robots: { index: false },
};

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const unread = await getUnreadTotal();
  return <DashboardShell role="seller" messagesUnread={unread}>{children}</DashboardShell>;
}
