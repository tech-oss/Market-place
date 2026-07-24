/**
 * Core domain model for Motorcycle Products marketplace.
 *
 * These types are the single source of truth shared by every UI component.
 * In Step 3 the Supabase queries return these exact shapes, so components
 * built against mock data in Step 1 require zero changes.
 */

export type UUID = string;

/** ---------------------------------------------------------------------------
 * Enums / unions
 * ------------------------------------------------------------------------- */

export type UserRole = "admin" | "seller" | "buyer";

export type ProductCondition =
  | "new"
  | "like-new"
  | "excellent-used"
  | "good-used"
  | "used"
  | "for-parts";

export type SellerStatus = "pending" | "active" | "suspended" | "rejected";

export type OrderStatus =
  | "pending-payment"
  | "paid-held" // funds in escrow
  | "shipped"
  | "delivered"
  | "confirmed"
  | "released" // funds released to seller
  | "disputed"
  | "refunded"
  | "cancelled";

/** ---------------------------------------------------------------------------
 * Vehicle / fitment
 * ------------------------------------------------------------------------- */

export interface MotorcycleBrand {
  id: UUID;
  name: string;
  slug: string;
  /** Inline SVG/emoji stand-in for the logo mark used in the mock. */
  logo: string;
  partCount: number;
}

/** A single make/model/year window a part is compatible with. */
export interface Fitment {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  image: string;
  partCount: number;
}

/** ---------------------------------------------------------------------------
 * Sellers
 * ------------------------------------------------------------------------- */

export interface Seller {
  id: UUID;
  name: string;
  slug: string;
  logo: string;
  location: string; // e.g. "Johannesburg"
  status: SellerStatus;
  rating: number; // 0..5
  reviewCount: number;
  partCount: number;
  verified: boolean;
  memberSince: string; // ISO date
}

/** ---------------------------------------------------------------------------
 * Products
 * ------------------------------------------------------------------------- */

export interface ProductImage {
  id: UUID;
  url: string;
  alt: string;
}

export interface Product {
  id: UUID;
  slug: string;
  title: string;
  /** Cents in ZAR to avoid float rounding. Display via formatZAR(). */
  priceCents: number;
  compareAtCents?: number;
  condition: ProductCondition;
  categorySlug: string;
  brandName: string;
  /** OEM / manufacturer part numbers. */
  oemNumbers: string[];
  fitment: Fitment[];
  images: ProductImage[];
  seller: Pick<Seller, "id" | "name" | "slug" | "location" | "logo" | "rating">;
  stock: number;
  /** ISO timestamp used for "Recently Added". */
  listedAt: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

/** ---------------------------------------------------------------------------
 * Reviews
 * ------------------------------------------------------------------------- */

export interface Review {
  id: UUID;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

/** ---------------------------------------------------------------------------
 * Dashboard (seller + admin) model
 * ------------------------------------------------------------------------- */

export type ListingStatus = "active" | "draft" | "out-of-stock" | "pending-review";

export interface SellerListing {
  id: UUID;
  title: string;
  slug: string;
  sku: string;
  categorySlug: string;
  priceCents: number;
  stock: number;
  status: ListingStatus;
  views: number;
  sold: number;
  condition: ProductCondition;
  createdAt: string;
}

export interface SellerOrder {
  id: UUID;
  reference: string;
  productTitle: string;
  productId: UUID;
  buyerName: string;
  qty: number;
  totalCents: number;
  status: OrderStatus;
  courier?: string;
  tracking?: string;
  shippingCents?: number;
  placedAt: string;
}

export type WalletTxnType = "sale" | "commission" | "payout" | "refund";

export interface WalletTxn {
  id: UUID;
  type: WalletTxnType;
  description: string;
  amountCents: number; // positive = credit, negative = debit
  date: string;
  status: "completed" | "pending";
}

/** A pending/processed seller registration reviewed by admin. */
export interface SellerApplication {
  id: UUID;
  businessName: string;
  ownerName: string;
  email: string;
  location: string;
  businessType: "Dealership" | "Scrapyard" | "Workshop" | "Individual";
  submittedAt: string;
  idDocUploaded: boolean;
  proofOfResidenceUploaded: boolean;
  /** Storage paths (present when uploaded) so admins can view the files. */
  idDocPath?: string | null;
  proofPath?: string | null;
  status: SellerStatus;
}
