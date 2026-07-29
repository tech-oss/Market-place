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

export default async function HomePage() {
  const [stats, topSellers] = await Promise.all([getPlatformStats(), getTopSellers()]);
  return (
    <>
      <Hero stats={stats} />
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
