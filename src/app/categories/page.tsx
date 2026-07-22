import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { PartImage } from "@/components/shared/part-image";
import { Reveal } from "@/components/shared/reveal";
import { categories } from "@/mocks";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = {
  title: "Categories",
  description: "Shop motorcycle parts by category — brakes, engine, exhaust, suspension and more.",
};

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        title="Shop by Category"
        description="Find exactly what you need across every part category."
        crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />
      <Container className="py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} delay={Math.min(i, 8) * 0.04}>
              <Link
                href={`/parts?category=${cat.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
              >
                <PartImage
                  seed={cat.slug}
                  alt={cat.name}
                  dark
                  className="size-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-semibold text-white">{cat.name}</p>
                  <p className="text-xs text-white/60">{formatCount(cat.partCount)} parts</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
