import type { ListingStatus, OrderStatus } from "@/types";

type Tone = "green" | "amber" | "blue" | "indigo" | "red" | "gray" | "teal";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  "pending-payment": { label: "Pending Payment", tone: "amber" },
  "paid-held": { label: "Awaiting Shipment", tone: "amber" },
  shipped: { label: "Shipped", tone: "indigo" },
  delivered: { label: "Delivered", tone: "teal" },
  confirmed: { label: "Received — Awaiting Release", tone: "blue" },
  released: { label: "Payment Released", tone: "green" },
  "return-requested": { label: "Return In Transit", tone: "amber" },
  returned: { label: "Returned", tone: "red" },
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
