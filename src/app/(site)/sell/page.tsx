import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  Infinity as InfinityIcon,
  Printer,
  Truck,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Sell With Us",
  description:
    "Sell new and used motorcycle parts to buyers across South Africa. Unlimited free listings, secure escrow payouts, and printable inventory labels.",
};

const BENEFITS = [
  { icon: InfinityIcon, title: "Unlimited Free Listings", body: "List as many parts as you like at no cost. You only pay a flat 7% commission when an item sells." },
  { icon: Truck, title: "Your Shipping, Your Way", body: "Set your own shipping cost per order and choose your preferred courier — PUDO, The Courier Guy, Aramex and more." },
  { icon: Printer, title: "Printable Inventory Labels", body: "Generate barcode / QR labels for every listing to keep your warehouse and stock perfectly organised." },
  { icon: Wallet, title: "Secure, Fast Payouts", body: "Buyers pay into escrow. Funds land in your wallet as soon as the buyer confirms delivery." },
  { icon: BadgeCheck, title: "Verified Seller Badge", body: "Approved businesses earn a trust badge that helps you win more sales." },
  { icon: FileCheck2, title: "Simple Onboarding", body: "Register your business, upload your documents, and go live once approved." },
];

const STEPS = [
  { n: 1, title: "Register your business", body: "Tell us about your dealership, scrapyard or workshop." },
  { n: 2, title: "Upload your documents", body: "Provide a valid ID and proof of residence for verification (FICA)." },
  { n: 3, title: "Get approved", body: "Our team reviews and activates your account — usually within 48 hours." },
  { n: 4, title: "List & sell", body: "Add products with fitment, print labels, and start earning." },
];

export default function SellPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src="/img/workshop.jpg" alt="" fill sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/50" />
        <Container className="relative py-16 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
              GROW YOUR PARTS BUSINESS
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Sell to riders across South Africa
            </h1>
            <p className="mt-4 max-w-lg text-white/70">
              Join hundreds of trusted sellers on the country&rsquo;s leading motorcycle
              parts marketplace. Unlimited free listings, escrow-protected payouts, and
              a flat 7% commission — no monthly fees.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register?role=seller"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Start Selling Today <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Commission highlight */}
      <section className="border-b border-border bg-neutral-50">
        <Container className="grid gap-6 py-10 text-center sm:grid-cols-3">
          {[
            { value: "7%", label: "Flat commission per sale" },
            { value: "R0", label: "Listing & monthly fees" },
            { value: "48h", label: "Typical approval time" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-foreground">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Benefits */}
      <Container className="py-14">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Everything you need to sell more
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={Math.min(i, 6) * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <b.icon className="size-5" />
                </span>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* How to start */}
      <section className="bg-neutral-50 py-14">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Start selling in 4 steps
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-10 place-items-center rounded-full border-2 border-brand text-sm font-black text-brand">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/register?role=seller"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
            >
              Create your seller account <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
