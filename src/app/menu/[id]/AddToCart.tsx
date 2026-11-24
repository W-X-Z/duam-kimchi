"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import QtyStepper from "@/components/QtyStepper";
import { formatPrice, type MenuItem } from "@/lib/types";

export default function AddToCart({ item }: { item: MenuItem }) {
  const router = useRouter();
  const { add } = useCart();
  const [option, setOption] = useState(item.options[0]?.label ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = item.options.find((o) => o.label === option);
  const total = (selected?.price ?? 0) * qty;
  const disabled = item.is_soldout || !selected;

  const addToCart = () => {
    if (disabled) return;
    add(item.id, option, qty);
    setAdded(true);
  };

  const actions = (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={addToCart}
        className="flex-1 rounded-xl border border-ink/20 bg-paper py-3.5 font-semibold hover:border-ink disabled:opacity-40"
      >
        장바구니 담기
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addToCart();
          router.push("/order");
        }}
        className="flex-1 rounded-xl bg-chili py-3.5 font-semibold text-white hover:bg-chili-dark disabled:opacity-40"
      >
        {item.is_soldout ? "품절" : "바로 주문"}
      </button>
    </div>
  );

  return (
    <div className="mt-8">
      <p className="mb-2 text-sm font-medium">중량</p>
      <div className="grid gap-2">
        {item.options.map((o) => {
          const on = o.label === option;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => {
                setOption(o.label);
                setAdded(false);
              }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
                on ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink/40"
              }`}
            >
              <span className="font-medium">{o.label}</span>
              <span className="font-semibold">{formatPrice(o.price)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <QtyStepper
          value={qty}
          onChange={(v) => {
            setQty(v);
            setAdded(false);
          }}
        />
        <p className="text-right">
          <span className="block text-xs text-ink-soft">상품 금액</span>
          <span className="font-serif text-2xl font-black">{formatPrice(total)}</span>
        </p>
      </div>

      <div className="mt-6 hidden md:block">{actions}</div>

      {added && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-cabbage/10 px-4 py-3 text-sm text-cabbage">
          <span>장바구니에 담았어요</span>
          <Link href="/order" className="font-semibold underline underline-offset-4">
            장바구니 보기
          </Link>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden">
        {actions}
      </div>
    </div>
  );
}
