import { PageHeading } from "@/features/dashboard/ui";
import { ListingsBoard } from "@/features/dashboard/listings-board";
import { getCurrentSeller, getSellerListings } from "@/lib/data/dashboard";

export default async function SellerListingsPage() {
  const [listings, seller] = await Promise.all([getSellerListings(), getCurrentSeller()]);
  return (
    <>
      <PageHeading title="Listings" description="Manage your products, stock and inventory labels." />
      <ListingsBoard initial={listings} live={Boolean(seller)} />
    </>
  );
}
