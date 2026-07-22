import {
  BadgeCheck,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const REASONS = [
  { icon: ShieldCheck, title: "Buyer Protection", body: "Your payments are held securely until you confirm delivery." },
  { icon: BadgeCheck, title: "Verified Sellers", body: "Every seller is manually verified by our team." },
  { icon: PackageCheck, title: "Quality Parts", body: "We ensure parts are genuine and as described." },
  { icon: Truck, title: "Nationwide Delivery", body: "Fast, reliable delivery anywhere in South Africa." },
  { icon: RotateCcw, title: "Easy Returns", body: "Not happy? Return within 7 days for a full refund." },
];

/** Section 06 — Why Buy From Us. */
export function WhyBuy() {
  return (
    <section className="py-12">
      <Container>
        <SectionHeading title="Why Buy From Motorcycle Products" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.05}>
              <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <r.icon className="size-5" />
                </span>
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
