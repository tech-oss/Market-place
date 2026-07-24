import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ProductCard } from "@/components/shared/product-card";
import { getFeaturedProducts } from "@/lib/data/products";

/** Section 04 — Featured Products. */
export async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts();
  return (
    <section className="bg-neutral-50 py-12">
      <Container>
        <SectionHeading
          title="Featured Products"
          href="/parts?featured=1"
          linkLabel="View all products"
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.05}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
