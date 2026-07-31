import { PageHeading } from "@/features/dashboard/ui";
import { ListingsBoard } from "@/features/dashboard/listings-board";
import { getCurrentSeller, getSellerListings } from "@/lib/data/dashboard";
import { getBikeMakes, getCategories } from "@/lib/data/products";

export default async function SellerListingsPage() {
  const [listings, seller, bikeMakes, categories] = await Promise.all([
    getSellerListings(),
    getCurrentSeller(),
    getBikeMakes(),
    getCategories(),
  ]);
  return (
    <>
      <PageHeading title="Listings" description="Manage your products, stock and inventory labels." />
      <ListingsBoard initial={listings} live={Boolean(seller)} bikeMakes={bikeMakes} categories={categories} />
    </>
  );
}
