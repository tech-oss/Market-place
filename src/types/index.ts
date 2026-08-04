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

export type SellerType = "individual" | "parts_dealer" | "accessories_dealer";

/** How a seller reached "active" status. */
export type ApprovalType = "docs_verified" | "admin_override";

export type OrderStatus =
  | "pending-payment"
  | "paid-held" // funds held by the platform
  | "shipped"
  | "delivered"
  | "confirmed" // buyer received it; funds still held pending admin release
  | "released" // admin manually released funds to the seller
  | "return-requested" // buyer is shipping the item back to the platform
  | "returned" // return received; buyer refunded, seller charged commission
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
  /** Seller-set shipping (nationwide) and optional local rate, in cents. */
  shippingCents?: number;
  shippingLocalCents?: number;
  /** ISO timestamp used for "Recently Added". */
  listedAt: string;
  isFeatured?: boolean;
  isNew?: boolean;
  /** Moderation status — only populated when fetched via admin data helpers. */
  status?: string;
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

export type ListingStatus =
  | "active"
  | "draft"
  | "out-of-stock"
  | "pending-review"
  | "awaiting-verification";

export interface SellerListing {
  id: UUID;
  title: string;
  slug: string;
  sku: string;
  itemNumber: string;
  categorySlug: string;
  priceCents: number;
  stock: number;
  status: ListingStatus;
  views: number;
  sold: number;
  condition: ProductCondition;
  shippingCents?: number;
  shippingLocalCents?: number;
  createdAt: string;
  brandName?: string;
  images?: { id: string; url: string; alt: string }[];
  fitment?: { brand: string; model: string; yearFrom: number; yearTo: number };
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
  shippingService?: string;
  shippingNote?: string;
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
  businessType: "Dealership" | "Used Parts Dealer" | "Workshop" | "Individual";
  sellerType: SellerType;
  submittedAt: string;
  idDocUploaded: boolean;
  proofOfResidenceUploaded: boolean;
  proofOfBankingUploaded: boolean;
  /** Storage paths (present when uploaded) so admins can view the files. */
  idDocPath?: string | null;
  proofPath?: string | null;
  bankingPath?: string | null;
  status: SellerStatus;
  approvalType?: ApprovalType | null;
}
