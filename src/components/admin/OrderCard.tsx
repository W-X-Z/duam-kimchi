"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrder, type FormState } from "@/app/admin/actions";
import CopyButton from "@/components/CopyButton";
import { formatPhone, formatPrice, ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  shipped: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-black/10 text-ink-soft",
};

function when(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function OrderCard({ order: o }: { order: Order }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrder, {});
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, state.at, router]);
  const fullAddress = `${o.zipcode ? `(${o.zipcode}) ` : ""}${o.address} ${o.address_detail}`.trim();
  const summary = o.items.map((i) => `${i.name} ${i.option_label}×${i.qty}`).join(", ");

  return (
    <li className="rounded-2xl bg-white">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              <span className="font-mono text-ink-soft">{o.order_no}</span>
              <span className="text-ink-soft">{when(o.created_at)}</span>
            </div>
            <p className="mt-1.5 font-semibold">
              {o.customer_name}
              {o.depositor_name !== o.customer_name && (
                <span className="ml-1.5 text-sm font-normal text-ink-soft">입금자 {o.depositor_name}</span>
              )}
            </p>
            <p className="mt-0.5 truncate text-sm text-ink-soft">{summary}</p>
          </div>
          <div className="text-right">
            <p className="font-bold tabular-nums">{formatPrice(o.total)}</p>
            <span className="mt-1 inline-block text-xs text-ink-soft group-open:rotate-180">▾</span>
          </div>
        </summary>

        <div className="space-y-4 border-t border-black/5 p-4 text-sm">
          <ul className="space-y-1">
            {o.items.map((i, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {i.name} {i.option_label} × {i.qty}
                </span>
                <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
            <li className="flex justify-between text-ink-soft">
              <span>택배비</span>
              <span className="tabular-nums">{formatPrice(o.shipping_fee)}</span>
            </li>
          </ul>

          <dl className="space-y-1.5 rounded-xl bg-[#f7f5f1] p-3">
            <Row label="연락처" value={formatPhone(o.phone)} href={`tel:${o.phone}`} />
            <Row label="주소" value={fullAddress} copy />
            {o.memo && <Row label="요청" value={o.memo} />}
          </dl>

          <form action={action} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={o.id} />
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="rounded-lg border border-black/15 bg-white px-2.5 py-2"
            >
              {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <input
              name="tracking_no"
              defaultValue={o.tracking_no}
              placeholder="송장번호"
              className="min-w-0 flex-1 rounded-lg border border-black/15 px-2.5 py-2"
            />
            <button disabled={pending} className="rounded-lg bg-ink px-4 py-2 font-medium text-white disabled:opacity-50">
              {pending ? "저장 중" : "저장"}
            </button>
            {state.ok && <span className="text-cabbage">저장됨</span>}
            {state.error && <span className="text-chili">{state.error}</span>}
          </form>
        </div>
      </details>
    </li>
  );
}

function Row({ label, value, href, copy }: { label: string; value: string; href?: string; copy?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-12 shrink-0 text-ink-soft">{label}</dt>
      <dd className="flex-1">{href ? <a href={href} className="underline underline-offset-2">{value}</a> : value}</dd>
      {copy && <CopyButton text={value} className="shrink-0 text-xs text-ink-soft hover:text-ink" />}
    </div>
  );
}
