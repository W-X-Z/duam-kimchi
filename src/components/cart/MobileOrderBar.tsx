"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function MobileOrderBar() {
  const { count } = useCart();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden">
      {count > 0 ? (
        <Link href="/order" className="block rounded-xl bg-chili py-3.5 text-center text-[15px] font-semibold text-white">
          장바구니 {count}개 · 주문하기
        </Link>
      ) : (
        <a href="#menu" className="block rounded-xl bg-ink py-3.5 text-center text-[15px] font-semibold text-paper">
          메뉴 보고 주문하기
        </a>
      )}
    </div>
  );
}
