import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { StarRating } from "@/components/shared/star-rating";
import { formatCount } from "@/lib/format";

interface TopSeller {
  id: string;
  name: string;
  slug: string;
  logo: string;
  location: string;
  rating: number;
  reviewCount: number;
  partCount: number;
  verified: boolean;
}

/** Section 08 — Top Sellers. */
export function TopSellers({ sellers }: { sellers: TopSeller[] }) {
  if (sellers.length === 0) return null;
  return (
    <section className="py-12">
      <Container>
        <SectionHeading title="Top Sellers" href="/sellers" linkLabel="View all sellers" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {sellers.map((seller, i) => (
            <Reveal key={seller.id} delay={i * 0.05}>
              <Link
                href={`/sellers/${seller.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid size-14 place-items-center rounded-full bg-ink text-base font-black text-white">
                  {seller.logo}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  {seller.name}
                  {seller.verified && <BadgeCheck className="size-3.5 text-brand" />}
                </span>
                <span className="text-xs text-muted-foreground">{seller.location}</span>
                <StarRating rating={seller.rating} count={seller.reviewCount} size={13} />
                <span className="text-xs text-muted-foreground">
                  {formatCount(seller.partCount)} Parts
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
