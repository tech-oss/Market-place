import type { ListingStatus, OrderStatus } from "@/types";

type Tone = "green" | "amber" | "blue" | "indigo" | "red" | "gray" | "teal";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  "pending-payment": { label: "Pending Payment", tone: "amber" },
  "paid-held": { label: "In Buyer Protection", tone: "blue" },
  shipped: { label: "Shipped", tone: "indigo" },
  delivered: { label: "Delivered", tone: "teal" },
  confirmed: { label: "Confirmed", tone: "green" },
  released: { label: "Completed", tone: "green" },
  disputed: { label: "Disputed", tone: "red" },
  refunded: { label: "Refunded", tone: "gray" },
  cancelled: { label: "Cancelled", tone: "gray" },
};

export const LISTING_STATUS_META: Record<ListingStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "green" },
  draft: { label: "Draft", tone: "gray" },
  "out-of-stock": { label: "Out of Stock", tone: "red" },
  "pending-review": { label: "Pending Review", tone: "amber" },
  "awaiting-verification": { label: "Awaiting Verification", tone: "amber" },
};
