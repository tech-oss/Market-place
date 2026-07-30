import { PageHeading } from "@/features/dashboard/ui";
import { ListingsBoard } from "@/features/dashboard/listings-board";
import { getCurrentSeller, getSellerListings } from "@/lib/data/dashboard";
import { getBikeMakes } from "@/lib/data/products";

export default async function SellerListingsPage() {
  const [listings, seller, bikeMakes] = await Promise.all([
    getSellerListings(),
    getCurrentSeller(),
    getBikeMakes(),
  ]);
  return (
    <>
      <PageHeading title="Listings" description="Manage your products, stock and inventory labels." />
      <ListingsBoard initial={listings} live={Boolean(seller)} bikeMakes={bikeMakes} />
    </>
  );
}
