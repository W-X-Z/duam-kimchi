/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminGetMenu } from "@/lib/data";
import { formatPrice } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import { moveMenuItem, toggleMenuFlag } from "./actions";

export default async function AdminMenuPage() {
  await requireAdmin();
  const menu = await adminGetMenu();

  return (
    <AdminShell active="menu">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">메뉴 {menu.length}개</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-xl bg-chili px-4 py-2 text-sm font-medium text-white hover:bg-chili-dark"
        >
          메뉴 추가
        </Link>
      </div>

      {menu.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-sm text-ink-soft">등록된 메뉴가 없습니다</p>
      ) : (
        <ul className="space-y-3">
          {menu.map((item, i) => (
            <li
              key={item.id}
              className={`flex gap-4 rounded-2xl bg-white p-4 ${item.is_visible ? "" : "opacity-60"}`}
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-2xl font-bold text-ink-soft">
                    {item.name.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.name}</p>
                  {item.tag && <span className="rounded bg-chili/10 px-1.5 py-0.5 text-xs text-chili">{item.tag}</span>}
                  {item.is_soldout && <span className="rounded bg-ink px-1.5 py-0.5 text-xs text-white">품절</span>}
                  {!item.is_visible && <span className="rounded bg-black/10 px-1.5 py-0.5 text-xs">숨김</span>}
                </div>
                <p className="mt-1 truncate text-sm text-ink-soft">
                  {item.options.map((o) => `${o.label} ${formatPrice(o.price)}`).join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link href={`/admin/menu/${item.id}`} className="rounded-lg border border-black/15 px-2.5 py-1 hover:bg-black/5">
                    수정
                  </Link>
                  <FlagButton id={item.id} field="is_soldout" value={!item.is_soldout} label={item.is_soldout ? "판매 재개" : "품절"} />
                  <FlagButton id={item.id} field="is_visible" value={!item.is_visible} label={item.is_visible ? "숨기기" : "보이기"} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <MoveButton id={item.id} dir="up" disabled={i === 0} />
                <MoveButton id={item.id} dir="down" disabled={i === menu.length - 1} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

function FlagButton({ id, field, value, label }: { id: string; field: string; value: boolean; label: string }) {
  return (
    <form action={toggleMenuFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(value)} />
      <button className="rounded-lg border border-black/15 px-2.5 py-1 hover:bg-black/5">{label}</button>
    </form>
  );
}

function MoveButton({ id, dir, disabled }: { id: string; dir: "up" | "down"; disabled: boolean }) {
  return (
    <form action={moveMenuItem}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button
        disabled={disabled}
        aria-label={dir === "up" ? "위로" : "아래로"}
        className="h-8 w-8 rounded-lg border border-black/15 text-sm hover:bg-black/5 disabled:opacity-30"
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}
