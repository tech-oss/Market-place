"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/features/cart/cart-context";

/** Client-side app providers (cart, and future auth/theme in later steps). */
export function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
