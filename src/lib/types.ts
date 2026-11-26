export type PriceOption = {
  label: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  detail: string;
  tag: string;
  image_url: string | null;
  options: PriceOption[];
  is_soldout: boolean;
  is_visible: boolean;
  sort_order: number;
};

export type SiteSettings = {
  shop_name: string;
  tagline: string;
  intro: string;
  hero_image_url: string | null;
  phone: string;
  kakao_url: string;
  instagram_url: string;
  address: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  order_guide: string;
  menu_intro: string;
  min_order_amount: number;
  shipping_fee_amount: number;
  free_shipping_over: number | null;
  shipping_guide: string;
  business_info: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  shop_name: "두암시장김치",
  tagline: "",
  intro: "",
  hero_image_url: null,
  phone: "",
  kakao_url: "",
  instagram_url: "",
  address: "",
  bank_name: "",
  account_number: "",
  account_holder: "",
  order_guide: "",
  menu_intro: "",
  min_order_amount: 0,
  shipping_fee_amount: 5000,
  free_shipping_over: null,
  shipping_guide: "",
  business_info: "",
};

/* ---------- Orders ---------- */

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "입금 대기",
  paid: "입금 확인",
  shipped: "발송 완료",
  cancelled: "취소",
};

export type OrderLine = {
  menu_id: string;
  name: string;
  option_label: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  order_no: string;
  customer_name: string;
  phone: string;
  depositor_name: string;
  zipcode: string;
  address: string;
  address_detail: string;
  memo: string;
  items: OrderLine[];
  items_total: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  tracking_no: string;
  created_at: string;
};

/** Cart entry kept in the browser. Prices are always recomputed from the DB. */
export type CartEntry = { menuId: string; option: string; qty: number };

/* ---------- Helpers ---------- */

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function shippingFeeFor(
  s: Pick<SiteSettings, "shipping_fee_amount" | "free_shipping_over">,
  itemsTotal: number,
) {
  if (itemsTotal <= 0) return 0;
  if (s.free_shipping_over && itemsTotal >= s.free_shipping_over) return 0;
  return s.shipping_fee_amount;
}

export function shippingLabel(s: Pick<SiteSettings, "shipping_fee_amount" | "free_shipping_over">) {
  const base = s.shipping_fee_amount > 0 ? `택배비 ${formatPrice(s.shipping_fee_amount)}` : "무료 배송";
  return s.free_shipping_over && s.shipping_fee_amount > 0
    ? `${base} · ${formatPrice(s.free_shipping_over)} 이상 무료`
    : base;
}

export function orderPolicyLabel(
  s: Pick<SiteSettings, "shipping_fee_amount" | "free_shipping_over" | "min_order_amount">,
) {
  const parts: string[] = [];
  if (s.min_order_amount > 0) parts.push(`최소 주문 ${formatPrice(s.min_order_amount)}`);
  parts.push(shippingLabel(s));
  return parts.join(" · ");
}

export function formatPhone(p: string) {
  const d = p.replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}
