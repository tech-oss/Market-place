"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/cart-context";

export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}
