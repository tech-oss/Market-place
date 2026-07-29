import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { StarRating } from "@/components/shared/star-rating";
import { Reveal } from "@/components/shared/reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { Store } from "lucide-react";
import { getPublicSellers } from "@/lib/data/dashboard";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = {
  title: "Verified Sellers",
  description: "Browse verified motorcycle parts sellers across South Africa.",
};

export default async function SellersPage() {
  const sellers = await getPublicSellers();
  return (
    <>
      <PageHeader
        title="Verified Sellers"
        description="Every seller is manually verified before going live — buy with confidence."
        crumbs={[{ label: "Home", href: "/" }, { label: "Sellers" }]}
      />
      <Container className="py-10">
        {sellers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No verified sellers yet"
            description="Approved sellers will appear here once they go live on the marketplace."
          />
        ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller, i) => (
            <Reveal key={seller.id} delay={Math.min(i, 6) * 0.05}>
              <Link
                href={`/sellers/${seller.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-ink text-lg font-black text-white">
                  {seller.logo}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 font-semibold text-foreground">
                    {seller.name}
                    {seller.verified && <BadgeCheck className="size-4 text-brand" />}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {seller.location}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <StarRating rating={seller.rating} count={seller.reviewCount} size={13} />
                    <span className="text-xs text-muted-foreground">
                      {formatCount(seller.partCount)} parts
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        )}
      </Container>
    </>
  );
}
