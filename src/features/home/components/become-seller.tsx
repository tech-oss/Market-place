import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleDollarSign, Rocket, Users } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";

const PERKS = [
  { icon: Users, label: "Reach more buyers" },
  { icon: Rocket, label: "Easy listing & management" },
  { icon: CircleDollarSign, label: "Secure & fast payouts" },
];

/** Section 09 — Become a Seller banner. */
export function BecomeSeller() {
  return (
    <section className="py-12">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink">
            <Image
              src="/img/workshop.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
            <div className="relative grid gap-6 p-8 sm:p-12 lg:max-w-2xl">
              <h2 className="text-3xl font-black text-white sm:text-4xl">Become a Seller</h2>
              <p className="max-w-lg text-white/70">
                Join hundreds of trusted sellers and grow your business with South
                Africa&rsquo;s leading motorcycle parts marketplace.
              </p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {PERKS.map((p) => (
                  <li key={p.label} className="flex items-center gap-2 text-sm text-white/80">
                    <p.icon className="size-4 text-brand" />
                    {p.label}
                  </li>
                ))}
              </ul>
              <div>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Start Selling Today
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
