import { PageHeading } from "@/features/dashboard/ui";
import { BikeCatalogBoard } from "@/features/dashboard/bike-catalog-board";
import { getBikeMakes, getBikeModelsCatalog } from "@/lib/data/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminCatalogPage() {
  const [makes, models] = await Promise.all([
    getBikeMakes(),
    getBikeModelsCatalog({ includeInactive: true }),
  ]);

  return (
    <>
      <PageHeading
        title="Bike Catalog"
        description="Manage the makes, models and year ranges sellers can select when listing a part."
      />
      <BikeCatalogBoard initialMakes={makes} initialModels={models} live={isSupabaseConfigured()} />
    </>
  );
}
