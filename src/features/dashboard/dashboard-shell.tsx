"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessagesNotifier } from "@/components/layout/messages-notifier";
import { signOut } from "@/features/auth/actions";
import { DASH_META } from "./nav";

export function DashboardShell({
  role,
  children,
  messagesUnread = 0,
  accountName,
  accountInitials,
}: {
  role: "seller" | "admin";
  children: React.ReactNode;
  messagesUnread?: number;
  accountName?: string;
  accountInitials?: string;
}) {
  const meta = DASH_META[role];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const RoleIcon = meta.icon;

  const isActive = (href: string) =>
    href === meta.home ? pathname === href : pathname.startsWith(href);

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="grid size-8 place-items-center rounded-md bg-brand text-brand-foreground">
          <RoleIcon className="size-4" />
        </span>
        <div className="leading-none">
          <p className="text-sm font-bold text-white">{meta.title}</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Motorcycle Products
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {meta.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-brand text-brand-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
            {item.href.endsWith("/messages") && messagesUnread > 0 && (
              <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-brand-foreground">
                {messagesUnread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to store
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 text-white/70 hover:text-white"
            >
              <X className="size-5" />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {accountName ?? (role === "seller" ? "RideFast Motorcycles" : "Platform Admin")}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">
              {accountInitials ?? (role === "seller" ? "RF" : "AD")}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {role === "seller" && <MessagesNotifier initialUnread={messagesUnread} />}
    </div>
  );
}
