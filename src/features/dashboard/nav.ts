import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  LayoutDashboard,
  MessageSquare,
  Package,
  Percent,
  Receipt,
  ShieldCheck,
  Store,
  Tag,
  Users,
  Wallet,
} from "lucide-react";

export interface DashNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const SELLER_NAV: DashNavItem[] = [
  { label: "Overview", href: "/seller", icon: LayoutDashboard },
  { label: "Listings", href: "/seller/listings", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: Receipt },
  { label: "Messages", href: "/seller/messages", icon: MessageSquare },
  { label: "Wallet", href: "/seller/wallet", icon: Wallet },
  { label: "Business Profile", href: "/seller/profile", icon: BadgeCheck },
];

export const ADMIN_NAV: DashNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Seller Approvals", href: "/admin/sellers", icon: ShieldCheck },
  { label: "Orders & Escrow", href: "/admin/orders", icon: Receipt },
  { label: "Conversations", href: "/admin/messages", icon: MessageSquare },
  { label: "Listings", href: "/admin/listings", icon: Tag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Commission", href: "/admin/settings", icon: Percent },
];

export const DASH_META = {
  seller: { title: "Seller Center", icon: Store, home: "/seller", nav: SELLER_NAV },
  admin: { title: "Admin Console", icon: ShieldCheck, home: "/admin", nav: ADMIN_NAV },
} as const;
