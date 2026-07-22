import Link from "next/link";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { PartImage } from "@/components/shared/part-image";
import { categories } from "@/mocks";
import { formatCount } from "@/lib/format";

/** Section 03 — Shop by Category (dark image tiles). */
export function CategoryGrid() {
  return (
    <section className="py-10">
      <Container>
        <SectionHeading
          title="Shop by Category"
          href="/categories"
          linkLabel="View all categories"
        />
        <Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/parts?category=${cat.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                <PartImage
                  seed={cat.slug}
                  alt={cat.name}
                  dark
                  className="size-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold text-white">{cat.name}</p>
                  <p className="text-xs text-white/60">
                    {formatCount(cat.partCount)} parts
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
