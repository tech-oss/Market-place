import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/shared/container";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { PRIMARY_NAV } from "./nav-links";

/** Sticky top navigation — Section header of the mock. */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative ml-auto hidden max-w-md flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search parts, brands, bikes…"
            className="h-10 rounded-full bg-muted pl-9"
            aria-label="Search"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/account"
            aria-label="Account"
            className="hidden size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted sm:grid"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted sm:grid"
          >
            <Heart className="size-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingCart className="size-5" />
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
              2
            </span>
          </Link>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
