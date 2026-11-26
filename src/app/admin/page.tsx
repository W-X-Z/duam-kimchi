/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminGetMenu } from "@/lib/data";
import { formatPrice } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import { moveMenuItem, toggleMenuFlag } from "./actions";

const SLOTS = 15;

export default async function AdminMenuPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const [menu, sp] = await Promise.all([adminGetMenu(), searchParams]);
  const empty = Math.max(SLOTS - menu.length, 1);

  return (
    <AdminShell active="menu">
      <div className="mb-4 flex items-end justify-between">
        <h1 className="text-[22px] font-bold">김치 메뉴판</h1>
        <span className="text-[15px] text-ink-soft">{menu.length}가지</span>
      </div>

      {sp.saved === "1" && (
        <p className="mb-4 rounded-2xl bg-cabbage/10 px-4 py-3.5 text-[16px] font-semibold text-cabbage">저장했어요</p>
      )}

      <ol className="space-y-2.5">
        {menu.map((item, i) => (
          <li key={item.id} className={`rounded-2xl bg-white ${item.is_visible ? "" : "opacity-60"}`}>
            <div className="flex items-stretch">
              <Link href={`/admin/menu/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3.5 p-3">
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-paper-2">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-serif text-2xl font-bold text-ink-soft">
                      {item.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="absolute top-1 left-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink/80 px-1.5 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[18px] font-bold">{item.name}</span>
                    {item.is_soldout && <span className="rounded-md bg-ink px-1.5 py-0.5 text-xs font-semibold text-white">품절</span>}
                    {!item.is_visible && <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-xs font-semibold">숨김</span>}
                  </div>
                  <div className="mt-1 space-y-0.5 text-[15px] text-ink-soft">
                    {item.options.map((o, k) => (
                      <p key={k}>
                        {o.label} <span className="font-semibold text-ink">{formatPrice(o.price)}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <span className="text-2xl text-ink-soft/50">›</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 border-t border-black/5 px-3 py-2">
              <form action={toggleMenuFlag} className="flex-1">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="field" value="is_soldout" />
                <input type="hidden" name="value" value={String(!item.is_soldout)} />
                <button
                  className={`h-11 w-full rounded-xl text-[15px] font-semibold ${
                    item.is_soldout ? "bg-cabbage text-white" : "bg-[#f7f5f1] text-ink"
                  }`}
                >
                  {item.is_soldout ? "다시 판매하기" : "품절로 바꾸기"}
                </button>
              </form>
              <MoveButton id={item.id} dir="up" disabled={i === 0} />
              <MoveButton id={item.id} dir="down" disabled={i === menu.length - 1} />
            </div>
          </li>
        ))}

        {Array.from({ length: empty }, (_, k) => (
          <li key={`empty-${k}`}>
            <Link
              href="/admin/menu/new"
              className="flex h-16 items-center gap-3.5 rounded-2xl border-2 border-dashed border-black/12 px-4 text-[16px] font-medium text-ink-soft"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-sm font-bold">
                {menu.length + k + 1}
              </span>
              ＋ 김치 추가
            </Link>
          </li>
        ))}
      </ol>
    </AdminShell>
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
        className="h-11 w-11 rounded-xl bg-[#f7f5f1] text-lg disabled:opacity-30"
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}
