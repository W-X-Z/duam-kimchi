"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import QtyStepper from "@/components/QtyStepper";
import { formatPrice, shippingFeeFor, type MenuItem, type SiteSettings } from "@/lib/types";
import { placeOrder, type OrderFormState } from "./actions";

type Shipping = Pick<SiteSettings, "shipping_fee_amount" | "free_shipping_over" | "min_order_amount">;

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (d: { zonecode: string; roadAddress: string; jibunAddress: string; buildingName?: string }) => void;
      }) => { open: () => void };
    };
  }
}

const POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function loadPostcode(): Promise<void> {
  if (window.daum?.Postcode) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = POSTCODE_SRC;
    el.onload = () => resolve();
    el.onerror = () => reject();
    document.head.appendChild(el);
  });
}

const input =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 outline-none placeholder:text-ink-soft/50 focus:border-ink";

export default function OrderClient({ menu, shipping }: { menu: MenuItem[]; shipping: Shipping }) {
  const { ready, entries, setQty, remove, replace } = useCart();
  const [state, action, pending] = useActionState<OrderFormState, FormData>(placeOrder, {});
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [depositor, setDepositor] = useState("");
  const [sameDepositor, setSameDepositor] = useState(true);

  const byId = useMemo(() => new Map(menu.map((m) => [m.id, m])), [menu]);

  const lines = entries.flatMap((e) => {
    const m = byId.get(e.menuId);
    const opt = m?.options.find((o) => o.label === e.option);
    return m && opt ? [{ entry: e, menu: m, price: opt.price }] : [];
  });

  // Drop entries whose menu or option no longer exists.
  useEffect(() => {
    if (ready && lines.length !== entries.length) replace(lines.map((l) => l.entry));
  }, [ready, lines, entries.length, replace]);

  const itemsTotal = lines.reduce((s, l) => s + (l.menu.is_soldout ? 0 : l.price * l.entry.qty), 0);
  const fee = shippingFeeFor(shipping, itemsTotal);
  const hasSoldout = lines.some((l) => l.menu.is_soldout);
  const remain = shipping.free_shipping_over && fee > 0 ? shipping.free_shipping_over - itemsTotal : 0;
  const belowMin = shipping.min_order_amount > 0 && itemsTotal < shipping.min_order_amount;

  if (!ready) return <div className="h-64" />;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-paper py-20 text-center">
        <p className="text-ink-soft">장바구니가 비어 있어요</p>
        <Link href="/#menu" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper">
          메뉴 보기
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
      <input type="hidden" name="cart" value={JSON.stringify(lines.map((l) => l.entry))} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="space-y-8">
        {/* Cart */}
        <section>
          <h2 className="mb-3 font-semibold">주문 상품</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
            {lines.map(({ entry, menu: m, price }) => (
              <li key={`${entry.menuId}-${entry.option}`} className="flex gap-4 p-4">
                <Link href={`/menu/${m.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-chili">
                  {m.image_url ? (
                    <img src={m.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-serif text-2xl font-black text-paper/90">
                      {m.name.slice(0, 1)}
                    </span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-ink-soft">
                        {entry.option} · {formatPrice(price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(entry.menuId, entry.option)}
                      className="text-sm text-ink-soft hover:text-ink"
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {m.is_soldout ? (
                      <span className="text-sm font-semibold text-chili">품절</span>
                    ) : (
                      <QtyStepper size="sm" value={entry.qty} onChange={(v) => setQty(entry.menuId, entry.option, v)} />
                    )}
                    <span className={`font-semibold ${m.is_soldout ? "text-ink-soft line-through" : ""}`}>
                      {formatPrice(price * entry.qty)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/#menu" className="mt-3 inline-block text-sm text-ink-soft hover:text-ink">
            + 메뉴 더 담기
          </Link>
        </section>

        {/* Customer */}
        <section className="space-y-3">
          <h2 className="font-semibold">받는 분</h2>
          <input
            name="customer_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            autoComplete="name"
            required
            className={input}
          />
          <input name="phone" placeholder="휴대폰 번호" inputMode="tel" autoComplete="tel" required className={input} />
          <div className="flex gap-2">
            <input
              name="zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="우편번호"
              className={`${input} w-32`}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await loadPostcode();
                  new window.daum!.Postcode({
                    oncomplete: (d) => {
                      setZipcode(d.zonecode);
                      setAddress((d.roadAddress || d.jibunAddress) + (d.buildingName ? ` (${d.buildingName})` : ""));
                      document.querySelector<HTMLInputElement>('input[name="address_detail"]')?.focus();
                    },
                  }).open();
                } catch {}
              }}
              className="shrink-0 rounded-xl border border-ink/20 bg-paper px-4 text-sm font-medium hover:border-ink"
            >
              주소 검색
            </button>
          </div>
          <input
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소"
            autoComplete="street-address"
            required
            className={input}
          />
          <input name="address_detail" placeholder="상세 주소" className={input} />
          <textarea name="memo" rows={2} placeholder="배송 요청사항" className={input} />
        </section>

        {/* Payment */}
        <section className="space-y-3">
          <h2 className="font-semibold">결제</h2>
          <div className="flex items-center justify-between rounded-xl border border-ink bg-paper px-4 py-3.5">
            <span className="font-medium">계좌이체</span>
            <span className="h-4 w-4 rounded-full border-[5px] border-ink" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sameDepositor}
              onChange={(e) => setSameDepositor(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            입금자명이 받는 분과 같아요
          </label>
          {sameDepositor ? (
            <input type="hidden" name="depositor_name" value={name} />
          ) : (
            <input
              name="depositor_name"
              value={depositor}
              onChange={(e) => setDepositor(e.target.value)}
              placeholder="입금자명"
              required
              className={input}
            />
          )}
        </section>
      </div>

      {/* Summary */}
      <aside className="rounded-2xl bg-ink p-6 text-paper md:sticky md:top-20">
        <h2 className="mb-4 font-semibold">결제 금액</h2>
        <dl className="space-y-2.5 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-paper/70">상품 금액</dt>
            <dd>{formatPrice(itemsTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-paper/70">택배비</dt>
            <dd>{fee ? formatPrice(fee) : "무료"}</dd>
          </div>
          {remain > 0 && (
            <p className="text-right text-xs text-paper/60">{formatPrice(remain)} 더 담으면 무료 배송</p>
          )}
        </dl>
        <div className="my-5 h-px bg-paper/15" />
        <div className="flex items-baseline justify-between">
          <span className="text-paper/70">총 입금액</span>
          <span className="font-serif text-3xl font-black">{formatPrice(itemsTotal + fee)}</span>
        </div>

        <label className="mt-6 flex items-start gap-2 text-sm text-paper/80">
          <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 accent-chili" />
          주문 내용을 확인했어요
        </label>

        {state.error && <p className="mt-4 rounded-lg bg-chili/20 px-3 py-2 text-sm text-[#ffb4a6]">{state.error}</p>}
        {hasSoldout && <p className="mt-4 text-sm text-[#ffb4a6]">품절 상품을 빼고 주문해 주세요</p>}
        {belowMin && !hasSoldout && (
          <p className="mt-4 text-sm text-[#ffb4a6]">
            최소 주문 금액은 {formatPrice(shipping.min_order_amount)}이에요 ·{" "}
            {formatPrice(shipping.min_order_amount - itemsTotal)} 더 담아 주세요
          </p>
        )}

        <button
          disabled={pending || hasSoldout || belowMin || itemsTotal === 0}
          className="mt-5 w-full rounded-xl bg-chili py-4 text-[17px] font-semibold text-white hover:bg-chili-dark disabled:opacity-50"
        >
          {pending ? "주문 중" : `${formatPrice(itemsTotal + fee)} 주문하기`}
        </button>
      </aside>
    </form>
  );
}
