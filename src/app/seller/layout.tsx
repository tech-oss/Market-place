import type { Metadata } from "next";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Seller Center",
  robots: { index: false },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="seller">{children}</DashboardShell>;
}
