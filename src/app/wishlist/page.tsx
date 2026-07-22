import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGrid } from "@/components/shared/product-grid";
import { featuredProducts } from "@/mocks";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Parts you've saved for later.",
};

export default function WishlistPage() {
  // Demo: a few saved items. Wishlist persistence lands in Step 3.
  const saved = featuredProducts.slice(0, 3);

  return (
    <>
      <PageHeader
        title="Your Wishlist"
        description="Parts you've saved for later."
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <Container className="py-10">
        <ProductGrid products={saved} />
      </Container>
    </>
  );
}
