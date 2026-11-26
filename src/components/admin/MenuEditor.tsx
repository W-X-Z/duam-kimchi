"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteMenuItem, saveMenuItem, type FormState } from "@/app/admin/actions";
import type { MenuItem } from "@/lib/types";
import ImageInput from "./ImageInput";

const WEIGHTS = ["500g", "1kg", "2kg", "3kg", "5kg", "10kg"];
const TAGS = ["", "대표", "인기", "계절 한정"];
const CUSTOM = "__custom";

type Status = "sale" | "soldout" | "hidden";
type Row = { key: number; weight: string; custom: string; price: string };

const commas = (d: string) => (d ? Number(d).toLocaleString("ko-KR") : "");

function initialRows(item: MenuItem | null): Row[] {
  const opts = item?.options?.length ? item.options : [{ label: "1kg", price: 0 }];
  return opts.map((o, i) => {
    const known = WEIGHTS.includes(o.label);
    return { key: i, weight: known ? o.label : CUSTOM, custom: known ? "" : o.label, price: o.price ? String(o.price) : "" };
  });
}

const box = "rounded-2xl bg-white p-4";
const label = "mb-2 block text-[15px] font-semibold text-ink";
const input =
  "h-14 w-full rounded-xl border border-black/15 bg-white px-4 text-[18px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/10";

export default function MenuEditor({ item }: { item: MenuItem | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMenuItem, {});
  const [rows, setRows] = useState<Row[]>(() => initialRows(item));
  const [nextKey, setNextKey] = useState(() => rows.length);
  const [tag, setTag] = useState(item?.tag ?? "");
  const [status, setStatus] = useState<Status>(
    !item ? "sale" : !item.is_visible ? "hidden" : item.is_soldout ? "soldout" : "sale",
  );

  const set = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <>
      <form action={action} className="space-y-3 pb-6">
        {item && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="tag" value={tag} />
        <input type="hidden" name="status" value={status} />

        <div className={box}>
          <ImageInput name="image" removeName="remove_image" current={item?.image_url ?? null} />
        </div>

        <div className={box}>
          <label className="block">
            <span className={label}>김치 이름</span>
            <input name="name" defaultValue={item?.name} required placeholder="예) 포기김치" className={input} />
          </label>
        </div>

        <div className={box}>
          <span className={label}>가격</span>
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.key} className="rounded-xl bg-[#f7f5f1] p-3">
                <input type="hidden" name="option_label" value={r.weight === CUSTOM ? r.custom.trim() : r.weight} />
                <div className="flex gap-2">
                  <div className="relative w-[7.5rem] shrink-0">
                    <select
                      value={r.weight}
                      onChange={(e) => set(r.key, { weight: e.target.value })}
                      aria-label="중량"
                      className={`${input} appearance-none pr-8`}
                    >
                      {WEIGHTS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                      <option value={CUSTOM}>직접 입력</option>
                    </select>
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft">▾</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      name="option_price"
                      value={commas(r.price)}
                      onChange={(e) => set(r.key, { price: e.target.value.replace(/[^0-9]/g, "").slice(0, 8) })}
                      inputMode="numeric"
                      placeholder="0"
                      aria-label="가격"
                      className={`${input} pr-10 text-right font-semibold tabular-nums`}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[17px] text-ink-soft">
                      원
                    </span>
                  </div>
                </div>
                {r.weight === CUSTOM && (
                  <input
                    value={r.custom}
                    onChange={(e) => set(r.key, { custom: e.target.value })}
                    placeholder="예) 1.5kg, 한 통"
                    aria-label="중량 직접 입력"
                    className={`${input} mt-2`}
                  />
                )}
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                    className="mt-2 px-1 py-1 text-[15px] text-chili"
                  >
                    이 중량 빼기
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              const used = new Set(rows.map((r) => r.weight));
              const next = WEIGHTS.find((w) => !used.has(w)) ?? CUSTOM;
              setRows((rs) => [...rs, { key: nextKey, weight: next, custom: "", price: "" }]);
              setNextKey((k) => k + 1);
            }}
            className="mt-3 h-12 w-full rounded-xl border-2 border-dashed border-black/15 text-[16px] font-medium text-ink-soft"
          >
            ＋ 다른 중량 추가
          </button>
        </div>

        <div className={box}>
          <span className={label}>판매 상태</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["sale", "판매 중"],
                ["soldout", "품절"],
                ["hidden", "숨기기"],
              ] as [Status, string][]
            ).map(([v, t]) => (
              <button
                key={v}
                type="button"
                onClick={() => setStatus(v)}
                className={`h-12 rounded-xl text-[16px] font-semibold ${
                  status === v
                    ? v === "sale"
                      ? "bg-cabbage text-white"
                      : "bg-ink text-white"
                    : "bg-[#f7f5f1] text-ink-soft"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={box}>
          <span className={label}>표시</span>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t || "none"}
                type="button"
                onClick={() => setTag(t)}
                className={`h-11 rounded-full px-4 text-[15px] font-medium ${
                  tag === t ? "bg-chili text-white" : "bg-[#f7f5f1] text-ink-soft"
                }`}
              >
                {t || "없음"}
              </button>
            ))}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3">
            {state.error && <p className="mb-2 text-[15px] font-medium text-chili">{state.error}</p>}
            <div className="flex gap-2">
              <Link href="/admin" className="flex h-14 items-center rounded-xl border border-black/15 px-5 text-[16px]">
                취소
              </Link>
              <button
                disabled={pending}
                className="h-14 flex-1 rounded-xl bg-ink text-[18px] font-semibold text-white disabled:opacity-50"
              >
                {pending ? "저장 중" : "저장"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {item && (
        <form
          action={deleteMenuItem}
          onSubmit={(e) => {
            if (!confirm(`'${item.name}'을(를) 메뉴판에서 지울까요?`)) e.preventDefault();
          }}
          className="pt-2 pb-28 text-center"
        >
          <input type="hidden" name="id" value={item.id} />
          <button className="px-4 py-3 text-[15px] text-chili underline underline-offset-2">이 김치 지우기</button>
        </form>
      )}
    </>
  );
}
