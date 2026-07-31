import type {
  Category,
  MotorcycleBrand,
  Product,
  Review,
  Seller,
} from "@/types";

/** Deterministic-ish "listed at" helper for demo timestamps. */
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** --------------------------------------------------------------------------
 * Brands (Section 02 — Browse by Brand)
 * ------------------------------------------------------------------------ */
export const brands: MotorcycleBrand[] = [
  { id: "b-bmw", name: "BMW", slug: "bmw", logo: "BMW", partCount: 13480 },
  { id: "b-yamaha", name: "Yamaha", slug: "yamaha", logo: "YAM", partCount: 8230 },
  { id: "b-honda", name: "Honda", slug: "honda", logo: "HON", partCount: 7560 },
  { id: "b-ktm", name: "KTM", slug: "ktm", logo: "KTM", partCount: 6430 },
  { id: "b-suzuki", name: "Suzuki", slug: "suzuki", logo: "SUZ", partCount: 4900 },
  { id: "b-triumph", name: "Triumph", slug: "triumph", logo: "TRI", partCount: 3420 },
  { id: "b-kawasaki", name: "Kawasaki", slug: "kawasaki", logo: "KAW", partCount: 3130 },
  { id: "b-ducati", name: "Ducati", slug: "ducati", logo: "DUC", partCount: 2540 },
];

/** --------------------------------------------------------------------------
 * Categories (Section 03 — Shop by Category)
 * ------------------------------------------------------------------------ */
export const categories: Category[] = [
  { id: "c-brakes", name: "Brakes", slug: "brakes", image: "", partCount: 2140 },
  { id: "c-engine", name: "Engine", slug: "engine", image: "", partCount: 3320 },
  { id: "c-exhaust", name: "Exhaust", slug: "exhaust", image: "", partCount: 1580 },
  { id: "c-suspension", name: "Suspension", slug: "suspension", image: "", partCount: 1290 },
  { id: "c-bodywork", name: "Bodywork", slug: "bodywork", image: "", partCount: 2760 },
  { id: "c-electronics", name: "Electronics", slug: "electronics", image: "", partCount: 980 },
  { id: "c-lighting", name: "Lighting", slug: "lighting", image: "", partCount: 1120 },
  { id: "c-tyres", name: "Tyres", slug: "tyres", image: "", partCount: 860 },
  { id: "c-controls", name: "Controls", slug: "controls", image: "", partCount: 1440 },
  { id: "c-accessories", name: "Accessories", slug: "accessories", image: "", partCount: 3010 },
];

/** --------------------------------------------------------------------------
 * Sellers (Section 08 — Top Sellers)
 * ------------------------------------------------------------------------ */
export const sellers: Seller[] = [
  { id: "s-ridefast", name: "RideFast Motorcycles", slug: "ridefast-motorcycles", logo: "RF", location: "Johannesburg", status: "active", rating: 4.9, reviewCount: 412, partCount: 1248, verified: true, memberSince: "2021-03-01" },
  { id: "s-motostrip", name: "MotoStrip SA", slug: "motostrip-sa", logo: "MS", location: "Cape Town", status: "active", rating: 4.9, reviewCount: 356, partCount: 996, verified: true, memberSince: "2021-07-14" },
  { id: "s-cyclesalvage", name: "Cycle Salvage", slug: "cycle-salvage", logo: "CS", location: "Durban", status: "active", rating: 4.9, reviewCount: 295, partCount: 812, verified: true, memberSince: "2022-01-09" },
  { id: "s-probike", name: "Pro Bike Parts", slug: "pro-bike-parts", logo: "PB", location: "Pretoria", status: "active", rating: 4.8, reviewCount: 310, partCount: 1102, verified: true, memberSince: "2020-11-22" },
  { id: "s-thunder", name: "Thunder Parts", slug: "thunder-parts", logo: "TP", location: "Port Elizabeth", status: "active", rating: 4.8, reviewCount: 214, partCount: 634, verified: true, memberSince: "2022-05-30" },
  { id: "s-breakers", name: "Bike Breakers SA", slug: "bike-breakers-sa", logo: "BB", location: "Bloemfontein", status: "active", rating: 4.7, reviewCount: 189, partCount: 523, verified: true, memberSince: "2022-09-18" },
];

const sellerRef = (s: Seller) => ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  location: s.location,
  logo: s.logo,
  rating: s.rating,
});

/** --------------------------------------------------------------------------
 * Featured Products (Section 04)
 * ------------------------------------------------------------------------ */
export const featuredProducts: Product[] = [
  {
    id: "p-1", slug: "oem-brake-lever-bmw-s1000rr", title: "OEM Brake Lever",
    priceCents: 210000, condition: "excellent-used", categorySlug: "controls",
    brandName: "BMW", oemNumbers: ["32-72-8-544-207"],
    fitment: [{ brand: "BMW", model: "S1000RR", yearFrom: 2019, yearTo: 2023 }],
    images: [{ id: "p-1-i", url: "", alt: "OEM Brake Lever for BMW S1000RR" }],
    seller: sellerRef(sellers[0]), stock: 3, listedAt: daysAgo(2), isFeatured: true,
  },
  {
    id: "p-2", slug: "akrapovic-slip-on-yamaha-r1", title: "Akrapovič Slip-On",
    priceCents: 655000, condition: "good-used", categorySlug: "exhaust",
    brandName: "Yamaha", oemNumbers: ["S-Y10SO18-HAPT"],
    fitment: [{ brand: "Yamaha", model: "R1", yearFrom: 2015, yearTo: 2023 }],
    images: [{ id: "p-2-i", url: "", alt: "Akrapovič Slip-On for Yamaha R1" }],
    seller: sellerRef(sellers[1]), stock: 1, listedAt: daysAgo(4), isFeatured: true,
  },
  {
    id: "p-3", slug: "brembo-m50-caliper-set-ducati-panigale-v4", title: "Brembo M50 Caliper Set",
    priceCents: 789000, condition: "new", categorySlug: "brakes",
    brandName: "Ducati", oemNumbers: ["61340921A"],
    fitment: [{ brand: "Ducati", model: "Panigale V4", yearFrom: 2018, yearTo: 2024 }],
    images: [{ id: "p-3-i", url: "", alt: "Brembo M50 Caliper Set for Ducati Panigale V4" }],
    seller: sellerRef(sellers[2]), stock: 2, listedAt: daysAgo(1), isFeatured: true, isNew: true,
  },
  {
    id: "p-4", slug: "ohlins-ttx-gp-rear-shock-bmw-s1000rr", title: "Öhlins TTX GP Rear Shock",
    priceCents: 1290000, condition: "like-new", categorySlug: "suspension",
    brandName: "BMW", oemNumbers: ["BM-467"],
    fitment: [{ brand: "BMW", model: "S1000RR", yearFrom: 2019, yearTo: 2023 }],
    images: [{ id: "p-4-i", url: "", alt: "Öhlins TTX GP Rear Shock for BMW S1000RR" }],
    seller: sellerRef(sellers[3]), stock: 1, listedAt: daysAgo(3), isFeatured: true,
  },
  {
    id: "p-5", slug: "ktm-duke-390-headlight", title: "KTM Duke 390 Headlight",
    priceCents: 145000, condition: "used", categorySlug: "lighting",
    brandName: "KTM", oemNumbers: ["90114001000"],
    fitment: [{ brand: "KTM", model: "Duke 390", yearFrom: 2017, yearTo: 2023 }],
    images: [{ id: "p-5-i", url: "", alt: "KTM Duke 390 Headlight" }],
    seller: sellerRef(sellers[4]), stock: 4, listedAt: daysAgo(5), isFeatured: true,
  },
];

/** --------------------------------------------------------------------------
 * Recently Added (Section 05)
 * ------------------------------------------------------------------------ */
export const recentProducts: Product[] = [
  {
    id: "r-1", slug: "clutch-master-cylinder-honda-cbr1000rr", title: "Clutch Master Cylinder",
    priceCents: 120000, condition: "good-used", categorySlug: "controls", brandName: "Honda",
    oemNumbers: ["46500-MFL-006"], fitment: [{ brand: "Honda", model: "CBR 1000RR", yearFrom: 2008, yearTo: 2016 }],
    images: [{ id: "r-1-i", url: "", alt: "Clutch Master Cylinder for Honda CBR 1000RR" }],
    seller: sellerRef(sellers[0]), stock: 2, listedAt: minsAgo(2),
  },
  {
    id: "r-2", slug: "front-brake-disc-set-bmw-r1200gs", title: "Front Brake Disc Set",
    priceCents: 280000, condition: "excellent-used", categorySlug: "brakes", brandName: "BMW",
    oemNumbers: ["34117726547"], fitment: [{ brand: "BMW", model: "R1200GS", yearFrom: 2013, yearTo: 2018 }],
    images: [{ id: "r-2-i", url: "", alt: "Front Brake Disc Set for BMW R1200GS" }],
    seller: sellerRef(sellers[3]), stock: 1, listedAt: minsAgo(8),
  },
  {
    id: "r-3", slug: "fuel-pump-assembly-kawasaki-zx6r", title: "Fuel Pump Assembly",
    priceCents: 165000, condition: "good-used", categorySlug: "engine", brandName: "Kawasaki",
    oemNumbers: ["49040-0030"], fitment: [{ brand: "Kawasaki", model: "ZX6R", yearFrom: 2009, yearTo: 2016 }],
    images: [{ id: "r-3-i", url: "", alt: "Fuel Pump Assembly for Kawasaki ZX6R" }],
    seller: sellerRef(sellers[2]), stock: 1, listedAt: minsAgo(12),
  },
  {
    id: "r-4", slug: "radiator-fan-yamaha-mt07", title: "Radiator Fan",
    priceCents: 95000, condition: "used", categorySlug: "engine", brandName: "Yamaha",
    oemNumbers: ["1WS-E2405-00"], fitment: [{ brand: "Yamaha", model: "MT-07", yearFrom: 2014, yearTo: 2020 }],
    images: [{ id: "r-4-i", url: "", alt: "Radiator Fan for Yamaha MT-07" }],
    seller: sellerRef(sellers[1]), stock: 3, listedAt: minsAgo(18),
  },
  {
    id: "r-5", slug: "tail-light-led-ktm-duke-250", title: "Tail Light LED",
    priceCents: 75000, condition: "excellent-used", categorySlug: "lighting", brandName: "KTM",
    oemNumbers: ["90714010000"], fitment: [{ brand: "KTM", model: "Duke 250", yearFrom: 2017, yearTo: 2023 }],
    images: [{ id: "r-5-i", url: "", alt: "Tail Light LED for KTM Duke 250" }],
    seller: sellerRef(sellers[4]), stock: 5, listedAt: minsAgo(25),
  },
];

/** Headline platform stats (Section 01 stat bar). */
export const platformStats = [
  { label: "Parts Listed", value: "14,280+" },
  { label: "Verified Sellers", value: "468" },
  { label: "Positive Reviews", value: "98.9%" },
  { label: "Secure Payments", value: "100%" },
];

/** --------------------------------------------------------------------------
 * Additional catalog inventory (used by /parts browse & detail pages)
 * ------------------------------------------------------------------------ */
const moreProducts: Product[] = [
  {
    id: "p-6", slug: "front-fairing-kit-suzuki-gsxr750", title: "Front Fairing Kit",
    priceCents: 420000, condition: "good-used", categorySlug: "bodywork", brandName: "Suzuki",
    oemNumbers: ["94401-15H00"], fitment: [{ brand: "Suzuki", model: "GSX-R750", yearFrom: 2011, yearTo: 2020 }],
    images: [{ id: "p-6-i", url: "", alt: "Front Fairing Kit for Suzuki GSX-R750" }],
    seller: sellerRef(sellers[5]), stock: 1, listedAt: daysAgo(6),
  },
  {
    id: "p-7", slug: "chain-sprocket-kit-honda-cbr600rr", title: "Chain & Sprocket Kit",
    priceCents: 185000, condition: "new", categorySlug: "engine", brandName: "Honda",
    oemNumbers: ["06406-MFJ-D00"], fitment: [{ brand: "Honda", model: "CBR 600RR", yearFrom: 2007, yearTo: 2019 }],
    images: [{ id: "p-7-i", url: "", alt: "Chain & Sprocket Kit for Honda CBR 600RR" }],
    seller: sellerRef(sellers[0]), stock: 8, listedAt: daysAgo(7), isNew: true,
  },
  {
    id: "p-8", slug: "led-indicator-set-triumph-street-triple", title: "LED Indicator Set",
    priceCents: 65000, condition: "new", categorySlug: "lighting", brandName: "Triumph",
    oemNumbers: ["T2700730"], fitment: [{ brand: "Triumph", model: "Street Triple", yearFrom: 2013, yearTo: 2023 }],
    images: [{ id: "p-8-i", url: "", alt: "LED Indicator Set for Triumph Street Triple" }],
    seller: sellerRef(sellers[1]), stock: 12, listedAt: daysAgo(8), isNew: true,
  },
  {
    id: "p-9", slug: "rear-sprocket-ktm-1290-super-duke", title: "Rear Sprocket 42T",
    priceCents: 90000, condition: "excellent-used", categorySlug: "engine", brandName: "KTM",
    oemNumbers: ["6031005104204"], fitment: [{ brand: "KTM", model: "1290 Super Duke", yearFrom: 2014, yearTo: 2023 }],
    images: [{ id: "p-9-i", url: "", alt: "Rear Sprocket for KTM 1290 Super Duke" }],
    seller: sellerRef(sellers[4]), stock: 3, listedAt: daysAgo(9),
  },
  {
    id: "p-10", slug: "fork-seals-yamaha-r6", title: "Fork Seal Kit",
    priceCents: 45000, condition: "new", categorySlug: "suspension", brandName: "Yamaha",
    oemNumbers: ["2C0-23145-00"], fitment: [{ brand: "Yamaha", model: "R6", yearFrom: 2006, yearTo: 2020 }],
    images: [{ id: "p-10-i", url: "", alt: "Fork Seal Kit for Yamaha R6" }],
    seller: sellerRef(sellers[2]), stock: 20, listedAt: daysAgo(10), isNew: true,
  },
  {
    id: "p-11", slug: "radiator-kawasaki-ninja-650", title: "OEM Radiator",
    priceCents: 240000, condition: "good-used", categorySlug: "engine", brandName: "Kawasaki",
    oemNumbers: ["39061-0700"], fitment: [{ brand: "Kawasaki", model: "Ninja 650", yearFrom: 2012, yearTo: 2020 }],
    images: [{ id: "p-11-i", url: "", alt: "OEM Radiator for Kawasaki Ninja 650" }],
    seller: sellerRef(sellers[3]), stock: 2, listedAt: daysAgo(11),
  },
  {
    id: "p-12", slug: "handlebar-grips-bmw-rninet", title: "Heated Handlebar Grips",
    priceCents: 38000, condition: "new", categorySlug: "controls", brandName: "BMW",
    oemNumbers: ["61312346099"], fitment: [{ brand: "BMW", model: "R nineT", yearFrom: 2014, yearTo: 2023 }],
    images: [{ id: "p-12-i", url: "", alt: "Heated Handlebar Grips for BMW R nineT" }],
    seller: sellerRef(sellers[0]), stock: 15, listedAt: daysAgo(12), isNew: true,
  },
  {
    id: "p-13", slug: "rearsets-ducati-monster-821", title: "Adjustable Rearsets",
    priceCents: 360000, condition: "like-new", categorySlug: "controls", brandName: "Ducati",
    oemNumbers: ["96280441A"], fitment: [{ brand: "Ducati", model: "Monster 821", yearFrom: 2014, yearTo: 2020 }],
    images: [{ id: "p-13-i", url: "", alt: "Adjustable Rearsets for Ducati Monster 821" }],
    seller: sellerRef(sellers[2]), stock: 1, listedAt: daysAgo(13),
  },
  {
    id: "p-14", slug: "battery-suzuki-vstrom-650", title: "AGM Battery YTX12-BS",
    priceCents: 110000, condition: "new", categorySlug: "electronics", brandName: "Suzuki",
    oemNumbers: ["33610-06810"], fitment: [{ brand: "Suzuki", model: "V-Strom 650", yearFrom: 2004, yearTo: 2023 }],
    images: [{ id: "p-14-i", url: "", alt: "AGM Battery for Suzuki V-Strom 650" }],
    seller: sellerRef(sellers[5]), stock: 6, listedAt: daysAgo(14), isNew: true,
  },
  {
    id: "p-15", slug: "windscreen-bmw-s1000rr", title: "Double-Bubble Windscreen",
    priceCents: 130000, condition: "used", categorySlug: "bodywork", brandName: "BMW",
    oemNumbers: ["46637726820"], fitment: [{ brand: "BMW", model: "S1000RR", yearFrom: 2019, yearTo: 2023 }],
    images: [{ id: "p-15-i", url: "", alt: "Double-Bubble Windscreen for BMW S1000RR" }],
    seller: sellerRef(sellers[3]), stock: 4, listedAt: daysAgo(15),
  },
  {
    id: "p-16", slug: "brake-pads-honda-africa-twin", title: "Sintered Brake Pads",
    priceCents: 42000, condition: "new", categorySlug: "brakes", brandName: "Honda",
    oemNumbers: ["06455-MKK-D01"], fitment: [{ brand: "Honda", model: "Africa Twin", yearFrom: 2016, yearTo: 2023 }],
    images: [{ id: "p-16-i", url: "", alt: "Sintered Brake Pads for Honda Africa Twin" }],
    seller: sellerRef(sellers[1]), stock: 30, listedAt: daysAgo(16), isNew: true,
  },
];

/** Full catalog: everything a buyer can browse on /parts. */
export const allProducts: Product[] = [
  ...featuredProducts,
  ...recentProducts,
  ...moreProducts,
];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function getProductsBySeller(sellerId: string): Product[] {
  return allProducts.filter((p) => p.seller.id === sellerId);
}

export function getSellerBySlug(slug: string): Seller | undefined {
  return sellers.find((s) => s.slug === slug);
}

/** Condition filter options for the catalog sidebar. */
export const conditionOptions: { value: string; label: string }[] = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "excellent-used", label: "Excellent Used" },
  { value: "good-used", label: "Good Used" },
  { value: "used", label: "Used" },
  { value: "for-parts", label: "For Parts" },
];

/** Sample product reviews (detail page). */
export const productReviews: Review[] = [
  { id: "rv-1", author: "Sipho M.", rating: 5, title: "Exactly as described", body: "Part arrived quickly and fit my bike perfectly. Seller communication was excellent.", createdAt: daysAgo(4) },
  { id: "rv-2", author: "Danie v.", rating: 5, title: "Great condition used part", body: "Saved a fortune versus buying new. Escrow made me feel safe paying upfront.", createdAt: daysAgo(12) },
  { id: "rv-3", author: "Thandi K.", rating: 4, title: "Good value", body: "Minor wear as expected for a used item, but works flawlessly. Would buy again.", createdAt: daysAgo(20) },
];
