import Link from "next/link";
import { Gift, GraduationCap, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Logo } from "./logo";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Parts", href: "/parts" },
      { label: "Categories", href: "/categories" },
      { label: "New Arrivals", href: "/parts?sort=newest" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Contact Us", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

const NEWSLETTER_PERKS = [
  { icon: Gift, title: "Exclusive Deals", body: "Special offers for subscribers" },
  { icon: Sparkles, title: "New Arrivals", body: "Be the first to know about new parts" },
  { icon: GraduationCap, title: "Expert Tips", body: "Maintenance tips and part guides" },
];

const PAYMENTS = ["VISA", "Mastercard", "SnapScan", "PayFast"];

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <Container className="grid gap-8 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Stay in the loop</h2>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Get the latest parts, offers and updates straight to your inbox.
            </p>
            <form className="mt-5 flex max-w-md overflow-hidden rounded-lg bg-white/10 p-1">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                aria-label="Email address"
                className="flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {NEWSLETTER_PERKS.map((perk) => (
              <div key={perk.title} className="flex flex-col gap-2">
                <perk.icon className="size-5 text-brand" />
                <p className="text-sm font-semibold text-white">{perk.title}</p>
                <p className="text-xs text-white/50">{perk.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Link columns */}
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm text-white/50">
            South Africa&rsquo;s most trusted marketplace for new and used
            motorcycle parts, protected by Buyer Protection payments.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="text-sm font-semibold text-white">Follow Us</h3>
          <div className="mt-4 flex gap-3">
            {[
              { label: "Facebook", short: "f" },
              { label: "Instagram", short: "IG" },
              { label: "YouTube", short: "YT" },
              { label: "TikTok", short: "TT" },
            ].map((s) => (
              <Link
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-bold text-white/70 transition-colors hover:bg-brand hover:text-white"
              >
                {s.short}
              </Link>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold text-white">Secure Payments</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {PAYMENTS.map((p) => (
              <span
                key={p}
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white/70"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Motorcycle Products Marketplace (Pty) Ltd. All rights reserved.</p>
          <p>Made in South Africa 🇿🇦</p>
        </Container>
      </div>
    </footer>
  );
}
