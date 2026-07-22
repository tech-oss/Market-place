import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGrid } from "@/components/shared/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { allProducts } from "@/mocks";
import {
  CatalogFilters,
  CatalogSort,
  MobileFilters,
} from "@/features/catalog/catalog-filters";
import { filterProducts, type CatalogParams } from "@/features/catalog/filter";

export const metadata: Metadata = {
  title: "Shop Motorcycle Parts",
  description:
    "Browse thousands of new and used motorcycle parts from verified South African sellers.",
};

export default async function PartsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}) {
  const params = await searchParams;
  const products = filterProducts(allProducts, params);

  return (
    <>
      <PageHeader
        title="Shop Parts"
        description="New and used motorcycle parts from verified sellers across South Africa."
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop Parts" }]}
      />

      <Container className="py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <CatalogFilters />
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MobileFilters />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{products.length}</span>{" "}
                  {products.length === 1 ? "result" : "results"}
                  {params.q && (
                    <>
                      {" "}for <span className="font-semibold text-foreground">“{params.q}”</span>
                    </>
                  )}
                </p>
              </div>
              <CatalogSort />
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No parts match your filters"
                description="Try removing a filter or broadening your search."
                action={{ label: "Clear filters", href: "/parts" }}
              />
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
