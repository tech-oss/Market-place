import {
  Hero,
  BrandStrip,
  CategoryGrid,
  FeaturedProducts,
  RecentlyAdded,
  WhyBuy,
  HowItWorks,
  TopSellers,
  BecomeSeller,
} from "@/features/home";
import { getPlatformStats, getTopSellers } from "@/lib/data/dashboard";
import { getFitmentFacets } from "@/lib/data/products";

export default async function HomePage() {
  const [stats, topSellers, facets] = await Promise.all([
    getPlatformStats(),
    getTopSellers(),
    getFitmentFacets(),
  ]);
  return (
    <>
      <Hero stats={stats} facets={facets} />
      <BrandStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <RecentlyAdded />
      <WhyBuy />
      <HowItWorks />
      <TopSellers sellers={topSellers} />
      <BecomeSeller />
    </>
  );
}
