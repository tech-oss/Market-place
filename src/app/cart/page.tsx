"use client";

import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PartVisual, productKind } from "@/components/shared/part-visual";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatZAR } from "@/lib/format";
import { useCart } from "@/features/cart/cart-context";

export default function CartPage() {
  const { lines, subtotalCents, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse thousands of new and used motorcycle parts from verified sellers."
          action={{ label: "Shop Parts", href: "/parts" }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-3xl font-black tracking-tight text-foreground">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {lines.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4 p-4">
              <Link href={`/parts/${product.slug}`}>
                <PartVisual kind={productKind(product)} alt={product.title} className="size-24 rounded-xl" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/parts/${product.slug}`}
                      className="font-semibold text-foreground hover:text-brand"
                    >
                      {product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{product.seller.name}</p>
                  </div>
                  <p className="font-bold text-foreground">{formatZAR(product.priceCents)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-input">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="grid size-8 place-items-center hover:bg-muted"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold">{qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQty(product.id, qty + 1)}
                      className="grid size-8 place-items-center hover:bg-muted"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatZAR(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-black text-foreground">{formatZAR(subtotalCents)}</span>
          </div>
          <Link
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "mt-5 h-12 w-full")}
          >
            Proceed to Checkout
          </Link>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            Your payment is held securely in escrow until you confirm delivery.
          </p>
        </div>
      </div>
    </Container>
  );
}
