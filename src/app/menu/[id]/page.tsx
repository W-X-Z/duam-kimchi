/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMenu, getMenuItem, getSettings } from "@/lib/data";
import { lines, orderPolicyLabel } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import AddToCart from "./AddToCart";
import { jsonLdHtml, productDescription, productJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const menu = await getMenu();
  return menu.length ? menu.map((m) => ({ id: m.id })) : [{ id: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/menu/[id]">): Promise<Metadata> {
  const { id } = await params;
  const [item, s] = await Promise.all([getMenuItem(id), getSettings()]);
  if (!item) return {};
  const title = `${item.name} 택배 주문`;
  const description = productDescription(item, s);
  return {
    title,
    description,
    alternates: { canonical: `/menu/${item.id}` },
    openGraph: {
      title: `${title} | ${s.shop_name}`,
      description,
      url: `/menu/${item.id}`,
      images: item.image_url ? [item.image_url] : undefined,
    },
  };
}

export default async function MenuDetailPage({ params }: PageProps<"/menu/[id]">) {
  const { id } = await params;
  const [item, s] = await Promise.all([getMenuItem(id), getSettings()]);
  if (!item) notFound();

  const shipping = lines(s.shipping_guide);

  return (
    <div className="hanji min-h-dvh pb-28 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(productJsonLd(item, s))} />
      <SiteHeader shopName={s.shop_name} />

      <main className="mx-auto max-w-5xl px-5 pt-6 pb-16 md:pt-10">
        <Link href="/#menu" className="text-sm text-ink-soft hover:text-ink">
          ← 메뉴
        </Link>

        <div className="mt-5 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-[24px] bg-chili md:sticky md:top-20 md:self-start">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-serif text-[8rem] font-black text-paper/90">{item.name.slice(0, 1)}</span>
              </div>
            )}
            {item.is_soldout && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
                <span className="rounded-full border border-paper px-5 py-2 font-semibold text-paper">품절</span>
              </div>
            )}
          </div>

          <div>
            {item.tag && (
              <span className="inline-block rounded-full bg-chili/10 px-3 py-1 text-xs font-semibold text-chili">
                {item.tag}
              </span>
            )}
            <h1 className="mt-3 font-serif text-3xl font-black md:text-4xl">{item.name}</h1>
            {(s.menu_intro || s.intro) && (
              <p className="mt-3 text-[17px] leading-7 text-ink-soft">{s.menu_intro || s.intro}</p>
            )}

            <AddToCart item={item} />


            <section className="mt-8 border-t border-line pt-6">
              <h2 className="mb-3 font-semibold">배송</h2>
              <ul className="space-y-2 text-[15px] leading-7 text-ink-soft">
                <li>{orderPolicyLabel(s)}</li>
                {shipping.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
