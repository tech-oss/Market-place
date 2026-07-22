import { ChevronRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const STEPS = [
  { n: 1, title: "Find Your Part", body: "Search by bike, part or part number." },
  { n: 2, title: "Place Your Order", body: "We hold your payment securely." },
  { n: 3, title: "Seller Ships", body: "Seller ships your part with tracking." },
  { n: 4, title: "Confirm Delivery", body: "Inspect and confirm your order." },
  { n: 5, title: "Payment Released", body: "We release payment to the seller." },
];

/** Section 07 — How It Works (escrow flow). */
export function HowItWorks() {
  return (
    <section className="bg-neutral-50 py-12">
      <Container>
        <SectionHeading title="How It Works" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.06}>
              <div className="relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <span className="grid size-10 place-items-center rounded-full border-2 border-brand text-sm font-black text-brand">
                  {step.n}
                </span>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.body}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 hidden size-6 -translate-y-1/2 text-border lg:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
