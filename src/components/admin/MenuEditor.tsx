"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { deleteMenuItem, saveMenuItem, type FormState } from "@/app/admin/actions";
import type { MenuItem, PriceOption } from "@/lib/types";
import ImageInput from "./ImageInput";
import { Card, Field, inputCls } from "./fields";

type Row = { key: number; label: string; price: string };

export default function MenuEditor({ item }: { item: MenuItem | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMenuItem, {});
  const initial: PriceOption[] = item?.options?.length ? item.options : [{ label: "", price: 0 }];
  const [rows, setRows] = useState<Row[]>(
    initial.map((o, i) => ({ key: i, label: o.label, price: o.price ? String(o.price) : "" })),
  );
  const [nextKey, setNextKey] = useState(initial.length);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        {item && <input type="hidden" name="id" value={item.id} />}

        <Card>
          <Field label="메뉴 이름">
            <input name="name" defaultValue={item?.name} required className={inputCls} placeholder="포기김치" />
          </Field>
          <Field label="설명">
            <textarea name="description" defaultValue={item?.description} rows={2} className={inputCls} />
          </Field>
          <Field label="상품 정보 (한 줄에 하나)">
            <textarea name="detail" defaultValue={item?.detail} rows={4} className={inputCls} />
          </Field>
          <Field label="뱃지">
            <input name="tag" defaultValue={item?.tag} className={inputCls} placeholder="대표, 계절 한정" />
          </Field>
        </Card>

        <Card title="중량 · 가격">
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <input
                  name="option_label"
                  value={r.label}
                  onChange={(e) => update(r.key, { label: e.target.value })}
                  placeholder="2kg"
                  className={`${inputCls} w-28 shrink-0`}
                />
                <div className="relative flex-1">
                  <input
                    name="option_price"
                    value={r.price}
                    onChange={(e) => update(r.key, { price: e.target.value.replace(/[^0-9]/g, "") })}
                    inputMode="numeric"
                    placeholder="22000"
                    className={`${inputCls} pr-9 text-right`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-ink-soft">원</span>
                </div>
                <button
                  type="button"
                  disabled={rows.length === 1}
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                  className="h-10 w-10 shrink-0 rounded-xl text-ink-soft hover:bg-black/5 disabled:opacity-30"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setRows((rs) => [...rs, { key: nextKey, label: "", price: "" }]);
              setNextKey((k) => k + 1);
            }}
            className="text-sm font-medium text-chili"
          >
            + 중량 추가
          </button>
        </Card>

        <Card title="사진">
          <ImageInput name="image" removeName="remove_image" current={item?.image_url ?? null} />
        </Card>

        <Card>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="is_visible" defaultChecked={item ? item.is_visible : true} className="h-4 w-4 accent-ink" />
            <span>사이트에 보이기</span>
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="is_soldout" defaultChecked={item?.is_soldout} className="h-4 w-4 accent-ink" />
            <span>품절</span>
          </label>
        </Card>

        {state.error && <p className="text-sm text-chili">{state.error}</p>}

        <div className="flex gap-2">
          <Link href="/admin" className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm">
            취소
          </Link>
          <button disabled={pending} className="flex-1 rounded-xl bg-ink py-3 text-sm font-medium text-white disabled:opacity-50">
            {pending ? "저장 중" : "저장"}
          </button>
        </div>
      </form>

      {item && (
        <form
          action={deleteMenuItem}
          onSubmit={(e) => {
            if (!confirm(`'${item.name}' 메뉴를 삭제할까요?`)) e.preventDefault();
          }}
          className="pt-4 text-right"
        >
          <input type="hidden" name="id" value={item.id} />
          <button className="text-sm text-chili hover:underline">메뉴 삭제</button>
        </form>
      )}
    </div>
  );
}
