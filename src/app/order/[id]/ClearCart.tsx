"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** Empties the cart once per placed order. */
export default function ClearCart({ orderId }: { orderId: string }) {
  const { ready, clear } = useCart();
  useEffect(() => {
    if (!ready) return;
    try {
      const key = "duam-cleared-order";
      if (localStorage.getItem(key) === orderId) return;
      localStorage.setItem(key, orderId);
    } catch {}
    clear();
  }, [ready, clear, orderId]);
  return null;
}
