import Link from "next/link";
import { Heart, MessageSquare, User } from "lucide-react";
import { Container } from "@/components/shared/container";
import { getSessionUser } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { PRIMARY_NAV } from "./nav-links";

/** Sticky top navigation — Section header of the mock. */
export async function Header() {
  const user = await getSessionUser();
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
          {user ? (
            <>
              <Link
                href="/messages"
                aria-label="Messages"
                className="hidden size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted sm:grid"
              >
                <MessageSquare className="size-5" />
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className="hidden size-9 place-items-center rounded-full bg-ink text-xs font-bold text-white transition-opacity hover:opacity-90 sm:grid"
              >
                {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className="grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted sm:hidden"
              >
                <User className="size-5" />
              </Link>
            </>
          )}
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
