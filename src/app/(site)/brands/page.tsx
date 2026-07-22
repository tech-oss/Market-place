import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { brands } from "@/mocks";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = {
  title: "Brands",
  description: "Browse motorcycle parts by brand — BMW, Yamaha, Honda, KTM, Suzuki and more.",
};

export default function BrandsPage() {
  return (
    <>
      <PageHeader
        title="Browse by Brand"
        description="Shop parts for all major motorcycle brands."
        crumbs={[{ label: "Home", href: "/" }, { label: "Brands" }]}
      />
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <Reveal key={brand.slug} delay={Math.min(i, 8) * 0.04}>
              <Link
                href={`/parts?brand=${brand.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-muted text-sm font-black tracking-tight text-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  {brand.logo}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(brand.partCount)}+ Parts
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
