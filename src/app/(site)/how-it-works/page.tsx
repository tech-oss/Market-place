import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getCommissionPct } from "@/lib/data/dashboard";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how Motorcycle Products' Buyer Protection marketplace works for buyers and sellers.",
};

function buyerSteps(pct: number) { return [
  { n: 1, title: "Find your part", body: "Search by motorcycle, category or OEM part number and confirm fitment." },
  { n: 2, title: "Place your order", body: "Pay securely — your money is held under Buyer Protection, not sent to the seller yet." },
  { n: 3, title: "Seller ships", body: "The seller dispatches your part with tracking via their chosen courier." },
  { n: 4, title: "Confirm delivery", body: "Inspect the part and confirm you're happy with your order." },
  { n: 5, title: "Payment released", body: `Only then do we release the funds to the seller, minus our ${pct}% commission.` },
]; }

const SELLER = [
  { n: 1, title: "Register & verify", body: "Sign up your business and upload your ID and proof of residence." },
  { n: 2, title: "Get approved", body: "Our team reviews your details and activates your seller account." },
  { n: 3, title: "List your parts", body: "Add products with fitment, condition and photos — and print inventory labels." },
  { n: 4, title: "Ship on sale", body: "When an item sells, set your shipping and dispatch it to the buyer." },
  { n: 5, title: "Get paid", body: "Funds land in your wallet as soon as the buyer confirms delivery." },
];

function Flow({ title, steps, accent }: { title: string; steps: typeof SELLER; accent: boolean }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <ol className="mt-6 space-y-4">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-black ${
                accent ? "bg-brand text-brand-foreground" : "border-2 border-brand text-brand"
              }`}
            >
              {s.n}
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function HowItWorksPage() {
  const BUYER = buyerSteps(await getCommissionPct());
  return (
    <>
      <PageHeader
        title="How It Works"
        description="A safe, simple process protected by Buyer Protection from start to finish."
        crumbs={[{ label: "Home", href: "/" }, { label: "How It Works" }]}
      />
      <Container className="py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <Flow title="For Buyers" steps={BUYER} accent />
          <Flow title="For Sellers" steps={SELLER} accent={false} />
        </div>
      </Container>
    </>
  );
}
