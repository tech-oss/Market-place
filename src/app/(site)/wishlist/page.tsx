import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Parts you've saved for later.",
};

export default function WishlistPage() {
  return (
    <>
      <PageHeader
        title="Your Wishlist"
        description="Parts you've saved for later."
        crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <Container className="py-10">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save parts you're interested in and they'll show up here."
          action={{ label: "Browse parts", href: "/parts" }}
        />
      </Container>
    </>
  );
}
