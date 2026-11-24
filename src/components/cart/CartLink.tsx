"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/order"
      className="relative inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-sm font-medium text-ink hover:border-ink"
    >
      장바구니
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-chili px-1.5 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
