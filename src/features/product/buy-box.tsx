"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import type { Product } from "@/types";
import { formatZAR } from "@/lib/format";
import { useCart } from "@/features/cart/cart-context";
import { Button } from "@/components/ui/button";

export function BuyBox({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    add(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-foreground">
          {formatZAR(product.priceCents)}
        </span>
        {product.compareAtCents && (
          <span className="text-lg text-muted-foreground line-through">
            {formatZAR(product.compareAtCents)}
          </span>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm">
        {product.stock > 0 ? (
          <>
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-700">In stock</span>
            <span className="text-muted-foreground">· {product.stock} available</span>
          </>
        ) : (
          <span className="font-medium text-muted-foreground">Out of stock</span>
        )}
      </p>

      {/* Quantity */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Qty</span>
        <div className="flex items-center rounded-lg border border-input">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid size-9 place-items-center text-foreground hover:bg-muted"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="grid size-9 place-items-center text-foreground hover:bg-muted"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Button size="lg" className="h-12 gap-2" onClick={handleAdd} disabled={product.stock === 0}>
          {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          {added ? "Added to cart" : "Add to Cart"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 border-foreground/15"
          onClick={buyNow}
          disabled={product.stock === 0}
        >
          Buy Now
        </Button>
      </div>

      {/* Trust */}
      <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-brand" />
          Buyer Protection — we hold your payment until you confirm delivery.
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Truck className="size-4 text-brand" />
          {product.shippingCents
            ? <>Shipping {formatZAR(product.shippingCents)} nationwide{product.shippingLocalCents ? <> · {formatZAR(product.shippingLocalCents)} local</> : null}.</>
            : "Shipping calculated by the seller at checkout."}
        </p>
      </div>
    </div>
  );
}
