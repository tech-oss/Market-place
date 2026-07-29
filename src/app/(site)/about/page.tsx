import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Prose } from "@/components/shared/prose";
import { getPlatformStats } from "@/lib/data/dashboard";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Motorcycle Products is South Africa's trusted marketplace for new and used motorcycle parts, built on escrow-protected payments.",
};

export default async function AboutPage() {
  const platformStats = await getPlatformStats();
  return (
    <>
      <PageHeader
        title="About Motorcycle Products"
        description="We're on a mission to make buying and selling motorcycle parts in South Africa safe, simple and fair."
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />
      <Container className="py-12">
        <Prose>
          <h2>Why we exist</h2>
          <p>
            For years, buying used motorcycle parts in South Africa meant taking a
            leap of faith — paying by EFT and hoping the part turned up. We built
            Motorcycle Products to end that. Every transaction is protected by an{" "}
            <strong>escrow system</strong>: your money is held safely and only released
            to the seller once you&rsquo;ve received your part and confirmed you&rsquo;re happy.
          </p>

          <h2>Who sells here</h2>
          <p>
            Dealerships, used parts dealers, workshops and individual riders all list on
            Motorcycle Products. Every seller is manually verified — including a valid
            ID, proof of residence and proof of banking — before they can go live, so you
            always know who you&rsquo;re buying from.
          </p>

          <h2>Built for riders</h2>
          <p>
            From exact fitment data and OEM part numbers to nationwide courier delivery,
            everything on the platform is designed to help you find the right part and
            get back on the road faster.
          </p>
        </Prose>

        <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl bg-ink p-6 text-center sm:grid-cols-4">
          {platformStats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-black text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
