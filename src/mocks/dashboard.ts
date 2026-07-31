import type {
  SellerApplication,
  SellerListing,
  SellerOrder,
  WalletTxn,
} from "@/types";

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** The signed-in demo seller (RideFast Motorcycles). */
export const currentSeller = {
  id: "s-ridefast",
  name: "RideFast Motorcycles",
  location: "Johannesburg",
  logo: "RF",
  verified: true,
  memberSince: "2021-03-01",
};

/** ---- Seller: listings ---------------------------------------------------- */
export const sellerListings: SellerListing[] = [
  { id: "l-1", title: "OEM Brake Lever", slug: "oem-brake-lever-bmw-s1000rr", sku: "MP-BRK-0001", categorySlug: "controls", priceCents: 210000, stock: 3, status: "active", views: 482, sold: 11, condition: "excellent-used", createdAt: daysAgo(40) },
  { id: "l-2", title: "Chain & Sprocket Kit", slug: "chain-sprocket-kit-honda-cbr600rr", sku: "MP-ENG-0007", categorySlug: "engine", priceCents: 185000, stock: 8, status: "active", views: 356, sold: 6, condition: "new", createdAt: daysAgo(33) },
  { id: "l-3", title: "Heated Handlebar Grips", slug: "handlebar-grips-bmw-rninet", sku: "MP-CTL-0012", categorySlug: "controls", priceCents: 38000, stock: 15, status: "active", views: 221, sold: 9, condition: "new", createdAt: daysAgo(21) },
  { id: "l-4", title: "Clutch Master Cylinder", slug: "clutch-master-cylinder-honda-cbr1000rr", sku: "MP-CTL-0021", categorySlug: "controls", priceCents: 120000, stock: 0, status: "out-of-stock", views: 190, sold: 4, condition: "good-used", createdAt: daysAgo(15) },
  { id: "l-5", title: "Front Fender Carbon", slug: "front-fender-carbon", sku: "MP-BDY-0033", categorySlug: "bodywork", priceCents: 265000, stock: 2, status: "pending-review", views: 12, sold: 0, condition: "new", createdAt: daysAgo(1) },
  { id: "l-6", title: "Rear Brake Caliper", slug: "rear-brake-caliper", sku: "MP-BRK-0040", categorySlug: "brakes", priceCents: 175000, stock: 1, status: "draft", views: 0, sold: 0, condition: "used", createdAt: daysAgo(0) },
];

/** ---- Seller: orders ------------------------------------------------------ */
export const sellerOrders: SellerOrder[] = [
  { id: "o-1", reference: "MP-10482", productTitle: "OEM Brake Lever", productId: "l-1", buyerName: "Sipho M.", qty: 1, totalCents: 216000, status: "paid-held", shippingCents: 6000, placedAt: daysAgo(0) },
  { id: "o-2", reference: "MP-10461", productTitle: "Chain & Sprocket Kit", productId: "l-2", buyerName: "Danie v.", qty: 1, totalCents: 194900, status: "shipped", courier: "The Courier Guy", tracking: "CG9928134ZA", shippingCents: 9900, placedAt: daysAgo(2) },
  { id: "o-3", reference: "MP-10450", productTitle: "Heated Handlebar Grips", productId: "l-3", buyerName: "Thandi K.", qty: 2, totalCents: 82000, status: "delivered", courier: "PUDO", tracking: "PU5561200ZA", shippingCents: 6000, placedAt: daysAgo(4) },
  { id: "o-4", reference: "MP-10399", productTitle: "OEM Brake Lever", productId: "l-1", buyerName: "Johan P.", qty: 1, totalCents: 216000, status: "released", shippingCents: 6000, placedAt: daysAgo(9) },
  { id: "o-5", reference: "MP-10388", productTitle: "Clutch Master Cylinder", productId: "l-4", buyerName: "Ayesha B.", qty: 1, totalCents: 126000, status: "released", shippingCents: 6000, placedAt: daysAgo(12) },
];

/** ---- Seller: wallet ------------------------------------------------------ */
export const walletBalanceCents = 348600;
export const walletPendingCents = 216000;

export const walletTxns: WalletTxn[] = [
  { id: "w-1", type: "sale", description: "Order MP-10399 · OEM Brake Lever", amountCents: 210000, date: daysAgo(9), status: "completed" },
  { id: "w-2", type: "commission", description: "Platform commission (7%)", amountCents: -14700, date: daysAgo(9), status: "completed" },
  { id: "w-3", type: "sale", description: "Order MP-10388 · Clutch Master Cylinder", amountCents: 120000, date: daysAgo(12), status: "completed" },
  { id: "w-4", type: "commission", description: "Platform commission (7%)", amountCents: -8400, date: daysAgo(12), status: "completed" },
  { id: "w-5", type: "payout", description: "Payout to FNB •••• 4821", amountCents: -250000, date: daysAgo(14), status: "completed" },
  { id: "w-6", type: "sale", description: "Order MP-10461 · Chain & Sprocket Kit (Buyer Protection)", amountCents: 185000, date: daysAgo(2), status: "pending" },
];

/** Sales trend for the seller overview chart (last 7 days, in Rand). */
export const sellerSalesTrend = [4200, 3100, 5600, 2400, 6800, 5200, 7890];

/** ---- Admin: seller applications ----------------------------------------- */
export const sellerApplications: SellerApplication[] = [];

/** ---- Admin: platform stats ---------------------------------------------- */
export const adminStats = {
  gmvCents: 128_45000, // R128,450
  commissionCents: 8_99150, // R8,991.50
  activeSellers: 468,
  pendingApprovals: 3,
  ordersInEscrow: 42,
  disputes: 2,
};

export const adminRevenueTrend = [8200, 9100, 7600, 11200, 9800, 12400, 12845];

export interface AdminOrderRow {
  reference: string;
  seller: string;
  buyer: string;
  totalCents: number;
  status: string;
  escrow: "held" | "released" | "refunded";
  date: string;
}

export const adminOrders: AdminOrderRow[] = [
  { reference: "MP-10482", seller: "RideFast Motorcycles", buyer: "Sipho M.", totalCents: 216000, status: "In Buyer Protection", escrow: "held", date: daysAgo(0) },
  { reference: "MP-10480", seller: "MotoStrip SA", buyer: "Lerato N.", totalCents: 662000, status: "Shipped", escrow: "held", date: daysAgo(1) },
  { reference: "MP-10475", seller: "Cycle Salvage", buyer: "Pieter S.", totalCents: 801000, status: "Delivered", escrow: "held", date: daysAgo(2) },
  { reference: "MP-10461", seller: "RideFast Motorcycles", buyer: "Danie v.", totalCents: 194900, status: "Shipped", escrow: "held", date: daysAgo(2) },
  { reference: "MP-10399", seller: "Pro Bike Parts", buyer: "Johan P.", totalCents: 1296000, status: "Completed", escrow: "released", date: daysAgo(9) },
  { reference: "MP-10377", seller: "Thunder Parts", buyer: "Ayesha B.", totalCents: 151000, status: "Refunded", escrow: "refunded", date: daysAgo(11) },
];

/** Default platform commission — editable in admin settings. */
export const DEFAULT_COMMISSION_PCT = 7;
