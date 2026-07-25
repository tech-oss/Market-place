"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatZAR } from "@/lib/format";
import { useCart } from "@/features/cart/cart-context";
import { placeOrder } from "@/features/cart/actions";
import { ShoppingCart } from "lucide-react";

const COURIERS = [
  { id: "pudo", label: "PUDO Locker-to-Locker", cost: 6000, eta: "2–3 business days" },
  { id: "courierguy", label: "The Courier Guy", cost: 9900, eta: "1–2 business days" },
  { id: "aramex", label: "Aramex", cost: 11500, eta: "1–2 business days" },
];

export default function CheckoutPage() {
  const { lines, subtotalCents, clear } = useCart();
  const [courier, setCourier] = useState(COURIERS[0].id);
  const [placed, setPlaced] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Seller-set shipping (per product) takes precedence; else the courier flat rate.
  const sellerShipping = lines.reduce((s, l) => s + (l.product.shippingCents ?? 0), 0);
  const courierCost = COURIERS.find((c) => c.id === courier)?.cost ?? 0;
  const shipping = sellerShipping > 0 ? sellerShipping : courierCost;
  const total = subtotalCents + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await placeOrder({
      lines: lines.map((l) => ({
        productId: l.product.id,
        sellerId: l.product.seller.id,
        title: l.product.title,
        priceCents: l.product.priceCents,
        qty: l.qty,
      })),
      shippingCents: shipping,
      courier: COURIERS.find((c) => c.id === courier)?.label ?? courier,
    });
    setSubmitting(false);
    if (res.reference) setReference(res.reference);
    clear();
    setPlaced(true);
  };

  if (placed) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto size-14 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-black text-foreground">Order placed!</h1>
          {reference && (
            <p className="mt-1 text-sm font-semibold text-foreground">Order {reference}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment is held securely in escrow. We&rsquo;ll notify you when the
            seller ships your parts. Release the funds once you&rsquo;ve confirmed delivery.
          </p>
          <Link href="/account" className={cn(buttonVariants(), "mt-6")}>
            View my orders
          </Link>
        </div>
      </Container>
    );
  }

  if (lines.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Nothing to check out"
          description="Add some parts to your cart first."
          action={{ label: "Shop Parts", href: "/parts" }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-black tracking-tight text-foreground">Checkout</h1>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Shipping address */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">Shipping Address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input required placeholder="Full name" aria-label="Full name" />
              <Input required type="tel" placeholder="Phone number" aria-label="Phone number" />
              <Input required placeholder="Street address" aria-label="Street address" className="sm:col-span-2" />
              <Input required placeholder="City" aria-label="City" />
              <Input required placeholder="Postal code" aria-label="Postal code" />
            </div>
          </section>

          {/* Courier */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">Delivery Method</h2>
            <div className="space-y-3">
              {COURIERS.map((c) => (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    courier === c.id ? "border-brand bg-brand/5" : "border-input"
                  }`}
                >
                  <input
                    type="radio"
                    name="courier"
                    value={c.id}
                    checked={courier === c.id}
                    onChange={() => setCourier(c.id)}
                    className="accent-brand"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.eta}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">{formatZAR(c.cost)}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment (escrow) */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
              <Lock className="size-4" /> Payment
            </h2>
            <p className="text-sm text-muted-foreground">
              Payment integration (PayFast / Ozow / card) is wired in Step 3. For this
              preview, placing the order simulates funding the escrow hold.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
          <ul className="mt-4 space-y-3">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {product.title} × {qty}
                </span>
                <span className="font-medium text-foreground">
                  {formatZAR(product.priceCents * qty)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatZAR(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium text-foreground">{formatZAR(shipping)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-black text-foreground">{formatZAR(total)}</span>
          </div>
          <Button type="submit" size="lg" className="mt-5 h-12 w-full" disabled={submitting}>
            {submitting ? "Placing order…" : "Place Order"}
          </Button>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            Funds are held in escrow and only released to the seller after you confirm delivery.
          </p>
        </div>
      </form>
    </Container>
  );
}
