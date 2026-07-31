"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Package, User } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountSidebar({
  displayName,
  roleLabel,
}: {
  displayName: string;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-ink text-white">
          <User className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="text-xs capitalize text-muted-foreground">{roleLabel} account</p>
        </div>
      </div>
      <nav className="mt-5 flex flex-col text-sm">
        {NAV.map((item) => {
          const active = item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
                active ? "bg-muted font-medium text-foreground" : "text-foreground/80 hover:bg-muted",
              )}
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOut} className="mt-3 border-t border-border pt-3">
        <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          Sign out
        </button>
      </form>
    </aside>
  );
}
