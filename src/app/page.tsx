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

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStrip />
      <CategoryGrid />
      <FeaturedProducts />
      <RecentlyAdded />
      <WhyBuy />
      <HowItWorks />
      <TopSellers />
      <BecomeSeller />
    </>
  );
}
