/* eslint-disable @next/next/no-img-element */
import { getMenu, getSettings } from "@/lib/data";
import { formatPrice, lines, type MenuItem } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

const SWATCHES = ["bg-chili", "bg-cabbage", "bg-ink", "bg-chili-dark"];

export default async function Home() {
  const [s, menu] = await Promise.all([getSettings(), getMenu()]);
  const tel = s.phone.replace(/[^0-9+]/g, "");
  const steps = lines(s.order_guide);
  const shipping = lines(s.shipping_guide);
  const business = lines(s.business_info);
  const hasAccount = Boolean(s.account_number);

  return (
    <div className="hanji pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
          <a href="#top" className="font-serif text-lg font-bold tracking-tight">
            {s.shop_name}
          </a>
          <nav className="flex items-center gap-5 text-sm text-ink-soft">
            <a href="#menu" className="hover:text-ink">메뉴</a>
            <a href="#order" className="hover:text-ink">주문 안내</a>
            {tel && (
              <a
                href={`tel:${tel}`}
                className="hidden rounded-full bg-chili px-4 py-1.5 font-medium text-white hover:bg-chili-dark md:inline-block"
              >
                전화 주문
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto max-w-5xl px-5 pt-12 pb-14 md:pt-20 md:pb-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-chili">
              <span className="h-px w-6 bg-chili" />
              택배 주문
            </p>
            <h1 className="font-serif text-4xl leading-tight font-black md:text-6xl">
              {s.tagline || s.shop_name}
            </h1>
            {s.intro && (
              <p className="mt-6 max-w-md text-[17px] leading-8 text-ink-soft">{s.intro}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink/85"
              >
                메뉴·가격 보기
              </a>
              {s.kakao_url ? (
                <a
                  href={s.kakao_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium hover:border-ink"
                >
                  카카오톡 주문
                </a>
              ) : tel ? (
                <a
                  href={`tel:${tel}`}
                  className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium hover:border-ink"
                >
                  전화 주문
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative">
            {s.hero_image_url ? (
              <img
                src={s.hero_image_url}
                alt={s.shop_name}
                className="aspect-[4/3] w-full rounded-[28px] object-cover md:aspect-[4/5] shadow-[0_30px_60px_-30px_rgba(43,33,27,0.5)]"
              />
            ) : (
              <div className="relative flex aspect-[4/3] md:aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[28px] bg-chili text-paper">
                <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-chili-dark/60" />
                <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-cabbage" />
                <span className="relative font-serif text-[7rem] leading-none font-black md:text-[9rem]">
                  김치
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="scroll-mt-14 border-y border-line/70 bg-paper-2/60">
        <div className="mx-auto max-w-5xl px-5 py-16 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl font-black md:text-4xl">메뉴 · 가격</h2>
            {s.shipping_fee && <p className="text-sm text-ink-soft">{s.shipping_fee}</p>}
          </div>

          {menu.length === 0 ? (
            <p className="py-16 text-center text-ink-soft">메뉴 준비 중입니다</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {menu.map((item, i) => (
                <MenuCard key={item.id} item={item} swatch={SWATCHES[i % SWATCHES.length]} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Order */}
      <section id="order" className="scroll-mt-14 mx-auto max-w-5xl px-5 py-16 md:py-20">
        <h2 className="mb-10 font-serif text-3xl font-black md:text-4xl">주문 안내</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {steps.length > 0 && (
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-sm font-bold text-paper">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-7">{step}</p>
                </li>
              ))}
            </ol>
          )}

          <div className="space-y-5">
            {hasAccount && (
              <div className="rounded-2xl bg-ink p-6 text-paper">
                <p className="text-sm text-paper/60">입금 계좌</p>
                <p className="mt-2 text-sm">{s.bank_name}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-xl font-semibold tracking-wide md:text-2xl">
                    {s.account_number}
                  </p>
                  <CopyButton
                    text={`${s.bank_name} ${s.account_number}`.trim()}
                    className="shrink-0 rounded-full bg-paper/15 px-3 py-1.5 text-xs hover:bg-paper/25"
                  />
                </div>
                {s.account_holder && (
                  <p className="mt-1 text-sm text-paper/70">예금주 {s.account_holder}</p>
                )}
              </div>
            )}

            {(shipping.length > 0 || s.shipping_fee) && (
              <div className="rounded-2xl border border-line bg-paper p-6">
                <p className="mb-3 font-medium">택배 배송</p>
                <ul className="space-y-2 text-[15px] text-ink-soft">
                  {s.shipping_fee && <li>· {s.shipping_fee}</li>}
                  {shipping.map((l, i) => (
                    <li key={i}>· {l}</li>
                  ))}
                </ul>
              </div>
            )}

            {(tel || s.kakao_url) && (
              <div className="flex gap-3">
                {tel && (
                  <a
                    href={`tel:${tel}`}
                    className="flex-1 rounded-2xl bg-chili px-5 py-4 text-center font-medium text-white hover:bg-chili-dark"
                  >
                    {s.phone}
                  </a>
                )}
                {s.kakao_url && (
                  <a
                    href={s.kakao_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-2xl bg-[#FEE500] px-5 py-4 text-center font-medium text-[#191919] hover:brightness-95"
                  >
                    카카오톡 문의
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line/70 bg-paper-2/60">
        <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-ink-soft">
          <p className="font-serif text-base font-bold text-ink">{s.shop_name}</p>
          {s.address && <p className="mt-2">{s.address}</p>}
          {business.length > 0 && (
            <div className="mt-4 space-y-1 text-xs leading-5">
              {business.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          )}
          {s.instagram_url && (
            <a
              href={s.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block underline underline-offset-4 hover:text-ink"
            >
              Instagram
            </a>
          )}
        </div>
      </footer>

      {/* Mobile action bar */}
      {(tel || s.kakao_url) && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden">
          {tel && (
            <a
              href={`tel:${tel}`}
              className="flex-1 rounded-xl bg-chili py-3 text-center text-[15px] font-medium text-white"
            >
              전화 주문
            </a>
          )}
          {s.kakao_url && (
            <a
              href={s.kakao_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-[#FEE500] py-3 text-center text-[15px] font-medium text-[#191919]"
            >
              카카오톡 주문
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MenuCard({ item, swatch }: { item: MenuItem; swatch: string }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="relative aspect-[4/3]">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${swatch}`}>
            <span className="font-serif text-6xl font-black text-paper/90">{item.name.slice(0, 1)}</span>
          </div>
        )}
        {item.tag && (
          <span className="absolute top-3 left-3 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-chili">
            {item.tag}
          </span>
        )}
        {item.is_soldout && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
            <span className="rounded-full border border-paper px-4 py-1.5 text-sm font-semibold text-paper">
              품절
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-bold">{item.name}</h3>
        {item.description && (
          <p className="mt-1.5 text-[15px] leading-6 text-ink-soft">{item.description}</p>
        )}
        <dl className="mt-auto divide-y divide-dashed divide-line pt-4">
          {item.options.map((o, i) => (
            <div key={i} className="flex items-baseline justify-between py-2">
              <dt className="text-[15px] text-ink-soft">{o.label}</dt>
              <dd className={`text-lg font-semibold ${item.is_soldout ? "text-ink-soft line-through" : ""}`}>
                {formatPrice(o.price)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </li>
  );
}
