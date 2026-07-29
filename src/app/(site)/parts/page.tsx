import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ProductGrid } from "@/components/shared/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { getCatalogProducts } from "@/lib/data/products";
import {
  CatalogFilters,
  CatalogSort,
  MobileFilters,
} from "@/features/catalog/catalog-filters";
import { SearchBar } from "@/features/catalog/search-bar";
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
  const catalog = await getCatalogProducts();
  const products = filterProducts(catalog, params);

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
            <Suspense fallback={<div className="mb-6 h-12 rounded-xl border border-input bg-muted/40" />}>
              <SearchBar />
            </Suspense>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <MobileFilters />
                <p className="truncate text-sm text-muted-foreground">
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
