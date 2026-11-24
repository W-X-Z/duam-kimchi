import type { Metadata } from "next";
import { getMenu, getSettings } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import OrderClient from "./OrderClient";

export const metadata: Metadata = { title: "주문하기", robots: { index: false } };

export default async function OrderPage() {
  const [s, menu] = await Promise.all([getSettings(), getMenu()]);
  return (
    <div className="hanji min-h-dvh">
      <SiteHeader shopName={s.shop_name} />
      <main className="mx-auto max-w-5xl px-5 pt-8 pb-16 md:pt-12">
        <h1 className="mb-8 font-serif text-3xl font-black">주문하기</h1>
        <OrderClient
          menu={menu}
          shipping={{ shipping_fee_amount: s.shipping_fee_amount, free_shipping_over: s.free_shipping_over }}
        />
      </main>
    </div>
  );
}
