import { PageHeading } from "@/features/dashboard/ui";
import { ListingsBoard } from "@/features/dashboard/listings-board";
import { getCurrentSeller, getSellerListings } from "@/lib/data/dashboard";
import { getBikeMakes, getBikeModelsCatalog, getCategories } from "@/lib/data/products";

export default async function SellerListingsPage() {
  const [listings, seller, bikeMakes, bikeModels, categories] = await Promise.all([
    getSellerListings(),
    getCurrentSeller(),
    getBikeMakes(),
    getBikeModelsCatalog(),
    getCategories(),
  ]);
  return (
    <>
      <PageHeading title="Listings" description="Manage your products, stock and inventory labels." />
      <ListingsBoard initial={listings} live={Boolean(seller)} bikeMakes={bikeMakes} bikeModels={bikeModels} categories={categories} />
    </>
  );
}
