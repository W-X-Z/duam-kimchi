import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, getSettings } from "@/lib/data";
import { formatPhone, formatPrice, ORDER_STATUS_LABEL } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import CopyButton from "@/components/CopyButton";
import ClearCart from "./ClearCart";

export const metadata: Metadata = { title: "주문 완료", robots: { index: false } };

export default async function OrderDonePage({ params }: PageProps<"/order/[id]">) {
  const s = await getSettings();
  return (
    <div className="hanji min-h-dvh">
      <SiteHeader shopName={s.shop_name} />
      <main className="mx-auto max-w-xl px-5 pt-10 pb-16">
        <Suspense fallback={<div className="h-96" />}>
          <OrderDetail params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, s] = await Promise.all([getOrder(id), getSettings()]);
  if (!order) notFound();

  const pending = order.status === "pending";
  const account = `${s.bank_name} ${s.account_number}`.trim();

  return (
    <>
      <ClearCart orderId={order.id} />
      <div className="text-center">
        <p className="text-sm font-medium text-chili">주문번호 {order.order_no}</p>
        <h1 className="mt-2 font-serif text-3xl font-black">
          {pending ? "주문이 접수됐어요" : ORDER_STATUS_LABEL[order.status]}
        </h1>
        {pending && <p className="mt-3 text-ink-soft">입금이 확인되면 담가서 보내드릴게요</p>}
      </div>

      <section className="mt-8 rounded-2xl bg-ink p-6 text-paper">
        <div className="flex items-baseline justify-between">
          <span className="text-paper/70">입금하실 금액</span>
          <span className="flex items-center gap-2">
            <span className="font-serif text-3xl font-black">{formatPrice(order.total)}</span>
            <CopyButton
              text={String(order.total)}
              className="rounded-full bg-paper/15 px-2.5 py-1 text-xs hover:bg-paper/25"
            />
          </span>
        </div>
        <div className="my-5 h-px bg-paper/15" />
        {s.account_number ? (
          <dl className="space-y-3 text-[15px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-paper/70">입금 계좌</dt>
              <dd className="flex items-center gap-2 text-right">
                <span className="font-mono font-semibold">{account}</span>
                <CopyButton text={account} className="rounded-full bg-paper/15 px-2.5 py-1 text-xs hover:bg-paper/25" />
              </dd>
            </div>
            {s.account_holder && (
              <div className="flex justify-between">
                <dt className="text-paper/70">예금주</dt>
                <dd>{s.account_holder}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-paper/70">입금자명</dt>
              <dd className="font-semibold">{order.depositor_name}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-[15px] text-paper/80">
            입금 계좌는 {s.phone ? `${s.phone}로 ` : ""}문자로 안내드려요
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-paper p-6">
        <h2 className="mb-4 font-semibold">주문 내역</h2>
        <ul className="space-y-2 text-[15px]">
          {order.items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span>
                {i.name} <span className="text-ink-soft">{i.option_label} × {i.qty}</span>
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
          <li className="flex justify-between text-ink-soft">
            <span>택배비</span>
            <span>{order.shipping_fee ? formatPrice(order.shipping_fee) : "무료"}</span>
          </li>
        </ul>
        <div className="my-4 h-px bg-line" />
        <dl className="space-y-1.5 text-[15px]">
          <div className="flex gap-4">
            <dt className="w-16 shrink-0 text-ink-soft">받는 분</dt>
            <dd>
              {order.customer_name} · {formatPhone(order.phone)}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-16 shrink-0 text-ink-soft">주소</dt>
            <dd>
              {order.zipcode && `(${order.zipcode}) `}
              {order.address} {order.address_detail}
            </dd>
          </div>
          {order.tracking_no && (
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-ink-soft">송장번호</dt>
              <dd>{order.tracking_no}</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="mt-8 flex gap-3">
        {(s.kakao_url || s.phone) && (
          <a
            href={s.kakao_url || `tel:${s.phone.replace(/[^0-9]/g, "")}`}
            target={s.kakao_url ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border border-ink/20 bg-paper py-3.5 text-center font-medium hover:border-ink"
          >
            문의하기
          </a>
        )}
        <Link href="/" className="flex-1 rounded-xl bg-ink py-3.5 text-center font-medium text-paper">
          홈으로
        </Link>
      </div>
    </>
  );
}
