"use server";

import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase";
import { adminGetSettings } from "@/lib/data";
import { shippingFeeFor, type CartEntry, type MenuItem, type OrderLine } from "@/lib/types";

export type OrderFormState = { error?: string; field?: string };

function str(fd: FormData, key: string, max = 200) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function placeOrder(_: OrderFormState, fd: FormData): Promise<OrderFormState> {
  // Honeypot: bots fill every field.
  if (str(fd, "website")) return { error: "주문을 접수하지 못했어요." };

  const customer_name = str(fd, "customer_name", 30);
  const phone = str(fd, "phone", 20).replace(/[^0-9]/g, "");
  const zipcode = str(fd, "zipcode", 10);
  const address = str(fd, "address");
  const address_detail = str(fd, "address_detail");
  const depositor_name = str(fd, "depositor_name", 30) || customer_name;
  const memo = str(fd, "memo", 300);

  if (!customer_name) return { error: "받는 분 이름을 입력해 주세요.", field: "customer_name" };
  if (!/^01[0-9]{8,9}$/.test(phone)) return { error: "휴대폰 번호를 확인해 주세요.", field: "phone" };
  if (!address) return { error: "주소를 입력해 주세요.", field: "address" };
  if (fd.get("agree") !== "on") return { error: "주문 내용 확인에 동의해 주세요.", field: "agree" };

  let cart: CartEntry[] = [];
  try {
    cart = JSON.parse(String(fd.get("cart") ?? "[]"));
  } catch {}
  if (!Array.isArray(cart) || cart.length === 0) return { error: "장바구니가 비어 있어요." };
  if (cart.length > 30) return { error: "한 번에 주문할 수 있는 상품 수를 넘었어요." };

  const db = adminClient();
  const ids = [...new Set(cart.map((c) => String(c.menuId)))];
  const { data: menuRows, error: menuErr } = await db
    .from("menu_items")
    .select("id,name,options,is_soldout,is_visible")
    .in("id", ids);
  if (menuErr) return { error: "주문을 접수하지 못했어요. 잠시 후 다시 시도해 주세요." };

  const menu = new Map((menuRows as Pick<MenuItem, "id" | "name" | "options" | "is_soldout" | "is_visible">[]).map((m) => [m.id, m]));
  const items: OrderLine[] = [];
  for (const c of cart) {
    const m = menu.get(String(c.menuId));
    const opt = m?.options.find((o) => o.label === c.option);
    const qty = Math.floor(Number(c.qty));
    if (!m || !m.is_visible || !opt) return { error: "판매하지 않는 상품이 있어요. 장바구니를 확인해 주세요." };
    if (m.is_soldout) return { error: `${m.name}은(는) 품절이에요.` };
    if (!(qty >= 1 && qty <= 50)) return { error: "수량을 확인해 주세요." };
    items.push({ menu_id: m.id, name: m.name, option_label: opt.label, price: opt.price, qty });
  }

  const settings = await adminGetSettings();
  const items_total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping_fee = shippingFeeFor(settings, items_total);

  const { data, error } = await db
    .from("orders")
    .insert({
      customer_name,
      phone,
      depositor_name,
      zipcode,
      address,
      address_detail,
      memo,
      items,
      items_total,
      shipping_fee,
      total: items_total + shipping_fee,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "주문을 접수하지 못했어요. 잠시 후 다시 시도해 주세요." };
  redirect(`/order/${data.id}`);
}
