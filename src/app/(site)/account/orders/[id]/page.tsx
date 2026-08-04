import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, MessageSquareText, Package, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { getSessionUser } from "@/lib/auth";
import { getBuyerOrderById } from "@/lib/data/dashboard";
import { formatZAR } from "@/lib/format";
import { ConfirmDeliveryButton } from "@/features/cart/confirm-delivery-button";
import { CopyTrackingButton } from "@/features/cart/copy-tracking-button";
import type { OrderStatus } from "@/types";

export const metadata: Metadata = { title: "Order Details", robots: { index: false } };

const TERMINAL_META: Partial<Record<OrderStatus, { label: string; className: string }>> = {
  disputed: { label: "Disputed", className: "bg-red-50 text-red-800 border-red-200" },
  refunded: { label: "Refunded", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  cancelled: { label: "Cancelled", className: "bg-neutral-100 text-neutral-700 border-neutral-200" },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const order = await getBuyerOrderById(id);
  if (!order) notFound();

  const shipped = ["shipped", "delivered", "confirmed", "released"].includes(order.status);
  const received = ["confirmed", "released"].includes(order.status);
  const terminal = TERMINAL_META[order.status];

  const steps = [
    { key: "placed", label: "Order Confirmed", body: "Your payment is held under Buyer Protection.", icon: ShieldCheck, done: true },
    { key: "shipped", label: "Shipped", body: shipped ? "See shipping details below." : "Waiting for the seller to ship.", icon: Truck, done: shipped },
    { key: "received", label: "Received", body: received ? "You confirmed delivery — payment released to the seller." : "Confirm once your part arrives.", icon: Package, done: received },
  ];

  return (
    <Container className="py-8">
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Home", href: "/" }, { label: "My Account", href: "/account" }, { label: `Order ${order.reference}` }]}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Order {order.reference}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.placedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>
        <Link href="/account" className="text-sm font-semibold text-brand hover:underline">
          ← Back to My Account
        </Link>
      </div>

      {terminal && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${terminal.className}`}>
          This order is {terminal.label.toLowerCase()}.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Status timeline */}
          {!terminal && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-bold text-foreground">Status</h2>
              <ol className="space-y-4">
                {steps.map((s) => (
                  <li key={s.key} className="flex gap-3">
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${
                        s.done ? "bg-brand text-brand-foreground" : "border-2 border-border text-muted-foreground"
                      }`}
                    >
                      {s.done ? <Check className="size-4" /> : <s.icon className="size-4" />}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {order.status === "shipped" && (
                <div className="mt-5 border-t border-border pt-5">
                  <ConfirmDeliveryButton orderId={order.id} />
                </div>
              )}
            </section>
          )}

          {/* Shipping details — courier, tracking, service, seller note */}
          {order.tracking && (
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Truck className="size-4 text-brand" />
                <h2 className="text-lg font-bold text-foreground">Shipping Details</h2>
              </div>
              <dl>
                <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-border bg-neutral-50 px-5 py-3 text-sm sm:grid-cols-[160px_1fr]">
                  <dt className="text-muted-foreground">Courier</dt>
                  <dd className="font-medium text-foreground">{order.courier || "—"}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-border px-5 py-3 text-sm sm:grid-cols-[160px_1fr]">
                  <dt className="text-muted-foreground">Tracking Number</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium text-foreground">{order.tracking}</span>
                    <CopyTrackingButton value={order.tracking} />
                  </dd>
                </div>
                {order.shippingService && (
                  <div className="grid grid-cols-[120px_1fr] gap-4 border-b border-border bg-neutral-50 px-5 py-3 text-sm last:border-b-0 sm:grid-cols-[160px_1fr]">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-medium text-foreground">{order.shippingService}</dd>
                  </div>
                )}
                {order.shippingNote && (
                  <div className="grid grid-cols-[120px_1fr] gap-4 px-5 py-3 text-sm last:border-b-0 sm:grid-cols-[160px_1fr]">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquareText className="size-3.5" /> Note
                    </dt>
                    <dd className="text-foreground">{order.shippingNote}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Items */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">Items</h2>
            <ul className="divide-y divide-border">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Package className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {it.productSlug ? (
                      <Link href={`/parts/${it.productSlug}`} className="font-semibold text-foreground hover:text-brand">
                        {it.title}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{it.title}</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty {it.qty}{it.sellerName ? ` · Sold by ${it.sellerName}` : ""}
                    </p>
                  </div>
                  <span className="font-medium text-foreground">{formatZAR(it.priceCents * it.qty)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Shipping address */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">Shipping Address</h2>
            <p className="text-sm text-foreground">{order.shippingAddress.name}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
            <p className="text-sm text-muted-foreground">
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatZAR(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium text-foreground">{formatZAR(order.shippingCents)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-black text-foreground">{formatZAR(order.totalCents)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
