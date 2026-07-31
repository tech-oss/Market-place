import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getCommissionPct } from "@/lib/data/dashboard";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about buying, selling, payments and delivery.",
};

function faqGroups(pct: number) { return [
  {
    title: "Buying",
    items: [
      { q: "How does Buyer Protection protect me?", a: "When you pay, we hold your money securely. The seller is only paid once you've received the part and confirmed you're happy. If something goes wrong, you're covered." },
      { q: "How do I know a part fits my bike?", a: "Every listing shows compatible make, model and year plus the OEM part number. Always cross-check the OEM number against your vehicle before buying." },
      { q: "What if the part isn't as described?", a: "Open a dispute from your order within 7 days of delivery. If it's not resolved, we refund you from your Buyer Protection hold." },
    ],
  },
  {
    title: "Selling",
    items: [
      { q: "How much does it cost to sell?", a: `Listing is free and unlimited. We charge a flat ${pct}% commission only when an item sells.` },
      { q: "What do I need to register as a seller?", a: "A valid ID and proof of residence. Our team verifies these before activating your account, usually within 48 hours." },
      { q: "Can I print inventory labels?", a: "Yes — every listing can generate a printable barcode / QR label to help you manage stock." },
    ],
  },
  {
    title: "Payments & Delivery",
    items: [
      { q: "When do sellers get paid?", a: "Funds are released to the seller's wallet as soon as the buyer confirms delivery." },
      { q: "Who handles shipping?", a: "Sellers set their own shipping cost and choose a courier such as PUDO, The Courier Guy or Aramex. You'll see the cost at checkout." },
    ],
  },
]; }

export default async function HelpPage() {
  const FAQ_GROUPS = faqGroups(await getCommissionPct());
  return (
    <>
      <PageHeader
        title="Help Center"
        description="Answers to the questions we hear most."
        crumbs={[{ label: "Home", href: "/" }, { label: "Help Center" }]}
      />
      <Container className="py-12">
        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="mb-4 text-xl font-bold text-foreground">{group.title}</h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                      {item.q}
                      <span className="text-muted-foreground transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-neutral-50 p-6 text-center">
          <p className="font-semibold text-foreground">Still need help?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Our team is happy to assist with anything not covered here.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            Contact Support
          </Link>
        </div>
      </Container>
    </>
  );
}
