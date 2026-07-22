import Link from "next/link";
import { Heart, User } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
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

        <SearchBar className="ml-auto hidden max-w-md flex-1 md:block" />

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
          <CartButton />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
