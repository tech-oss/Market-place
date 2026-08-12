"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, CheckCircle2, Lock, ShieldCheck, Truck } from "lucide-react";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatZAR } from "@/lib/format";
import { useCart } from "@/features/cart/cart-context";
import { placeOrder } from "@/features/cart/actions";
import { EftPaymentPopup } from "@/features/cart/eft-payment-popup";
import type { PaymentSettings } from "@/lib/data/dashboard";
import { ShoppingCart } from "lucide-react";

interface CheckoutFormInitial {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export function CheckoutForm({ initial, paymentSettings }: { initial: CheckoutFormInitial; paymentSettings: PaymentSettings }) {
  const { lines, subtotalCents, clear } = useCart();
  const [placed, setPlaced] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; totalCents: number; deadline?: string } | null>(null);
  const [showEftPopup, setShowEftPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [city, setCity] = useState(initial.city);
  const [postalCode, setPostalCode] = useState(initial.postalCode);
  const defaultMethod = paymentSettings.onlineEnabled ? "online" : "eft";
  const [paymentMethod, setPaymentMethod] = useState<"online" | "eft">(defaultMethod);

  // Each seller sets their own shipping cost per product — no platform-wide courier picker.
  const shipping = lines.reduce((s, l) => s + (l.product.shippingCents ?? 0), 0);
  const total = subtotalCents + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await placeOrder({
      lines: lines.map((l) => ({
        productId: l.product.id,
        sellerId: l.product.seller.id,
        title: l.product.title,
        priceCents: l.product.priceCents,
        qty: l.qty,
      })),
      shippingCents: shipping,
      shippingAddress: { name, phone, address, city, postalCode },
      paymentMethod,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong placing your order. Please try again.");
      return;
    }
    if (res.fellBack) {
      setError("Please sign in again to place your order.");
      return;
    }
    if (res.reference) setReference(res.reference);
    if (paymentMethod === "eft" && res.orderId) {
      setPlacedOrder({
        id: res.orderId,
        totalCents: total,
        deadline: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      });
      setShowEftPopup(true);
    }
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
          {paymentMethod === "eft" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Your order is reserved and waiting on your EFT payment. Transfer the amount using the
              bank details provided, then upload your proof of payment — an admin will confirm it
              before the seller ships.
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment is held securely under Buyer Protection. We&rsquo;ll notify you when the
              seller ships your parts. Release the funds once you&rsquo;ve confirmed delivery.
            </p>
          )}
          <div className="mt-6 flex flex-col items-center gap-3">
            {paymentMethod === "eft" && placedOrder && (
              <button
                type="button"
                onClick={() => setShowEftPopup(true)}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View bank details
              </button>
            )}
            <Link href="/account" className={cn(buttonVariants())}>
              View my orders
            </Link>
          </div>
        </div>

        {showEftPopup && placedOrder && (
          <EftPaymentPopup
            orderId={placedOrder.id}
            reference={reference ?? ""}
            totalCents={placedOrder.totalCents}
            deadline={placedOrder.deadline}
            settings={paymentSettings}
            onClose={() => setShowEftPopup(false)}
          />
        )}
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
              <Input required placeholder="Full name" aria-label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input required type="tel" placeholder="Phone number" aria-label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input required placeholder="Street address" aria-label="Street address" className="sm:col-span-2" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input required placeholder="City" aria-label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input required placeholder="Postal code" aria-label="Postal code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
              <Truck className="size-4" /> Delivery
            </h2>
            <p className="text-sm text-muted-foreground">
              Each seller arranges and ships your part with their own courier. The shipping
              cost shown below is what they charge for this order — once they dispatch it,
              you&rsquo;ll see the courier and tracking number on your order.
            </p>
          </section>

          {/* Payment (escrow) */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
              <Lock className="size-4" /> Payment
            </h2>

            {paymentSettings.onlineEnabled && paymentSettings.eftEnabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors",
                    paymentMethod === "online" ? "border-brand bg-brand/5" : "border-border hover:border-neutral-300",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-0.5"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Lock className="size-3.5" /> Online Payment
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Funds are held under Buyer Protection immediately.
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors",
                    paymentMethod === "eft" ? "border-brand bg-brand/5" : "border-border hover:border-neutral-300",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-0.5"
                    checked={paymentMethod === "eft"}
                    onChange={() => setPaymentMethod("eft")}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Banknote className="size-3.5" /> EFT
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Bank transfer — upload proof of payment, 3 days to pay.
                    </span>
                  </span>
                </label>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {paymentSettings.eftEnabled
                  ? "Pay by EFT bank transfer — you'll get the bank details and can upload proof of payment after placing your order."
                  : "Payment integration (PayFast / Ozow / card) is wired in Step 3. For this preview, placing the order simulates funding the Buyer Protection hold."}
              </p>
            )}

            {paymentMethod === "eft" && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Your items will be reserved for you, but the seller only ships once your EFT payment is
                confirmed by an admin. You have 3 days to complete the transfer.
              </p>
            )}
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
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}
          <Button type="submit" size="lg" className="mt-5 h-12 w-full" disabled={submitting}>
            {submitting ? "Placing order…" : "Place Order"}
          </Button>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            Funds are held under Buyer Protection and only released to the seller after you confirm delivery.
          </p>
        </div>
      </form>
    </Container>
  );
}
