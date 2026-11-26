"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveMenuBoard, type FormState } from "@/app/admin/actions";
import type { MenuItem } from "@/lib/types";

const MIN_ROWS = 15;

type Row = {
  key: number;
  id: string;
  name: string;
  weight: string;
  price: string;
  soldout: boolean;
  remove: boolean;
  hasPhoto: boolean;
};

const commas = (digits: string) => (digits ? Number(digits).toLocaleString("ko-KR") : "");

function toRows(menu: MenuItem[]): Row[] {
  const rows: Row[] = menu.map((m, i) => ({
    key: i,
    id: m.id,
    name: m.name,
    weight: m.options[0]?.label ?? "",
    price: m.options[0] ? String(m.options[0].price) : "",
    soldout: m.is_soldout,
    remove: false,
    hasPhoto: Boolean(m.image_url),
  }));
  const target = Math.max(MIN_ROWS, rows.length + 3);
  for (let i = rows.length; i < target; i++) {
    rows.push({ key: i, id: "", name: "", weight: "", price: "", soldout: false, remove: false, hasPhoto: false });
  }
  return rows;
}

const field =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-3 text-[17px] outline-none focus:border-ink focus:ring-2 focus:ring-ink/10";

export default function MenuBoard({ menu, saved }: { menu: MenuItem[]; saved: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveMenuBoard, {});
  const [rows, setRows] = useState<Row[]>(() => toRows(menu));

  const set = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const filled = rows.filter((r) => r.name.trim() && !r.remove).length;
  const hintKey = rows.find((r) => !r.id && !r.name && !r.weight && !r.price)?.key;

  return (
    <form action={action} className="pb-28">
      <input type="hidden" name="row_count" value={rows.length} />

      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-xl font-bold">김치 메뉴판</h1>
        <span className="text-sm text-ink-soft">{filled}가지</span>
      </div>

      {saved && !state.error && (
        <p className="mb-4 rounded-xl bg-cabbage/10 px-4 py-3 text-[15px] font-medium text-cabbage">저장했어요</p>
      )}

      <div className="hidden grid-cols-[2.5rem_1fr_7rem_9rem_5.5rem] gap-2 px-3 pb-2 text-sm font-medium text-ink-soft md:grid">
        <span />
        <span>김치 이름</span>
        <span>중량</span>
        <span>가격</span>
        <span />
      </div>

      <ol className="space-y-2.5">
        {rows.map((r, i) => (
          <li
            key={r.key}
            className={`rounded-2xl bg-white p-3 ${r.remove ? "opacity-50 ring-2 ring-chili/40" : ""}`}
          >
            <input type="hidden" name={`id_${i}`} value={r.id} />
            <div className="grid grid-cols-[2.5rem_1fr] gap-2 md:grid-cols-[2.5rem_1fr_7rem_9rem_5.5rem] md:items-center">
              <span className="flex h-12 items-center justify-center font-serif text-lg font-bold text-ink-soft">
                {i + 1}
              </span>

              <label className="block">
                <span className="mb-1 block text-sm text-ink-soft md:hidden">김치 이름</span>
                <input
                  name={`name_${i}`}
                  value={r.name}
                  onChange={(e) => set(r.key, { name: e.target.value })}
                  placeholder={r.key === hintKey ? "예) 포기김치" : ""}
                  className={field}
                />
              </label>

              <div className="col-start-2 grid grid-cols-[6.5rem_1fr] gap-2 md:col-start-auto md:contents">
                <label className="block">
                  <span className="mb-1 block text-sm text-ink-soft md:hidden">중량</span>
                  <input
                    name={`weight_${i}`}
                    value={r.weight}
                    onChange={(e) => set(r.key, { weight: e.target.value })}
                    placeholder={r.key === hintKey ? "1kg" : ""}
                    className={field}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm text-ink-soft md:hidden">가격</span>
                  <div className="relative">
                    <input
                      name={`price_${i}`}
                      value={commas(r.price)}
                      onChange={(e) => set(r.key, { price: e.target.value.replace(/[^0-9]/g, "").slice(0, 8) })}
                      inputMode="numeric"
                      placeholder={r.key === hintKey ? "10,000" : ""}
                      className={`${field} pr-9 text-right font-semibold tabular-nums`}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft">
                      원
                    </span>
                  </div>
                </label>
              </div>

              <div className="col-start-2 flex items-center gap-3 text-sm md:col-start-auto md:flex-col md:items-start md:gap-1">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name={`soldout_${i}`}
                    checked={r.soldout}
                    onChange={(e) => set(r.key, { soldout: e.target.checked })}
                    className="h-5 w-5 accent-ink"
                  />
                  품절
                </label>
                {r.id && (
                  <>
                    <Link href={`/admin/menu/${r.id}`} className="text-ink-soft underline underline-offset-2">
                      {r.hasPhoto ? "사진 변경" : "사진 넣기"}
                    </Link>
                    <label className="flex items-center gap-1.5 text-chili">
                      <input
                        type="checkbox"
                        name={`delete_${i}`}
                        checked={r.remove}
                        onChange={(e) => set(r.key, { remove: e.target.checked })}
                        className="h-5 w-5 accent-chili"
                      />
                      삭제
                    </label>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() =>
          setRows((rs) => {
            const start = rs.length ? Math.max(...rs.map((r) => r.key)) + 1 : 0;
            return [
              ...rs,
              ...Array.from({ length: 5 }, (_, k) => ({
                key: start + k,
                id: "",
                name: "",
                weight: "",
                price: "",
                soldout: false,
                remove: false,
                hasPhoto: false,
              })),
            ];
          })
        }
        className="mt-3 w-full rounded-2xl border-2 border-dashed border-black/15 py-4 text-[15px] font-medium text-ink-soft hover:border-ink/40"
      >
        + 칸 5개 더
      </button>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <p className="flex-1 text-[15px] text-chili">{state.error}</p>
          <button
            disabled={pending}
            className="rounded-xl bg-ink px-10 py-4 text-[17px] font-semibold text-white disabled:opacity-50"
          >
            {pending ? "저장 중" : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}
