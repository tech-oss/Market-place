import Link from "next/link";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { brands } from "@/mocks";
import { formatCount } from "@/lib/format";

/** Section 02 — Browse by Brand. */
export function BrandStrip() {
  return (
    <section className="py-10">
      <Container>
        <SectionHeading title="Browse by Brand" href="/brands" linkLabel="View all brands" />
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/parts?brand=${brand.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-full bg-muted text-xs font-black tracking-tight text-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  {brand.logo}
                </span>
                <span className="text-sm font-semibold text-foreground">{brand.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatCount(brand.partCount)}+ Parts
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
