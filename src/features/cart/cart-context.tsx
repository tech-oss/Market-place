"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";
import { allProducts } from "@/mocks";

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Seed the cart with a couple of items so the demo shows a populated state. */
const INITIAL: CartLine[] = [
  { product: allProducts.find((p) => p.id === "p-1")!, qty: 1 },
  { product: allProducts.find((p) => p.id === "p-16")!, qty: 2 },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(INITIAL);

  const add = useCallback((product: Product, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, qty: Math.min(l.qty + qty, product.stock) }
            : l,
        );
      }
      return [...prev, { product, qty: Math.min(qty, product.stock) }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === productId
          ? { ...l, qty: Math.max(1, Math.min(qty, l.product.stock)) }
          : l,
      ),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotalCents = lines.reduce(
      (sum, l) => sum + l.product.priceCents * l.qty,
      0,
    );
    return { lines, count, subtotalCents, add, remove, setQty, clear };
  }, [lines, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
