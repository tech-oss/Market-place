import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { CompactProductCard } from "@/components/shared/compact-product-card";
import { recentProducts } from "@/mocks";

/** Section 05 — Recently Added. */
export function RecentlyAdded() {
  return (
    <section className="py-12">
      <Container>
        <SectionHeading
          title="Recently Added"
          href="/parts?sort=newest"
          linkLabel="View all listings"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {recentProducts.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.05}>
              <CompactProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
