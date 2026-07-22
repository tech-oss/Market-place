"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRIMARY_NAV } from "./nav-links";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="grid size-9 place-items-center rounded-md text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Logo />
        </SheetHeader>

        <div className="p-4">
          <SearchBar onSubmitted={() => setOpen(false)} />
        </div>

        <nav className="flex flex-col px-2">
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
